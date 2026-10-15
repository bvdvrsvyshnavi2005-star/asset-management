import dotenv from "dotenv";
import { checkJwtSecret } from "../utils/secret.js";
dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const secretProblem = checkJwtSecret(process.env.JWT_SECRET, process.env.NODE_ENV || "development");
if (secretProblem) throw new Error(secretProblem);

export const env = {
  port: Number(process.env.PORT) || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
