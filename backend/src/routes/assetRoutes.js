import express from "express";

const router = express.Router();

// Temporary test route
router.get("/test", (req, res) => {
  res.json({ message: "Asset routes working" });
});

export default router;