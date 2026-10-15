import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { signToken } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  // Same message for unknown email / wrong password to avoid account enumeration.
  if (!user || !(await user.matchPassword(password))) {
    throw new HttpError(401, "Invalid email or password");
  }
  res.json({ token: signToken(user), user });
};

export const me = async (req, res) => {
  await req.user.populate("employee", "employeeId name department");
  res.json(req.user);
};

// ADMIN only: create a login for a new user.
export const register = async (req, res) => {
  if (req.body.employee && !(await Employee.exists({ _id: req.body.employee }))) {
    throw new HttpError(404, "Linked employee not found");
  }
  const user = await User.create(req.body);
  res.status(201).json(user);
};

export const changePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(req.body.currentPassword))) {
    throw new HttpError(400, "Current password is incorrect");
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: "Password updated" });
};

export const listUsers = async (_req, res) => {
  const users = await User.find().populate("employee", "employeeId name").sort({ createdAt: -1 });
  res.json(users);
};
