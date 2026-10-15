import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import { listAssets } from "../services/assetService";
import { completeMaintenance, createMaintenance, listMaintenance } from "../services/maintenanceService";
import { errorMessage } from "../services/api";

function NewMaintenanceDialog({ onClose, onSaved }) {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ asset: "", type: "REPAIR", description: "", vendor: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listAssets({ limit: 100, sort: "assetId" })
      .then((r) => setAssets(r.data.filter((a) => a.status === "AVAILABLE" || a.status === "ASSIGNED")))
      .catch((e) => toast.error(errorMessage(e)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createMaintenance(form);
      toast.success("Maintenance logged");
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <form className="modal-box space-y-3" onSubmit={submit}>
        <h3 className="text-lg font-bold">Log maintenance</h3>
        <select className="select select-bordered w-full" required value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })}>
          <option value="">Select asset...</option>
          {assets.map((a) => <option key={a._id} value={a._id}>{a.assetId} - {a.name}</option>)}
        </select>
        <select className="select select-bordered w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option>REPAIR</option><option>UPGRADE</option><option>INSPECTION</option>
        </select>
        <textarea className="textarea textarea-bordered w-full" required placeholder="What needs to be done?" maxLength={1000}
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input input-bordered w-full" placeholder="Vendor (optional)" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </dialog>
  );
}

export default function MaintenancePage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(() => {
    setError("");
    listMaintenance({ status, page, limit: 10 }).then(setResult).catch((e) => setError(errorMessage(e)));
  }, [status, page]);
  useEffect(load, [load]);

  const complete = async (rec) => {
    const input = window.prompt("Final cost (leave empty if none):", rec.cost || "");
    if (input === null) return;
    const cost = input === "" ? undefined : Number(input);
    if (cost !== undefined && (Number.isNaN(cost) || cost < 0)) return toast.error("Enter a valid cost");
    try {
      await completeMaintenance(rec._id, { cost });
      toast.success("Marked as completed");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Maintenance" subtitle="Repairs, upgrades and inspections">
        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}><Plus size={16} /> Log maintenance</button>
      </PageHeader>
      <select className="select select-bordered mb-4" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
        <option value="">All</option><option>OPEN</option><option>COMPLETED</option>
      </select>

      {error && <ErrorState message={error} onRetry={load} />}
      {!result && !error ? <Spinner /> : result && (
        <div className="card bg-base-100 shadow">
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Asset</th><th>Type</th><th>Description</th><th>Vendor</th><th>Started</th><th>Cost</th><th>Status</th><th /></tr></thead>
              <tbody>
                {result.data.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-base-content/60">No records.</td></tr>}
                {result.data.map((m) => (
                  <tr key={m._id}>
                    <td>{m.asset ? <Link className="link link-primary" to={`/assets/${m.asset._id}`}>{m.asset.assetId}</Link> : "(deleted)"}</td>
                    <td>{m.type}</td><td className="max-w-xs truncate">{m.description}</td><td>{m.vendor || "-"}</td>
                    <td>{new Date(m.startedAt).toLocaleDateString()}</td><td>{m.cost || "-"}</td>
                    <td><StatusBadge value={m.status} /></td>
                    <td>{m.status === "OPEN" && <button className="btn btn-xs btn-success" onClick={() => complete(m)}>Complete</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={result.page} pages={result.pages} total={result.total} onChange={setPage} /></div>
        </div>
      )}
      {showNew && <NewMaintenanceDialog onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} />}
    </>
  );
}
