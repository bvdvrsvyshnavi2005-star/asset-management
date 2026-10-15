import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { listEmployees } from "../services/employeeService";
import { errorMessage } from "../services/api";

// Used for both "assign" and "transfer". onSubmit(employeeId, note) should return a promise.
export default function EmployeePickerDialog({ title, excludeId, onSubmit, onClose }) {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listEmployees({ status: "ACTIVE", limit: 200 })
      .then((r) => setEmployees(r.data.filter((e) => e._id !== excludeId)))
      .catch((e) => toast.error(errorMessage(e)));
  }, [excludeId]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(employeeId, note);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <form className="modal-box space-y-4" onSubmit={submit}>
        <h3 className="text-lg font-bold">{title}</h3>
        <select className="select select-bordered w-full" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
          <option value="">Select employee...</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} ({emp.employeeId}) - {emp.department || "no dept"}
            </option>
          ))}
        </select>
        <input className="input input-bordered w-full" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy || !employeeId}>{busy ? "Saving..." : "Confirm"}</button>
        </div>
      </form>
    </dialog>
  );
}
