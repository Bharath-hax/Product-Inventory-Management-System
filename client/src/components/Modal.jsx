import { X } from 'lucide-react'
export default function Modal({ title, children, onClose, wide=false }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm" onMouseDown={onClose}>
    <div className={`max-h-[92vh] w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} overflow-auto rounded-3xl border border-white/10 bg-[#0a1627] shadow-2xl`} onMouseDown={e=>e.stopPropagation()}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a1627]/95 px-6 py-4 backdrop-blur">
        <h2 className="text-lg font-bold">{title}</h2><button onClick={onClose} className="rounded-xl p-2 hover:bg-white/10"><X size={20}/></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
}
