import mongoose from "mongoose";
import Asset from "../models/Asset.js";
import AssetHistory from "../models/AssetHistory.js";
import { HttpError } from "../utils/httpError.js";
import { addDays, escapeRegex, pageResult, parsePagination, parseSort } from "../utils/query.js";
import { assignAsset, nextAssetId, returnAsset, transferAsset } from "../services/assetService.js";
import { logHistory } from "../services/historyService.js";

const SORTABLE = ["assetId", "name", "category", "brand", "status", "warrantyEnd", "purchaseDate", "createdAt"];

// EMPLOYEE users may only see assets assigned to their linked employee record.
export const scopeFor = (user) => {
  if (user.role !== "EMPLOYEE") return {};
  return user.employee ? { assignedTo: user.employee } : { _id: { $in: [] } };
};

const buildFilter = (req) => {
  const q = req.query;
  const filter = { ...scopeFor(req.user) };
  if (q.status) filter.status = String(q.status);
  if (q.category) filter.category = String(q.category);
  if (q.assignedTo && req.user.role !== "EMPLOYEE") filter.assignedTo = String(q.assignedTo);
  if (q.search) {
    const re = new RegExp(escapeRegex(q.search), "i");
    filter.$or = [{ assetId: re }, { name: re }, { brand: re }, { model: re }, { serialNumber: re }];
  }
  const days = Number(q.warrantyWithinDays);
  if (Number.isFinite(days) && days > 0) {
    filter.warrantyEnd = { $gte: new Date(), $lte: addDays(days) };
    filter.status = filter.status || { $ne: "RETIRED" };
  }
  return filter;
};

// Accepts either a Mongo _id or the human asset code (e.g. AST-00012).
// isObjectIdOrHexString (not isValidObjectId): the latter is true for ANY 12-char string,
// which would misread a 12-character custom asset code such as LAPTOP-00001 as an _id.
const findAsset = async (idOrCode) => {
  const query = mongoose.isObjectIdOrHexString(idOrCode)
    ? { _id: idOrCode }
    : { assetId: String(idOrCode).toUpperCase() };
  const asset = await Asset.findOne(query);
  if (!asset) throw new HttpError(404, "Asset not found");
  return asset;
};

const assertCanView = (user, asset) => {
  if (user.role !== "EMPLOYEE") return;
  if (!user.employee || asset.assignedTo?.toString() !== user.employee.toString()) {
    throw new HttpError(403, "You can only view assets assigned to you");
  }
};

export const listAssets = async (req, res) => {
  const filter = buildFilter(req);
  const p = parsePagination(req.query);
  const sort = parseSort(req.query.sort, SORTABLE);
  const [data, total] = await Promise.all([
    Asset.find(filter).populate("assignedTo", "employeeId name email department").sort(sort).skip(p.skip).limit(p.limit),
    Asset.countDocuments(filter),
  ]);
  res.json(pageResult(data, total, p));
};

export const getAsset = async (req, res) => {
  const asset = await findAsset(req.params.id);
  assertCanView(req.user, asset);
  await asset.populate("assignedTo", "employeeId name email department");
  res.json(asset);
};

export const createAsset = async (req, res) => {
  const assetId = req.body.assetId || (await nextAssetId());
  const asset = await Asset.create({ ...req.body, assetId, status: "AVAILABLE" });
  await logHistory({ asset, action: "CREATED", user: req.user });
  res.status(201).json(asset);
};

export const updateAsset = async (req, res) => {
  const asset = await findAsset(req.params.id);
  const { status, ...rest } = req.body;

  if (status && status !== asset.status) {
    if (asset.status === "ASSIGNED" || asset.status === "MAINTENANCE") {
      throw new HttpError(409, `Cannot change status while asset is ${asset.status}. Return it or finish maintenance first.`);
    }
    asset.status = status;
  }
  asset.set(rest);
  await asset.save();
  await logHistory({ asset, action: "UPDATED", user: req.user, details: status ? `Status: ${status}` : "" });
  res.json(asset);
};

export const deleteAsset = async (req, res) => {
  const asset = await findAsset(req.params.id);
  await logHistory({ asset, action: "DELETED", user: req.user, from: asset.assignedTo, details: asset.name });
  await asset.deleteOne();
  res.json({ message: "Asset deleted" });
};

export const assign = async (req, res) => {
  const asset = await findAsset(req.params.id);
  res.json(await assignAsset(asset, req.body.employeeId, req.user, req.body.note));
};

export const transfer = async (req, res) => {
  const asset = await findAsset(req.params.id);
  res.json(await transferAsset(asset, req.body.employeeId, req.user, req.body.note));
};

export const giveBack = async (req, res) => {
  const asset = await findAsset(req.params.id);
  res.json(await returnAsset(asset, req.user, req.body?.note));
};

export const assetHistory = async (req, res) => {
  const asset = await findAsset(req.params.id);
  assertCanView(req.user, asset);
  const history = await AssetHistory.find({ asset: asset._id })
    .populate("from to", "employeeId name")
    .populate("performedBy", "name role")
    .sort({ createdAt: -1 });
  res.json(history);
};
