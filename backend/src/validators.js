import { z } from "zod";
import { CATEGORIES } from "./models/Asset.js";
import { ROLES } from "./models/User.js";

const objectId = z.string().regex (/^[a-f\d]{24}$/i, "Invalid id");
const emptyToNull = (v) => (v === "" ? null : v);
const dateField = z.preprocess(emptyToNull, z.union([z.null(), z.coerce.date()]).optional());
const text = (max = 200) => z.string().trim().max(max);

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: text(100).min(1),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  role: z.enum(ROLES).default("EMPLOYEE"),
  employee: z.preprocess(emptyToNull, objectId.nullable().optional()),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const employeeSchema = z.object({
  employeeId: text(30).min(1),
  name: text(100).min(1),
  email: z.string().trim().email(),
  department: text().optional(),
  jobTitle: text().optional(),
  phone: text(40).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const assetSchema = z.object({
  assetId: z.preprocess(emptyToNull, text(30).nullable().optional()),
  name: text().min(1),
  category: z.enum(CATEGORIES),
  brand: text().optional(),
  model: text().optional(),
  serialNumber: text().min(1),
  purchaseDate: dateField,
  warrantyEnd: dateField,
  location: text().optional(),
  notes: text(1000).optional(),
});

// Updates may also retire / un-retire an asset (checked in the controller).
export const assetUpdateSchema = assetSchema
  .omit({ assetId: true })
  .partial()
  .extend({ status: z.enum(["AVAILABLE", "RETIRED"]).optional() });

export const assignSchema = z.object({ employeeId: objectId, note: text(500).optional() });
export const transferSchema = assignSchema;
export const returnSchema = z.object({ note: text(500).optional() });

export const maintenanceSchema = z.object({
  asset: objectId,
  type: z.enum(["REPAIR", "UPGRADE", "INSPECTION"]).default("REPAIR"),
  description: text(1000).min(1),
  vendor: text().optional(),
});

export const maintenanceCompleteSchema = z.object({
  cost: z.coerce.number().min(0).optional(),
  note: text(500).optional(),
});
