import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import { createAsset, getAsset, updateAsset } from "../services/assetService";
import { errorMessage } from "../services/api";
import { CATEGORIES } from "./AssetsPage";

const EMPTY = {
  assetId: "", name: "", category: "LAPTOP", brand: "", model: "", serialNumber: "",
  purchaseDate: "", warrantyEnd: "", location: "", notes: "",
};
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

// Serves both /assets/new and /assets/:id/edit
export default function AssetFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getAsset(id)
      .then((a) => setForm({ ...EMPTY, ...a, purchaseDate: toDateInput(a.purchaseDate), warrantyEnd: toDateInput(a.warrantyEnd) }))
      .catch((e) => toast.error(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const bind = (key) => ({
    value: form[key] ?? "",
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { name, category, brand, model, serialNumber, purchaseDate, warrantyEnd, location, notes, assetId } = form;
    const payload = { name, category, brand, model, serialNumber, purchaseDate, warrantyEnd, location, notes };
    try {
      const saved = isEdit ? await updateAsset(id, payload) : await createAsset({ ...payload, assetId });
      toast.success(isEdit ? "Asset updated" : "Asset created");
      navigate(`/assets/${saved._id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader title={isEdit ? `Edit ${form.assetId}` : "Add Asset"} />
      <form onSubmit={submit} className="card max-w-3xl bg-base-100 shadow">
        <div className="card-body grid gap-4 md:grid-cols-2">
          {!isEdit && (
            <label className="form-control">
              <span className="label-text mb-1">Asset ID (leave blank to auto-generate)</span>
              <input className="input input-bordered" {...bind("assetId")} maxLength={30} />
            </label>
          )}
          <label className="form-control">
            <span className="label-text mb-1">Name *</span>
            <input className="input input-bordered" required {...bind("name")} maxLength={200} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Category *</span>
            <select className="select select-bordered" {...bind("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Serial number *</span>
            <input className="input input-bordered" required {...bind("serialNumber")} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Brand</span>
            <input className="input input-bordered" {...bind("brand")} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Model</span>
            <input className="input input-bordered" {...bind("model")} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Purchase date</span>
            <input type="date" className="input input-bordered" {...bind("purchaseDate")} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Warranty end</span>
            <input type="date" className="input input-bordered" {...bind("warrantyEnd")} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Location</span>
            <input className="input input-bordered" {...bind("location")} />
          </label>
          <label className="form-control md:col-span-2">
            <span className="label-text mb-1">Notes</span>
            <textarea className="textarea textarea-bordered" rows={3} maxLength={1000} {...bind("notes")} />
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
            <button type="button" className="btn" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </div>
      </form>
    </>
  );
}
