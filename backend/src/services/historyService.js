import AssetHistory from "../models/AssetHistory.js";

export const logHistory = ({ asset, action, user, from = null, to = null, details = "" }) =>
  AssetHistory.create({
    asset: asset._id,
    assetCode: asset.assetId,
    action,
    from,
    to,
    performedBy: user?._id,
    details,
  });
