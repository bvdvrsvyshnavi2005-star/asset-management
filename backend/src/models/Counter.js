import mongoose from "mongoose";

// Atomic sequence generator (used for human-friendly asset IDs).
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", counterSchema);
