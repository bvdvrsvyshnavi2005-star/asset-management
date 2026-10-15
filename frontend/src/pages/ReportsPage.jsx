import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { listAssets } from "../services/assetService";
import { downloadAssetsCsv, getAuditLog } from "../services/reportService";
import { errorMessage } from "../services/api";

export default function ReportsPage() {
  const [days, setDays] = useState(30);
  const [expiring, setExpiring] = useState(null);
  const [audit, setAudit] = useState(null);
  const [auditPage, setAuditPage] = useState(1);
  const [error, setError] = useState("");

  const loadExpiring = useCallback(() => {
    listAssets({ warrantyWithinDays: days, sort: "warrantyEnd", limit: 50 })
      .then(setExpiring).catch((e) => setError(errorMessage(e)));
  }, [days]);
  const loadAudit = useCallback(() => {
    getAuditLog({ page: auditPage, limit: 10 }).then(setAudit).catch((e) => setError(errorMessage(e)));
  }, [auditPage]);
  useEffect(loadExpiring, [loadExpiring]);
  useEffect(loadAudit, [loadAudit]);

  const exportCsv = async () => {
    try { await downloadAssetsCsv(); } catch (e) { toast.error(errorMessage(e)); }
  };

  if (error) return <ErrorState message={error} onRetry={() => { setError(""); loadExpiring(); loadAudit(); }} />;

  return (
    <>
      <PageHeader title="Reports" subtitle="Warranty tracking and audit log">
        <button className="btn btn-sm" onClick={exportCsv}><Download size={16} /> Export assets CSV</button>
      </PageHeader>

      <div className="card mb-6 bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-base">Warranty expiring within</h2>
            <select className="select select-bordered select-sm" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option>
            </select>
          </div>
          {!expiring ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead><tr><th>Asset</th><th>Name</th><th>Assigned to</th><th>Warranty end</th></tr></thead>
                <tbody>
                  {expiring.data.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-base-content/60">No warranties expiring in this window.</td></tr>}
                  {expiring.data.map((a) => (
                    <tr key={a._id}>
                      <td><Link className="link link-primary" to={`/assets/${a._id}`}>{a.assetId}</Link></td>
                      <td>{a.name}</td><td>{a.assignedTo?.name || "-"}</td><td>{new Date(a.warrantyEnd).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Audit log</h2>
          {!audit ? <Spinner /> : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead><tr><th>When</th><th>Asset</th><th>Action</th><th>By</th><th>Details</th></tr></thead>
                  <tbody>
                    {audit.data.map((h) => (
                      <tr key={h._id}>
                        <td>{new Date(h.createdAt).toLocaleString()}</td>
                        <td>{h.assetCode}</td>
                        <td><StatusBadge value={h.action.replaceAll("_", " ")} /></td>
                        <td>{h.performedBy?.name || "system"}</td>
                        <td className="max-w-xs truncate">{h.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={audit.page} pages={audit.pages} total={audit.total} onChange={setAuditPage} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
