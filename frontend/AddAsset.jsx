import { useState } from "react";

export default function AddAsset() {
  const [asset, setAsset] = useState({
    name: "",
    assetTag: "",
    category: "Laptop",
    status: "Available",
  });

  const handleChange = (e) => {
    setAsset({
      ...asset,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(asset),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add asset");
      }

      alert("Asset added successfully!");

      setAsset({
        name: "",
        assetTag: "",
        category: "Laptop",
        status: "Available",
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Asset</h2>

      <input
        name="name"
        placeholder="Asset Name"
        value={asset.name}
        onChange={handleChange}
        required
      />

      <input
        name="assetTag"
        placeholder="Asset Tag"
        value={asset.assetTag}
        onChange={handleChange}
        required
      />

      <select
        name="category"
        value={asset.category}
        onChange={handleChange}
      >
        <option>Laptop</option>
        <option>Desktop</option>
        <option>Monitor</option>
        <option>Keyboard</option>
        <option>Mouse</option>
        <option>Printer</option>
        <option>Other</option>
      </select>

      <select
        name="status"
        value={asset.status}
        onChange={handleChange}
      >
        <option>Available</option>
        <option>Assigned</option>
        <option>Maintenance</option>
        <option>Retired</option>
      </select>

      <button type="submit">Save Asset</button>
    </form>
  );
}