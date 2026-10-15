const COLORS = {
  AVAILABLE: "badge-success",
  ASSIGNED: "badge-info",
  MAINTENANCE: "badge-warning",
  RETIRED: "badge-ghost",
  OPEN: "badge-warning",
  COMPLETED: "badge-success",
  ACTIVE: "badge-success",
  INACTIVE: "badge-ghost",
};

export default function StatusBadge({ value }) {
  return <span className={`badge ${COLORS[value] || "badge-outline"}`}>{value}</span>;
}
