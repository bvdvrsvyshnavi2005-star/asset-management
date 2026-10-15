import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import * as V from "../validators.js";
import * as auth from "../controllers/authController.js";
import * as assets from "../controllers/assetController.js";
import * as employees from "../controllers/employeeController.js";
import * as maintenance from "../controllers/maintenanceController.js";
import * as reports from "../controllers/reportController.js";

const router = Router();
const staff = authorize("ADMIN", "IT_STAFF");
const admin = authorize("ADMIN");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" },
});

router.get("/health", (_req, res) => res.json({ status: "ok" }));

// --- auth
router.post("/auth/login", loginLimiter, validate(V.loginSchema), auth.login);
router.get("/auth/me", protect, auth.me);
router.put("/auth/password", protect, validate(V.passwordSchema), auth.changePassword);
router.post("/auth/register", protect, admin, validate(V.registerSchema), auth.register);
router.get("/users", protect, admin, auth.listUsers);

// --- assets (EMPLOYEE can read only their own)
router.get("/assets", protect, assets.listAssets);
router.post("/assets", protect, staff, validate(V.assetSchema), assets.createAsset);
router.get("/assets/:id", protect, assets.getAsset);
router.put("/assets/:id", protect, staff, validate(V.assetUpdateSchema), assets.updateAsset);
router.delete("/assets/:id", protect, admin, assets.deleteAsset);
router.get("/assets/:id/history", protect, assets.assetHistory);
router.post("/assets/:id/assign", protect, staff, validate(V.assignSchema), assets.assign);
router.post("/assets/:id/transfer", protect, staff, validate(V.transferSchema), assets.transfer);
router.post("/assets/:id/return", protect, staff, validate(V.returnSchema), assets.giveBack);

// --- employees
router.get("/employees", protect, staff, employees.listEmployees);
router.post("/employees", protect, staff, validate(V.employeeSchema), employees.createEmployee);
router.get("/employees/:id", protect, staff, employees.getEmployee);
router.put("/employees/:id", protect, staff, validate(V.employeeSchema.partial()), employees.updateEmployee);
router.delete("/employees/:id", protect, admin, employees.deleteEmployee);

// --- maintenance
router.get("/maintenance", protect, staff, maintenance.listMaintenance);
router.post("/maintenance", protect, staff, validate(V.maintenanceSchema), maintenance.createMaintenance);
router.put("/maintenance/:id/complete", protect, staff, validate(V.maintenanceCompleteSchema), maintenance.completeMaintenance);

// --- dashboard & reports
router.get("/dashboard", protect, reports.dashboard);
router.get("/reports/assets.csv", protect, staff, reports.assetsCsv);
router.get("/audit", protect, staff, reports.auditLog);

export default router;
