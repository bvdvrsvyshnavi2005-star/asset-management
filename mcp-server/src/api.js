// Tiny REST client with lazy login + one re-login on 401. No secrets are logged.
const API_URL = process.env.API_URL || "http://localhost:5001/api";
let token = null;

const login = async () => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.MCP_API_EMAIL, password: process.env.MCP_API_PASSWORD }),
  });
  if (!res.ok) throw new Error(`MCP login failed (${res.status}). Check MCP_API_EMAIL / MCP_API_PASSWORD.`);
  token = (await res.json()).token;
};

export const apiGet = async (path, params = {}, retry = true) => {
  if (!token) await login();
  const url = new URL(`${API_URL}${path}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401 && retry) {
    token = null;
    return apiGet(path, params, false);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }
  return res.json();
};
