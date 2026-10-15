export const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "-createdAt" => { createdAt: -1 }. Only whitelisted fields are accepted.
export const parseSort = (sortParam, allowed, fallback = { createdAt: -1 }) => {
  if (!sortParam || typeof sortParam !== "string") return fallback;
  const desc = sortParam.startsWith("-");
  const field = desc ? sortParam.slice(1) : sortParam;
  if (!allowed.includes(field)) return fallback;
  return { [field]: desc ? -1 : 1 };
};

export const parsePagination = (query, { defaultLimit = 10, maxLimit = 100 } = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

export const pageResult = (data, total, { page, limit }) => ({
  data,
  page,
  limit,
  total,
  pages: Math.max(Math.ceil(total / limit), 1),
});

export const addDays = (days, from = new Date()) => new Date(from.getTime() + days * 86400000);

// Cells starting with these characters are run as formulas by Excel/Sheets (CSV injection).
const FORMULA_START = /^[=+\-@\t\r]/;

export const csvEscape = (v) => {
  if (v === null || v === undefined) return "";
  let s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
  if (typeof v === "string" && FORMULA_START.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
