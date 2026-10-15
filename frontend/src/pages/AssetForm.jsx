import { useEffect, useState } from "react";

const emptyAsset = {
  name: "",
  assetTag: "",
  category: "Laptop",
  status: "Available",
  assignedTo: "",
  location: "",
};

export default function AssetForm({ assetId, onSaved, onCancel }) {
  const [form, setForm] = useState(emptyAsset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAsset() {
      if (!assetId) {
        setForm(emptyAsset);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/assets/${assetId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load asset");
        }

        if (!cancelled) {
          setForm({
            ...emptyAsset,
            ...data,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAsset();

    return () => {
      cancelled = true;
    };
  }, [assetId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        assetId ? `/api/assets/${assetId}` : "/api/assets",
        {
          method: assetId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save asset");
      }

      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && assetId && !form.assetTag) {
    return <p>Loading asset...</p>;
  }

  return (
    <section className="form-card">
      <div className="section-heading">
        <div>
          <h2>{assetId ? "Edit Asset" : "Add New Asset"}</h2>
          <p>Enter the asset details below.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="asset-form" onSubmit={handleSubmit}>
        <label>
          Asset Name *
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Dell Latitude Laptop"
            required
          />
        </label>

        <label>
          Asset Tag *
          <input
            name="assetTag"
            value={form.assetTag}
            onChange={handleChange}
            placeholder="e.g. IT-001"
            required
          />
        </label>

        <label>
          Category *
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            {["Laptop", "Desktop", "Monitor", "Keyboard",
              "Mouse", "Printer", "Other"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            {["Available", "Assigned", "Maintenance", "Retired"].map(
              (item) => <option key={item}>{item}</option>
            )}
          </select>
        </label>

        <label>
          Assigned To
          <input
            name="assignedTo"
            value={form.assignedTo || ""}
            onChange={handleChange}
            placeholder="Employee name (optional)"
          />
        </label>

        <label>
          Location
          <input
            name="location"
            value={form.location || ""}
            onChange={handleChange}
            placeholder="e.g. Office floor 2"
          />
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : assetId ? "Save Changes" : "Add Asset"}
          </button>
        </div>
      </form>
    </section>
  );
}