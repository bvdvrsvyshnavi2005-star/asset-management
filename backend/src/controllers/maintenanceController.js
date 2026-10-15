import Maintenance from "../models/Maintenance.js";
import Asset from "../models/Asset.js";
import { HttpError } from "../utils/httpError.js";
import { pageResult, parsePagination } from "../utils/query.js";
import { logHistory } from "../services/historyService.js";

export const listMaintenance = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.asset) filter.asset = String(req.query.asset);
  const p = parsePagination(req.query);
  const [data, total] = await Promise.all([
    Maintenance.find(filter)
      .populate("asset", "assetId name category")
      .populate("createdBy", "name")
      .sort({ startedAt: -1 })
      .skip(p.skip)
      .limit(p.limit),
    Maintenance.countDocuments(filter),
  ]);
  res.json(pageResult(data, total, p));
};

export const createMaintenance = async (req, res) => {
  const asset = await Asset.findById(req.body.asset);
  if (!asset) throw new HttpError(404, "Asset not found");
  if (asset.status === "MAINTENANCE") throw new HttpError(409, "Asset is already under maintenance");
  if (asset.status === "RETIRED") throw new HttpError(409, "Retired assets cannot be sent for maintenance");

  const record = await Maintenance.create({ ...req.body, createdBy: req.user._id });
  asset.status = "MAINTENANCE"; // assignedTo is kept so the user is not lost
  await asset.save();
  await logHistory({ asset, action: "MAINTENANCE_STARTED", user: req.user, details: `${record.type}: ${record.description}` });
  res.status(201).json(record);
};

export const completeMaintenance = async (req, res) => {
  const record = await Maintenance.findById(req.params.id);
  if (!record) throw new HttpError(404, "Maintenance record not found");
  if (record.status === "COMPLETED") throw new HttpError(409, "Already completed");

  record.status = "COMPLETED";
  record.completedAt = new Date();
  if (req.body.cost !== undefined) record.cost = req.body.cost;
  await record.save();

  const asset = await Asset.findById(record.asset);
  if (asset) {
    asset.status = asset.assignedTo ? "ASSIGNED" : "AVAILABLE";
    await asset.save();
    await logHistory({ asset, action: "MAINTENANCE_COMPLETED", user: req.user, details: req.body.note || record.description });
  }
  res.json(record);
};
