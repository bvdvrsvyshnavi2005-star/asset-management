import Asset from "../models/Asset.js";
import { addDays } from "../utils/query.js";

// `scope` is a Mongo filter restricting which assets are counted (used for EMPLOYEE users).
export const getAssetStats = async (scope = {}, expiringDays = 30) => {
  const now = new Date();
  const [byStatus, byCategory, expiring, expired] = await Promise.all([
    Asset.aggregate([{ $match: scope }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Asset.aggregate([{ $match: scope }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
    Asset.countDocuments({ ...scope, status: { $ne: "RETIRED" }, warrantyEnd: { $gte: now, $lte: addDays(expiringDays) } }),
    Asset.countDocuments({ ...scope, status: { $ne: "RETIRED" }, warrantyEnd: { $lt: now } }),
  ]);

  const status = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const total = byStatus.reduce((sum, s) => sum + s.count, 0);

  return {
    total,
    available: status.AVAILABLE || 0,
    assigned: status.ASSIGNED || 0,
    maintenance: status.MAINTENANCE || 0,
    retired: status.RETIRED || 0,
    warrantyExpiring: expiring,
    warrantyExpired: expired,
    expiringDays: expiringDays,
    byStatus: byStatus.map((s) => ({ name: s._id, value: s.count })),
    byCategory: byCategory.map((c) => ({ name: c._id, value: c.count })),
  };
};
