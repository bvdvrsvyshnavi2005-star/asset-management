import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";
import { listAssets } from "../services/assetService";
import { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const CATEGORIES = ["LAPTOP", "DESKTOP", "MOBILE", "TABLET", "MONITOR", "PERIPHERAL", "OTHER"];
export const STATUSES = ["AVAILABLE", "ASSIGNED", "MAINTENANCE", "RETIRED"];

export default function AssetsPage() {
  const { isStaff } = useAuth();
  const [filters, setFilters] = useState({ search: "", status: "", category: "", sort: "-createdAt" });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const search = useDebounce(filters.search);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    listAssets({ search, status: filters.status, category: filters.category, sort: filters.sort, page, limit: 10 })
      .then(setResult)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [search, filters.status, filters.category, filters.sort, page]);
  useEffect(load, [load]);

  const set = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Assets" subtitle="Search, filter and manage hardware">
        {isStaff && (
          <Link to="/assets/new" className="btn btn-primary btn-sm"><Plus size={16} /> Add Asset</Link>
        )}
      </PageHeader>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <input className="input input-bordered" placeholder="Search name, serial, asset ID..." value={filters.search} onChange={set("search")} />
        <select className="select select-bordered" value={filters.status} onChange={set("status")}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="select select-bordered" value={filters.category} onChange={set("category")}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="select select-bordered" value={filters.sort} onChange={set("sort")}>
          <option value="-createdAt">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="warrantyEnd">Warranty ending soonest</option>
          <option value="-warrantyEnd">Warranty ending latest</option>
          <option value="status">Status</option>
        </select>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && !result ? (
        <Spinner />
      ) : (
        result && (
          <div className="card bg-base-100 shadow">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>Asset ID</th><th>Name</th><th>Category</th><th>Serial</th><th>Status</th><th>Assigned to</th><th>Warranty end</th></tr>
                </thead>
                <tbody>
                  {result.data.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-base-content/60">No assets found.</td></tr>
                  )}
                  {result.data.map((a) => (
                    <tr key={a._id} className="hover">
                      <td><Link className="link link-primary" to={`/assets/${a._id}`}>{a.assetId}</Link></td>
                      <td>{a.name}</td>
                      <td>{a.category}</td>
                      <td className="font-mono text-xs">{a.serialNumber}</td>
                      <td><StatusBadge value={a.status} /></td>
                      <td>{a.assignedTo?.name || "-"}</td>
                      <td>{a.warrantyEnd ? new Date(a.warrantyEnd).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination page={result.page} pages={result.pages} total={result.total} onChange={setPage} />
            </div>
          </div>
        )
      )}
    </>
  );
}
