export default function EmptyState({ title = 'No data found', message = '', action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-4xl">📦</div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
