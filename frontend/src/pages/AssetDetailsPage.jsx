import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import EmployeePickerDialog from "../components/EmployeePickerDialog";
import { assignAsset, deleteAsset, getAsset, getAssetHistory, returnAsset, transferAsset } from "../services/assetService";
import { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "-");

export default function AssetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff, isAdmin } = useAuth();
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null); // "assign" | "transfer" | null

  const load = useCallback(() => {
    setError("");
    Promise.all([getAsset(id), getAssetHistory(id)])
      .then(([a, h]) => { setAsset(a); setHistory(h); })
      .catch((e) => setError(errorMessage(e)));
  }, [id]);
  useEffect(load, [load]);

  const act = async (fn, okMsg) => {
    try {
      await fn();
      toast.success(okMsg);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${asset.assetId}? This cannot be undone.`)) return;
    try {
      await deleteAsset(asset._id);
      toast.success("Asset deleted");
      navigate("/assets");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!asset) return <Spinner />;

  const rows = [
    ["Asset ID", asset.assetId], ["Category", asset.category], ["Brand", asset.brand || "-"], ["Model", asset.model || "-"],
    ["Serial number", asset.serialNumber], ["Location", asset.location || "-"],
    ["Purchase date", fmt(asset.purchaseDate)], ["Warranty end", fmt(asset.warrantyEnd)],
    ["Assigned to", asset.assignedTo ? `${asset.assignedTo.name} (${asset.assignedTo.employeeId})` : "-"],
  ];

  return (
    <>
      <PageHeader title={asset.name} subtitle={<StatusBadge value={asset.status} />}>
        {isStaff && (
          <>
            {asset.status === "AVAILABLE" && <button className="btn btn-sm btn-primary" onClick={() => setDialog("assign")}>Assign</button>}
            {asset.status === "ASSIGNED" && (
              <>
                <button className="btn btn-sm btn-primary" onClick={() => setDialog("transfer")}>Transfer</button>
                <button className="btn btn-sm" onClick={() => act(() => returnAsset(asset._id), "Asset returned")}>Return</button>
              </>
            )}
            <Link to={`/assets/${asset._id}/edit`} className="btn btn-sm"><Pencil size={14} /> Edit</Link>
          </>
        )}
        {isAdmin && <button className="btn btn-sm btn-error btn-outline" onClick={remove}><Trash2 size={14} /> Delete</button>}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-base">Details</h2>
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-base-content/60">{k}</dt>
                  <dd className="col-span-2">{v}</dd>
                </div>
              ))}
              {asset.notes && (<><dt className="text-base-content/60">Notes</dt><dd className="col-span-2">{asset.notes}</dd></>)}
            </dl>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-base">History</h2>
            {history.length === 0 ? <p className="text-sm text-base-content/60">No history yet.</p> : (
              <ul className="space-y-3 text-sm">
                {history.map((h) => (
                  <li key={h._id} className="border-l-2 border-primary pl-3">
                    <div className="font-medium">{h.action.replaceAll("_", " ")}</div>
                    <div className="text-base-content/60">
                      {new Date(h.createdAt).toLocaleString()} {h.performedBy ? `by ${h.performedBy.name}` : ""}
                    </div>
                    {h.details && <div>{h.details}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {dialog === "assign" && (
        <EmployeePickerDialog title="Assign asset" onClose={() => setDialog(null)}
          onSubmit={async (empId, note) => { await assignAsset(asset._id, empId, note); toast.success("Asset assigned"); load(); }} />
      )}
      {dialog === "transfer" && (
        <EmployeePickerDialog title="Transfer asset" excludeId={asset.assignedTo?._id} onClose={() => setDialog(null)}
          onSubmit={async (empId, note) => { await transferAsset(asset._id, empId, note); toast.success("Asset transferred"); load(); }} />
      )}
    </>
  );
}
