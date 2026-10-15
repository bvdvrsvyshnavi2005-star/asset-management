import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
    type: { type: String, enum: ["REPAIR", "UPGRADE", "INSPECTION"], default: "REPAIR" },
    description: { type: String, required: true, trim: true },
    vendor: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["OPEN", "COMPLETED"], default: "OPEN", index: true },
    cost: { type: Number, min: 0, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);
