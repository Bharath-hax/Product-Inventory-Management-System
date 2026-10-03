import { useState } from 'react'
export default function StockModal({ product,onClose,onSubmit,busy }) {
 const [type,setType]=useState('in'),[qty,setQty]=useState(1),[note,setNote]=useState('')
 const max=product.stockQuantity
 return <form onSubmit={e=>{e.preventDefault(); onSubmit({type,quantity:Number(qty),note})}} className="grid gap-4">
  <div className="rounded-2xl bg-white/5 p-4"><div className="text-sm text-slate-400">Current stock</div><div className="text-3xl font-black">{product.stockQuantity}</div></div>
  <div className="grid grid-cols-2 gap-2">{['in','out'].map(x=><button type="button" key={x} onClick={()=>setType(x)} className={`btn ${type===x?'btn-primary':'btn-secondary'}`}>{x==='in'?'Stock in':'Stock out'}</button>)}</div>
  <label className="grid gap-1.5 text-sm font-semibold">Quantity<input className="input" type="number" min="1" max={type==='out'?max:undefined} value={qty} onChange={e=>setQty(e.target.value)}/>{type==='out'&&<span className="text-xs text-slate-400">Maximum allowed: {max}</span>}</label>
  <label className="grid gap-1.5 text-sm font-semibold">Note (optional)<textarea className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="Reason for movement"/></label>
  <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button><button disabled={busy} className="btn btn-primary">{busy?'Updating...':'Confirm movement'}</button></div>
 </form>
}
