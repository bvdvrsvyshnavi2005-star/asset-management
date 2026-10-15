import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../services/api";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err.response?.status, err.response?.data ?? err.message);
      toast.error(errorMessage(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="text-2xl font-bold text-primary">IT Asset Manager</h1>
          <p className="text-sm text-base-content/60">Sign in to continue</p>
          <input
            type="email" required autoComplete="username" placeholder="Email"
            className="input input-bordered"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password" required autoComplete="current-password" placeholder="Password"
            className="input input-bordered"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}