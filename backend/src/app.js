import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";
import assetRoutes from "./routes/assetRoutes.js";

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
app.set("trust proxy", 1); // behind nginx / a load balancer
app.use(helmet());
app.use(cors({ origin: env.clientOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use(
  "/api",
  rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false })
);
app.get("/", (req, res) => {
  res.json({
    message:"IT assest manager API is working"
  });
});  
app.use("/api", routes);
app.use("/api/asset", assetRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
