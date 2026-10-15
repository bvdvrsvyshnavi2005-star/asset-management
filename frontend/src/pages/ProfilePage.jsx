import { useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/authService";
import { errorMessage } from "../services/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error("New passwords do not match");
    setBusy(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success("Password updated");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" />
      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        <div className="card bg-base-100 shadow">
          <div className="card-body text-sm">
            <h2 className="card-title text-base">Account</h2>
            <div><span className="text-base-content/60">Name: </span>{user.name}</div>
            <div><span className="text-base-content/60">Email: </span>{user.email}</div>
            <div><span className="text-base-content/60">Role: </span>{user.role}</div>
            {user.employee && <div><span className="text-base-content/60">Employee: </span>{user.employee.name} ({user.employee.employeeId})</div>}
          </div>
        </div>
        <form onSubmit={submit} className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <h2 className="card-title text-base">Change password</h2>
            <input type="password" autoComplete="current-password" required placeholder="Current password" className="input input-bordered"
              value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
            <input type="password" autoComplete="new-password" required minLength={8} placeholder="New password (min 8)" className="input input-bordered"
              value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
            <input type="password" autoComplete="new-password" required placeholder="Confirm new password" className="input input-bordered"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Update password"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
