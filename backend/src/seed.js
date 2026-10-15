import mongoose from "mongoose";
import { connectDB } from "./config/db.js";

import User from "./models/User.js";
import Employee from "./models/Employee.js";
import Asset from "./models/Asset.js";
import Maintenance from "./models/Maintenance.js";
import AssetHistory from "./models/AssetHistory.js";
import Counter from "./models/Counter.js";

import { nextAssetId } from "./services/assetService.js";

const password = process.env.SEED_PASSWORD || "ChangeMe123!";
const TOTAL_ASSETS = 24;

const daysFromNow = (d) => new Date(Date.now() + d * 86400000);

// Prevent accidental production seeding
if (process.env.NODE_ENV === "production") {
  if (process.env.ALLOW_PRODUCTION_SEED !== "true" || !process.env.SEED_PASSWORD) {
    console.error(
      "Refusing to seed in production: this wipes users, employees, assets and history.\n" +
        "To override, set ALLOW_PRODUCTION_SEED=true and a non-default SEED_PASSWORD."
    );
    process.exit(1);
  }
}

const catalog = [
  ["LAPTOP", "Dell", "Latitude 7440"],
  ["LAPTOP", "Apple", "MacBook Pro 14"],
  ["LAPTOP", "Lenovo", "ThinkPad T14"],
  ["DESKTOP", "HP", "EliteDesk 800"],
  ["MOBILE", "Apple", "iPhone 15"],
  ["MOBILE", "Samsung", "Galaxy S24"],
  ["TABLET", "Apple", "iPad Air"],
  ["MONITOR", "Dell", "U2723QE"],
  ["PERIPHERAL", "Logitech", "MX Keys"],
];

const warrantyOffsets = [-40, 10, 25, 200, 400, 700, 20, 90, 365];

async function seed() {
  await connectDB();

  // Wipe old data
  await Promise.all(
    [User, Employee, Asset, Maintenance, AssetHistory, Counter].map((m) =>
      m.deleteMany({})
    )
  );

  // Drop indexes that no longer exist in the schema (e.g. stale assetId_1)
  // and build the ones that do
  await Asset.syncIndexes();

  // ---------------- EMPLOYEES ----------------
  const employees = await Employee.insertMany([
    { employeeId: "EMP-001", name: "Priya Sharma", email: "priya@example.com", department: "Engineering", jobTitle: "Software Engineer" },
    { employeeId: "EMP-002", name: "Marcus Lee", email: "marcus@example.com", department: "Finance", jobTitle: "Analyst" },
    { employeeId: "EMP-003", name: "Sofia Alvarez", email: "sofia@example.com", department: "HR", jobTitle: "HR Manager" },
    { employeeId: "EMP-004", name: "Tom Becker", email: "tom@example.com", department: "Engineering", jobTitle: "DevOps Engineer" },
  ]);

  // ---------------- USERS ----------------
  // create() (not insertMany) so password-hashing hooks run
  await User.create([
    { name: "Admin User", email: "admin@example.com", password, role: "ADMIN" },
    { name: "IT Staff", email: "it@example.com", password, role: "IT_STAFF" },
    { name: "Priya Sharma", email: "priya@example.com", password, role: "EMPLOYEE", employee: employees[0]._id },
  ]);

  // ---------------- ASSETS ----------------
  let assignedIdx = 0;

  for (let i = 0; i < TOTAL_ASSETS; i++) {
    const [category, brand, model] = catalog[i % catalog.length];

    const asset = {
      assetId: await nextAssetId(),
      assetTag: `AST-${String(i + 1).padStart(3, "0")}`,
      name: `${brand} ${model}`,
      category,
      brand,
      model,
      serialNumber: `SN-${100000 + i * 37}`,
      purchaseDate: daysFromNow(-365 * 2 + i * 10),
      warrantyEnd: daysFromNow(warrantyOffsets[i % warrantyOffsets.length]),
      location: i % 2 ? "HQ - Floor 2" : "HQ - Floor 1",
      status: "Available",
    };

    if (i % 11 === 10) {
      asset.status = "Maintenance";
    } else if (i === TOTAL_ASSETS - 1) {
      asset.status = "Retired";
    } else if (i % 3 === 0) {
      asset.status = "Assigned";
      asset.assignedTo = employees[assignedIdx % employees.length]._id;
      assignedIdx++;
    }

    const doc = await Asset.create(asset);

    await AssetHistory.create({
      asset: doc._id,
      assetCode: doc.assetTag,
      action: "CREATED",
      details: "Seeded",
    });

    if (doc.status === "Maintenance") {
      await Maintenance.create({
        asset: doc._id,
        type: "REPAIR",
        description: "Battery / screen issue",
        vendor: "Local repair shop",
      });
    }
  }

  console.log(
    `Seeded ${employees.length} employees, 3 users and ${TOTAL_ASSETS} assets.\n\n` +
      `Logins (password: ${password}):\n` +
      `  Admin:    admin@example.com\n` +
      `  IT Staff: it@example.com\n` +
      `  Employee: priya@example.com`
  );
}

try {
  await seed();
} catch (err) {
  console.error("Seeding failed:", err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}