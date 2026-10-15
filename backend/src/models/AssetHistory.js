import mongoose from "mongoose";

export const ACTIONS = [
  "CREATED",
  "UPDATED",
  "ASSIGNED",
  "TRANSFERRED",
  "RETURNED",
  "MAINTENANCE_STARTED",
  "MAINTENANCE_COMPLETED",
  "DELETED",
];

// Append-only audit trail. assetCode is denormalised so entries stay readable after an asset is deleted.
const historySchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", index: true },
    assetCode: { type: String, required: true },
    action: { type: String, enum: ACTIONS, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("AssetHistory", historySchema);
