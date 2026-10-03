import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Package,
  Warehouse,
  X,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react'
import { getApiErrorMessage, productApi } from './services/api'
import ProductForm from './components/ProductForm'
import StockModal from './components/StockModal'
import Modal from './components/Modal'
import ProductTable from './components/ProductTable'
import Pagination from './components/Pagination'
import Stats from './components/Stats'
import Toast from './components/Toast'

function Detail({ product, movements }) {
  const cards = [
    ['Selling price', `₹${Number(product.sellingPrice).toLocaleString('en-IN')}`],
    ['Cost price', `₹${Number(product.costPrice).toLocaleString('en-IN')}`],
    ['Current stock', product.stockQuantity],
    ['Reorder level', product.reorderLevel],
  ]

  return (
    <div className="grid gap-5 md:grid-cols-[1.1fr_.9fr]">
      <div className="card rounded-3xl p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">{product.category}</div>
            <h3 className="mt-1 text-2xl font-black">{product.name}</h3>
            <div className="mt-1 font-mono text-xs text-slate-500">{product.sku}</div>
          </div>
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
            {product.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {cards.map(([label, value]) => (
            <div className="rounded-2xl bg-white/[.035] p-4" key={label}>
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-1 text-lg font-bold">{value}</div>
            </div>
          ))}
        </div>

        <p className="mt-5 leading-7 text-slate-400">
          {product.description || 'No description provided.'}
        </p>
      </div>

      <div className="card rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2 font-bold">
          <History size={18} /> Recent movements
        </div>

        {movements.length ? (
          <div className="space-y-3">
            {movements.map((movement) => (
              <div
                key={movement._id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/[.035] p-3"
              >
                <div className="flex items-center gap-3">
                  {movement.type === 'in' ? (
                    <ArrowDownToLine className="text-emerald-300" />
                  ) : (
                    <ArrowUpFromLine className="text-amber-300" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {movement.type === 'in' ? 'Stock in' : 'Stock out'} · {movement.quantity}
                    </div>
                    <div className="text-xs text-slate-500">{movement.note || 'No note'}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  {new Date(movement.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-500">No movements recorded.</div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 })
  const [query, setQuery] = useState({
    page: 1,
    limit: 8,
    search: '',
    category: '',
    status: '',
  })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [movements, setMovements] = useState([])
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [productsResponse, dashboardResponse] = await Promise.all([
        productApi.list(query),
        productApi.dashboard(),
      ])
      setProducts(productsResponse.data.items)
      setMeta(productsResponse.data.meta)
      setStats(dashboardResponse.data)
    } catch (error) {
      notify(getApiErrorMessage(error, 'Could not refresh inventory'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = window.setTimeout(load, 250)
    return () => window.clearTimeout(id)
  }, [query])

  const save = async (data) => {
    setBusy(true)
    try {
      if (modal === 'create') {
        await productApi.create(data)
      } else {
        await productApi.update(selected._id, data)
      }
      notify(modal === 'create' ? 'Product created successfully' : 'Product updated successfully')
      setModal(null)
      await load()
    } catch (error) {
      notify(getApiErrorMessage(error, 'Save failed'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await productApi.remove(selected._id)
      notify('Product deleted successfully')
      setModal(null)
      await load()
    } catch (error) {
      notify(getApiErrorMessage(error, 'Delete failed'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const stock = async (data) => {
    setBusy(true)
    try {
      await productApi.stock(selected._id, data)
      notify('Inventory updated successfully')
      setModal(null)
      await load()
    } catch (error) {
      notify(getApiErrorMessage(error, 'Stock update failed'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const view = async (product) => {
    setSelected(product)
    try {
      const response = await productApi.movements(product._id)
      setMovements(response.data.items)
    } catch {
      setMovements([])
    }
    setModal('detail')
  }

  return (
    <div className="min-h-screen">
      <Toast toast={toast} />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-300 to-blue-400 text-[#07111f] shadow-lg">
              <Warehouse size={23} />
            </div>
            <div>
              <div className="font-black tracking-tight">
                AmiHive <span className="text-teal-300">Inventory</span>
              </div>
              <div className="text-xs text-slate-500">Product & stock control</div>
            </div>
          </div>
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setSelected(null)
              setModal('create')
            }}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New product</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-7 sm:px-6">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-teal-300">
              <Package size={15} /> Operations
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Inventory command center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Track products, protect stock levels, and keep every inventory movement auditable.
            </p>
          </div>
          <button onClick={load} className="btn btn-secondary flex w-fit items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <Stats data={stats} />

        <section className="card overflow-hidden rounded-3xl">
          <div className="border-b border-white/10 p-4 sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  className="input pl-10"
                  value={query.search}
                  onChange={(event) =>
                    setQuery((current) => ({ ...current, page: 1, search: event.target.value }))
                  }
                  placeholder="Search by product name or SKU..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <SlidersHorizontal size={15} /> Filters
                </div>
                <select
                  className="input w-auto min-w-36"
                  value={query.category}
                  onChange={(event) =>
                    setQuery((current) => ({
                      ...current,
                      page: 1,
                      category: event.target.value,
                    }))
                  }
                >
                  <option value="">All categories</option>
                  {['Electronics', 'Office', 'Home', 'Industrial', 'Accessories', 'Other'].map(
                    (category) => (
                      <option key={category}>{category}</option>
                    ),
                  )}
                </select>
                <select
                  className="input w-auto min-w-32"
                  value={query.status}
                  onChange={(event) =>
                    setQuery((current) => ({
                      ...current,
                      page: 1,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {(query.search || query.category || query.status) && (
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setQuery((current) => ({
                        ...current,
                        page: 1,
                        search: '',
                        category: '',
                        status: '',
                      }))
                    }
                    title="Clear filters"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-14 text-center text-slate-400">Loading inventory…</div>
          ) : (
            <ProductTable
              items={products}
              onView={view}
              onEdit={(product) => {
                setSelected(product)
                setModal('edit')
              }}
              onDelete={(product) => {
                setSelected(product)
                setModal('delete')
              }}
              onStock={(product) => {
                setSelected(product)
                setModal('stock')
              }}
            />
          )}

          <Pagination
            page={meta.page}
            pages={meta.pages}
            onChange={(page) => setQuery((current) => ({ ...current, page }))}
          />
        </section>
      </main>

      {(modal === 'create' || modal === 'edit') && (
        <Modal
          title={modal === 'create' ? 'Create product' : 'Edit product'}
          onClose={() => setModal(null)}
        >
          <ProductForm
            product={modal === 'edit' ? selected : null}
            onSubmit={save}
            onCancel={() => setModal(null)}
            busy={busy}
          />
        </Modal>
      )}

      {modal === 'stock' && selected && (
        <Modal title={`Adjust stock · ${selected.name}`} onClose={() => setModal(null)}>
          <StockModal
            product={selected}
            onClose={() => setModal(null)}
            onSubmit={stock}
            busy={busy}
          />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Delete product" onClose={() => setModal(null)}>
          <div className="space-y-5">
            <p className="text-slate-300">
              Delete <strong>{selected.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" disabled={busy} onClick={remove}>
                {busy ? 'Deleting…' : 'Delete product'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'detail' && selected && (
        <Modal title="Product details" wide onClose={() => setModal(null)}>
          <Detail product={selected} movements={movements} />
        </Modal>
      )}
    </div>
  )
}
