export default function Pagination({ page, pages, total, onChange }) {
  if (!total) return null;
  return (
    <div className="flex items-center justify-between pt-4 text-sm">
      <span className="text-base-content/60">{total} result{total === 1 ? "" : "s"}</span>
      <div className="join">
        <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          «
        </button>
        <button className="join-item btn btn-sm no-animation">
          Page {page} / {pages}
        </button>
        <button className="join-item btn btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          »
        </button>
      </div>
    </div>
  );
}
