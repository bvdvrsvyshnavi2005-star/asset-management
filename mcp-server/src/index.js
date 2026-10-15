import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { apiGet } from "./api.js";

const server = new McpServer({ name: "it-asset-manager", version: "1.0.0" });

const text = (data) => ({ content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] });
const fail = (err) => ({ isError: true, content: [{ type: "text", text: `Error: ${err.message}` }] });

// Keep tool output compact so the model's context isn't flooded.
const slim = (a) => ({
  assetId: a.assetId, name: a.name, category: a.category, serialNumber: a.serialNumber, status: a.status,
  assignedTo: a.assignedTo ? `${a.assignedTo.name} (${a.assignedTo.employeeId})` : null,
  warrantyEnd: a.warrantyEnd ? a.warrantyEnd.slice(0, 10) : null, location: a.location,
});

const run = (fn) => async (args) => {
  try { return text(await fn(args)); } catch (err) { return fail(err); }
};

server.registerTool(
  "get_asset",
  {
    description: "Get full details of one asset by its asset ID (e.g. AST-00012) or serial number lookup via search_assets.",
    inputSchema: { assetId: z.string().describe("Asset ID such as AST-00012") },
  },
  run(async ({ assetId }) => {
    const a = await apiGet(`/assets/${encodeURIComponent(assetId)}`);
    return { ...slim(a), brand: a.brand, model: a.model, purchaseDate: a.purchaseDate?.slice(0, 10), notes: a.notes };
  })
);

server.registerTool(
  "search_assets",
  {
    description: "Search/filter assets. Matches name, brand, model, serial number or asset ID. Returns up to `limit` results.",
    inputSchema: {
      query: z.string().optional().describe("Free-text search"),
      category: z.enum(["LAPTOP", "DESKTOP", "MOBILE", "TABLET", "MONITOR", "PERIPHERAL", "OTHER"]).optional(),
      status: z.enum(["AVAILABLE", "ASSIGNED", "MAINTENANCE", "RETIRED"]).optional(),
      limit: z.number().int().min(1).max(50).default(20),
    },
  },
  run(async ({ query, category, status, limit }) => {
    const r = await apiGet("/assets", { search: query, category, status, limit });
    return { total: r.total, results: r.data.map(slim) };
  })
);

server.registerTool(
  "get_employee_assets",
  {
    description: "List assets currently assigned to an employee. Look the employee up by name, email or employee ID (e.g. EMP-001).",
    inputSchema: { employee: z.string().describe("Employee name, email or employee ID") },
  },
  run(async ({ employee }) => {
    const found = await apiGet("/employees", { search: employee, limit: 5 });
    if (found.total === 0) return `No employee matches "${employee}".`;
    if (found.total > 1) {
      return { message: "Multiple employees match; please be more specific.", matches: found.data.map((e) => `${e.name} (${e.employeeId}, ${e.email})`) };
    }
    const emp = found.data[0];
    const assets = await apiGet("/assets", { assignedTo: emp._id, limit: 50 });
    return { employee: `${emp.name} (${emp.employeeId})`, total: assets.total, assets: assets.data.map(slim) };
  })
);

server.registerTool(
  "get_expiring_warranties",
  {
    description: "List non-retired assets whose warranty ends within the next N days, soonest first. Optionally filter by category (e.g. LAPTOP).",
    inputSchema: {
      days: z.number().int().min(1).max(365).default(30),
      category: z.enum(["LAPTOP", "DESKTOP", "MOBILE", "TABLET", "MONITOR", "PERIPHERAL", "OTHER"]).optional(),
    },
  },
  run(async ({ days, category }) => {
    const r = await apiGet("/assets", { warrantyWithinDays: days, category, sort: "warrantyEnd", limit: 50 });
    return { withinDays: days, total: r.total, results: r.data.map(slim) };
  })
);

server.registerTool(
  "get_asset_statistics",
  {
    description: "Summary counts: total, available, assigned, under maintenance, retired, warranty expiring/expired, plus breakdown by category.",
    inputSchema: {},
  },
  run(async () => {
    const { expiringSoon: _omit, ...stats } = await apiGet("/dashboard");
    return stats;
  })
);

// stdout is reserved for the MCP protocol - log to stderr only.
await server.connect(new StdioServerTransport());
console.error("it-asset-manager MCP server running on stdio");
