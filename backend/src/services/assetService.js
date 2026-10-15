import Asset from "../models/Asset.js";
import Counter from "../models/Counter.js";
import Employee from "../models/Employee.js";
import { HttpError } from "../utils/httpError.js";
import { logHistory } from "./historyService.js";
import { assertCanAssign, assertCanReturn, assertCanTransfer } from "./assetRules.js";

export const nextAssetId = async () => {
  const c = await Counter.findOneAndUpdate(
    { _id: "asset" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `AST-${String(c.seq).padStart(5, "0")}`;
};

const getActiveEmployee = async (employeeId) => {
  const emp = await Employee.findById(employeeId);
  if (!emp) throw new HttpError(404, "Employee not found");
  if (emp.status !== "ACTIVE") throw new HttpError(409, "Cannot assign assets to an inactive employee");
  return emp;
};

// Compare-and-set: the change only applies if the asset is still in the state we validated.
// Two simultaneous requests can no longer both succeed (the loser gets a 409).
const applyIfUnchanged = async (filter, update) => {
  const updated = await Asset.findOneAndUpdate(filter, update, { new: true, runValidators: true });
  if (!updated) throw new HttpError(409, "Asset was changed by someone else. Reload and try again.");
  return updated;
};

export const assignAsset = async (asset, employeeId, user, note = "") => {
  assertCanAssign(asset);
  const emp = await getActiveEmployee(employeeId);
  const updated = await applyIfUnchanged(
    { _id: asset._id, status: "AVAILABLE" },
    { status: "ASSIGNED", assignedTo: emp._id }
  );
  await logHistory({ asset: updated, action: "ASSIGNED", user, to: emp._id, details: note || `Assigned to ${emp.name}` });
  return updated;
};

export const transferAsset = async (asset, employeeId, user, note = "") => {
  assertCanTransfer(asset, employeeId);
  const emp = await getActiveEmployee(employeeId);
  const from = asset.assignedTo;
  const updated = await applyIfUnchanged(
    { _id: asset._id, status: "ASSIGNED", assignedTo: from },
    { assignedTo: emp._id }
  );
  await logHistory({ asset: updated, action: "TRANSFERRED", user, from, to: emp._id, details: note || `Transferred to ${emp.name}` });
  return updated;
};

export const returnAsset = async (asset, user, note = "") => {
  assertCanReturn(asset);
  const from = asset.assignedTo;
  const updated = await applyIfUnchanged(
    { _id: asset._id, status: "ASSIGNED", assignedTo: from },
    { status: "AVAILABLE", assignedTo: null }
  );
  await logHistory({ asset: updated, action: "RETURNED", user, from, details: note || "Returned to IT stock" });
  return updated;
};
