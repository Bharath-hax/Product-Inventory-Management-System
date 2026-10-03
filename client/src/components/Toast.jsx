export default function Toast({ toast }) {
  if (!toast) return null
  return <div className={`fixed right-5 top-5 z-[100] max-w-sm rounded-2xl border px-4 py-3 shadow-2xl ${toast.type === 'error' ? 'border-red-400/30 bg-red-950/90 text-red-100' : 'border-emerald-400/30 bg-emerald-950/90 text-emerald-100'}`}>{toast.message}</div>
}
