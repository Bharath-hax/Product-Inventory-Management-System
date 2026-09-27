import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductForm from '../components/ProductForm';
import StockAdjustForm from '../components/StockAdjustForm';

const columns = [
  { key: 'name', label: 'Product' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Category' },
  { key: 'stock', label: 'Stock' },
  { key: 'price', label: 'Price' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [formModal, setFormModal] = useState({ open: false, product: null });
  const [stockModal, setStockModal] = useState({ open: false, product: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productApi.list({
        page,
        limit: 10,
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
      });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category, status]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleCreate = () => {
    setActionError('');
    setFormModal({ open: true, product: null });
  };

  const handleEdit = (product) => {
    setActionError('');
    setFormModal({ open: true, product });
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    setActionError('');
    try {
      if (formModal.product) {
        await productApi.update(formModal.product._id, payload);
      } else {
        await productApi.create(payload);
      }
      setFormModal({ open: false, product: null });
      fetchProducts();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      await productApi.remove(deleteTarget._id);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      setActionError(err.message);
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockSubmit = async (payload) => {
    setSubmitting(true);
    setActionError('');
    try {
      await productApi.adjustStock(stockModal.product._id, payload);
      setStockModal({ open: false, product: null });
      fetchProducts();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Product
        </button>
      </div>

      {actionError && <ErrorAlert message={actionError} />}

      <div className="card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            className="input sm:col-span-2"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <input
            className="input"
            placeholder="Filter by category"
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          />
          <select
            className="input"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="card p-0">
        {loading ? (
          <Loader label="Loading products..." />
        ) : error ? (
          <div className="p-5">
            <ErrorAlert message={error} onRetry={fetchProducts} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            message="Try adjusting your search or filters, or add a new product."
          />
        ) : (
          <>
            <Table columns={columns}>
              {products.map((p) => {
                const isLow = p.stockQuantity <= p.reorderLevel;
                return (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/products/${p._id}`} className="font-medium text-brand-600 hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.sku}</td>
                    <td className="px-4 py-3 text-slate-600">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className={isLow ? 'font-semibold text-amber-600' : 'text-slate-700'}>
                        {p.stockQuantity}
                      </span>
                      {isLow && (
                        <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          Low
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">₹{p.sellingPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          p.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="text-xs font-medium text-brand-600 hover:underline"
                          onClick={() => setStockModal({ open: true, product: p })}
                        >
                          Adjust Stock
                        </button>
                        <button
                          className="text-xs font-medium text-slate-600 hover:underline"
                          onClick={() => handleEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs font-medium text-red-600 hover:underline"
                          onClick={() => setDeleteTarget(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, product: null })}
        title={formModal.product ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          initialData={formModal.product}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormModal({ open: false, product: null })}
          isSubmitting={submitting}
        />
      </Modal>

      <Modal
        isOpen={stockModal.open}
        onClose={() => setStockModal({ open: false, product: null })}
        title="Adjust Stock"
        size="sm"
      >
        {stockModal.product && (
          <StockAdjustForm
            product={stockModal.product}
            onSubmit={handleStockSubmit}
            onCancel={() => setStockModal({ open: false, product: null })}
            isSubmitting={submitting}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={submitting}
      />
    </div>
  );
}
