export default function Pagination({ page, totalPages, onPageChange, total }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-2 py-3 sm:flex-row">
      <span className="text-sm text-slate-500">
        {total !== undefined ? `${total} total records` : ''}
      </span>
      <div className="flex items-center gap-1">
        <button
          className="btn-secondary px-2 py-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>
        {start > 1 && <span className="px-2 text-slate-400">...</span>}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-md px-3 py-1 text-sm ${
              p === page
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span className="px-2 text-slate-400">...</span>}
        <button
          className="btn-secondary px-2 py-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
