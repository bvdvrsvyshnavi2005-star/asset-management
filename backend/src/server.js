import app from "./app.js";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

connectDB().then(() => {
  app.listen(env.port, () => console.log(`API listening on :${env.port} (${env.nodeEnv})`));
});
