import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export const signToken = (user) =>
  jwt.sign({ id: user._id.toString() }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// Verifies the Bearer token and attaches the current user to req.user.
export const protect = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Authentication required");

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new HttpError(401, "Invalid or expired token");
    }

    const user = await User.findById(payload.id);
    if (!user) throw new HttpError(401, "User no longer exists");
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
