import { useEffect, useState } from 'react'

const empty = {
  name: '',
  sku: '',
  category: 'Electronics',
  description: '',
  sellingPrice: '',
  costPrice: '',
  stockQuantity: '0',
  reorderLevel: '5',
  status: 'active',
}

export default function ProductForm({ product, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(
      product
        ? {
            name: product.name,
            sku: product.sku,
            category: product.category,
            description: product.description || '',
            sellingPrice: String(product.sellingPrice),
            costPrice: String(product.costPrice),
            stockQuantity: String(product.stockQuantity),
            reorderLevel: String(product.reorderLevel),
            status: product.status,
          }
        : empty,
    )
    setErrors({})
  }, [product])

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Product name is required'
    if (!form.sku.trim()) next.sku = 'SKU is required'
    if (!form.category) next.category = 'Category is required'

    const sellingPrice = Number(form.sellingPrice)
    const costPrice = Number(form.costPrice)
    const stockQuantity = Number(form.stockQuantity)
    const reorderLevel = Number(form.reorderLevel)

    if (form.sellingPrice === '' || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      next.sellingPrice = 'Enter a valid price (0 or more)'
    }
    if (form.costPrice === '' || !Number.isFinite(costPrice) || costPrice < 0) {
      next.costPrice = 'Enter a valid price (0 or more)'
    }
    if (form.stockQuantity === '' || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      next.stockQuantity = 'Enter a whole number (0 or more)'
    }
    if (form.reorderLevel === '' || !Number.isInteger(reorderLevel) || reorderLevel < 0) {
      next.reorderLevel = 'Enter a whole number (0 or more)'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function submit(event) {
    event.preventDefault()
    if (!validate()) return

    onSubmit({
      ...form,
      sellingPrice: Number(form.sellingPrice),
      costPrice: Number(form.costPrice),
      stockQuantity: Number(form.stockQuantity),
      reorderLevel: Number(form.reorderLevel),
    })
  }

  const fields = [
    ['name', 'Product Name', 'text'],
    ['sku', 'SKU', 'text'],
    ['sellingPrice', 'Selling Price', 'number'],
    ['costPrice', 'Cost Price', 'number'],
    ['stockQuantity', 'Stock Quantity', 'number'],
    ['reorderLevel', 'Reorder Level', 'number'],
  ]

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {fields.map(([key, label, type]) => (
        <label key={key} className="grid gap-1.5 text-sm font-semibold">
          {label}
          <input
            className="input"
            type={type}
            min={type === 'number' ? 0 : undefined}
            step={type === 'number' && key.includes('Price') ? '0.01' : undefined}
            value={form[key]}
            disabled={key === 'stockQuantity' && Boolean(product)}
            onChange={(event) => set(key, event.target.value)}
            placeholder={label}
          />
          {key === 'stockQuantity' && product && (
            <span className="text-xs text-slate-500">Use Stock in/out to change inventory.</span>
          )}
          {errors[key] && <span className="text-xs text-red-300">{errors[key]}</span>}
        </label>
      ))}

      <label className="grid gap-1.5 text-sm font-semibold">
        Category
        <select
          className="input"
          value={form.category}
          onChange={(event) => set('category', event.target.value)}
        >
          {['Electronics', 'Office', 'Home', 'Industrial', 'Accessories', 'Other'].map(
            (category) => (
              <option key={category}>{category}</option>
            ),
          )}
        </select>
        {errors.category && <span className="text-xs text-red-300">{errors.category}</span>}
      </label>

      <label className="grid gap-1.5 text-sm font-semibold">
        Status
        <select
          className="input"
          value={form.status}
          onChange={(event) => set('status', event.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
        Description
        <textarea
          className="input min-h-28 resize-y"
          maxLength={1000}
          value={form.description}
          onChange={(event) => set('description', event.target.value)}
          placeholder="Describe the product..."
        />
      </label>

      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button disabled={busy} className="btn btn-primary">
          {busy ? 'Saving...' : product ? 'Save changes' : 'Create product'}
        </button>
      </div>
    </form>
  )
}
