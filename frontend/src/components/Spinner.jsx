export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-base-content/60">
      <span className="loading loading-spinner" />
      <span>{label}</span>
    </div>
  );
}
