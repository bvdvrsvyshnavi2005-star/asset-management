import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";
import { createEmployee, deleteEmployee, listEmployees, updateEmployee } from "../services/employeeService";
import { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EMPTY = { employeeId: "", name: "", email: "", department: "", jobTitle: "", phone: "", status: "ACTIVE" };

function EmployeeDialog({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(initial?._id);
  const bind = (k) => ({ value: form[k] ?? "", onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { employeeId, name, email, department, jobTitle, phone, status } = form;
    const payload = { employeeId, name, email, department, jobTitle, phone, status };
    try {
      if (isEdit) await updateEmployee(initial._id, payload);
      else await createEmployee(payload);
      toast.success(isEdit ? "Employee updated" : "Employee created");
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <form className="modal-box grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <h3 className="text-lg font-bold md:col-span-2">{isEdit ? "Edit employee" : "Add employee"}</h3>
        <input className="input input-bordered" placeholder="Employee ID *" required {...bind("employeeId")} />
        <input className="input input-bordered" placeholder="Full name *" required {...bind("name")} />
        <input type="email" className="input input-bordered md:col-span-2" placeholder="Email *" required {...bind("email")} />
        <input className="input input-bordered" placeholder="Department" {...bind("department")} />
        <input className="input input-bordered" placeholder="Job title" {...bind("jobTitle")} />
        <input className="input input-bordered" placeholder="Phone" {...bind("phone")} />
        <select className="select select-bordered" {...bind("status")}>
          <option>ACTIVE</option><option>INACTIVE</option>
        </select>
        <div className="modal-action md:col-span-2">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </dialog>
  );
}

export default function EmployeesPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null); // null | {} (new) | employee (edit)
  const q = useDebounce(search);

  const load = useCallback(() => {
    setError("");
    listEmployees({ search: q, page, limit: 10 }).then(setResult).catch((e) => setError(errorMessage(e)));
  }, [q, page]);
  useEffect(load, [load]);

  const remove = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}?`)) return;
    try {
      await deleteEmployee(emp._id);
      toast.success("Employee deleted");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Employees" subtitle="People who can be assigned assets">
        <button className="btn btn-primary btn-sm" onClick={() => setDialog({})}><Plus size={16} /> Add Employee</button>
      </PageHeader>
      <input className="input input-bordered mb-4 w-full md:w-80" placeholder="Search name, email, ID..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }} />

      {error && <ErrorState message={error} onRetry={load} />}
      {!result && !error ? <Spinner /> : result && (
        <div className="card bg-base-100 shadow">
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Status</th><th /></tr></thead>
              <tbody>
                {result.data.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-base-content/60">No employees found.</td></tr>}
                {result.data.map((e) => (
                  <tr key={e._id}>
                    <td>{e.employeeId}</td><td>{e.name}</td><td>{e.email}</td><td>{e.department || "-"}</td>
                    <td><StatusBadge value={e.status} /></td>
                    <td className="space-x-2 text-right">
                      <button className="btn btn-xs" onClick={() => setDialog(e)}>Edit</button>
                      {isAdmin && <button className="btn btn-xs btn-error btn-outline" onClick={() => remove(e)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={result.page} pages={result.pages} total={result.total} onChange={setPage} /></div>
        </div>
      )}

      {dialog && <EmployeeDialog initial={dialog} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); load(); }} />}
    </>
  );
}
