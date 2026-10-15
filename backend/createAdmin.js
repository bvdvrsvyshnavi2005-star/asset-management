import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";

await mongoose.connect(process.env.MONGO_URI);
await User.create({
  name: "Vyshu",
  email: "vyshu@gmail.com",
  password: "vyshu@123",
  role: "ADMIN",
});
console.log("Admin created");
process.exit(0);