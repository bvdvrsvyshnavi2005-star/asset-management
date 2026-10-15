import { HttpError } from "../utils/httpError.js";

// Role-based access control. Use after `protect`.
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, "Not authenticated"));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission to perform this action"));
    }
    next();
  };
