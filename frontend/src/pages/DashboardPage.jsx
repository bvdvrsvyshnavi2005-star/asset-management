import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import { getDashboard } from "../services/reportService";
import { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = { AVAILABLE: "#16a34a", ASSIGNED: "#2563eb", MAINTENANCE: "#f59e0b", RETIRED: "#9ca3af" };

const Stat = ({ label, value, tone = "" }) => (
  <div className="stat rounded-box bg-base-100 shadow">
    <div className="stat-title">{label}</div>
    <div className={`stat-value ${tone}`}>{value}</div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    getDashboard().then(setData).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Spinner />;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={user.role === "EMPLOYEE" ? "Your assigned assets" : "Overview of all IT assets"} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Total Assets" value={data.total} />
        <Stat label="Available" value={data.available} tone="text-success" />
        <Stat label="Assigned" value={data.assigned} tone="text-info" />
        <Stat label="Under Maintenance" value={data.maintenance} tone="text-warning" />
        <Stat label="Warranty Expiring (30d)" value={data.warrantyExpiring} tone="text-error" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-base">By status</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                    {data.byStatus.map((s) => <Cell key={s.name} fill={STATUS_COLORS[s.name] || "#64748b"} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-base">By category</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={data.byCategory}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6 bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Warranties expiring in the next 30 days</h2>
          {data.expiringSoon.length === 0 ? (
            <p className="text-sm text-base-content/60">Nothing expiring soon.</p>
          ) : (
            <ul className="divide-y">
              {data.expiringSoon.map((a) => (
                <li key={a._id} className="flex items-center justify-between py-2 text-sm">
                  <Link className="link link-primary" to={`/assets/${a._id}`}>{a.assetId} - {a.name}</Link>
                  <span>{new Date(a.warrantyEnd).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
