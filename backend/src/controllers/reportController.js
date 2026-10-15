import Asset from "../models/Asset.js";
import AssetHistory from "../models/AssetHistory.js";
import { getAssetStats } from "../services/statsService.js";
import { scopeFor } from "./assetController.js";
import { csvEscape, pageResult, parsePagination } from "../utils/query.js";

export const dashboard = async (req, res) => {
  const scope = scopeFor(req.user);
  const stats = await getAssetStats(scope, 30);
  const expiringSoon = await Asset.find({
    ...scope,
    status: { $ne: "RETIRED" },
    warrantyEnd: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 86400000) },
  })
    .populate("assignedTo", "name")
    .sort({ warrantyEnd: 1 })
    .limit(5)
    .select("assetId name category warrantyEnd assignedTo");
  res.json({ ...stats, expiringSoon });
};

export const assetsCsv = async (_req, res) => {
  const assets = await Asset.find().populate("assignedTo", "employeeId name").sort({ assetId: 1 });
  const header = ["assetId", "name", "category", "brand", "model", "serialNumber", "status", "assignedTo", "purchaseDate", "warrantyEnd", "location"];
  const rows = assets.map((a) =>
    [a.assetId, a.name, a.category, a.brand, a.model, a.serialNumber, a.status, a.assignedTo?.name, a.purchaseDate, a.warrantyEnd, a.location]
      .map(csvEscape)
      .join(",")
  );
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="assets.csv"');
  res.send([header.join(","), ...rows].join("\n"));
};

export const auditLog = async (req, res) => {
  const filter = {};
  if (req.query.action) filter.action = String(req.query.action);
  const p = parsePagination(req.query, { defaultLimit: 15 });
  const [data, total] = await Promise.all([
    AssetHistory.find(filter)
      .populate("from to", "employeeId name")
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 })
      .skip(p.skip)
      .limit(p.limit),
    AssetHistory.countDocuments(filter),
  ]);
  res.json(pageResult(data, total, p));
};
