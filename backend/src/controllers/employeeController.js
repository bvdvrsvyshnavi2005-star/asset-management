import Employee from "../models/Employee.js";
import Asset from "../models/Asset.js";
import { HttpError } from "../utils/httpError.js";
import { escapeRegex, pageResult, parsePagination, parseSort } from "../utils/query.js";

export const listEmployees = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.department) filter.department = String(req.query.department);
  if (req.query.search) {
    const re = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [{ name: re }, { email: re }, { employeeId: re }];
  }
  const p = parsePagination(req.query, { defaultLimit: 10, maxLimit: 200 });
  const sort = parseSort(req.query.sort, ["name", "employeeId", "department", "createdAt"], { name: 1 });
  const [data, total] = await Promise.all([
    Employee.find(filter).sort(sort).skip(p.skip).limit(p.limit),
    Employee.countDocuments(filter),
  ]);
  res.json(pageResult(data, total, p));
};

export const getEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new HttpError(404, "Employee not found");
  const assets = await Asset.find({ assignedTo: employee._id }).select("assetId name category status");
  res.json({ ...employee.toObject(), assets });
};

export const createEmployee = async (req, res) => {
  res.status(201).json(await Employee.create(req.body));
};

export const updateEmployee = async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!employee) throw new HttpError(404, "Employee not found");
  res.json(employee);
};

export const deleteEmployee = async (req, res) => {
  if (await Asset.exists({ assignedTo: req.params.id })) {
    throw new HttpError(409, "Employee still has assigned assets. Return or transfer them first.");
  }
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) throw new HttpError(404, "Employee not found");
  res.json({ message: "Employee deleted" });
};
