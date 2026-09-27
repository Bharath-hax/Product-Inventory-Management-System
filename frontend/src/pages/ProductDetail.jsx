import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StockAdjustForm from '../components/StockAdjustForm';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productRes, movementsRes] = await Promise.all([
        productApi.getById(id),
        productApi.getMovements(id, { limit: 20 }),
      ]);
      setProduct(productRes.data.data);
      setMovements(movementsRes.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStockSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await productApi.adjustStock(id, payload);
      setStockModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading product..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;
  if (!product) return null;

  const isLow = product.stockQuantity <= product.reorderLevel;

  return (
    <div className="space-y-6">
      <Link to="/products" className="text-sm text-brand-600 hover:underline">
        ← Back to Products
      </Link>

      <div className="card">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
            <p className="text-sm text-slate-500">
              SKU: {product.sku} • Category: {product.category}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                product.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {product.status}
            </span>
          </div>
          <button className="btn-primary" onClick={() => setStockModalOpen(true)}>
            Adjust Stock
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600">{product.description || 'No description provided.'}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Selling Price</p>
            <p className="text-lg font-semibold text-slate-800">₹{product.sellingPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Cost Price</p>
            <p className="text-lg font-semibold text-slate-800">₹{product.costPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Stock Quantity</p>
            <p className={`text-lg font-semibold ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
              {product.stockQuantity}
              {isLow && <span className="ml-2 text-xs font-normal">(Low Stock)</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Reorder Level</p>
            <p className="text-lg font-semibold text-slate-800">{product.reorderLevel}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Stock Movement History</h2>
        {movements.length === 0 ? (
          <EmptyState title="No stock movements yet" message="Movements will appear here once stock is adjusted." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {movements.map((m) => (
              <li key={m._id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <span
                    className={`font-medium ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {m.type === 'in' ? 'Stock In' : 'Stock Out'}
                  </span>
                  {m.note && <span className="ml-2 text-slate-500">— {m.note}</span>}
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-700">
                    {m.type === 'in' ? '+' : '-'}
                    {m.quantity} (balance: {m.balanceAfter})
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal isOpen={stockModalOpen} onClose={() => setStockModalOpen(false)} title="Adjust Stock" size="sm">
        <StockAdjustForm
          product={product}
          onSubmit={handleStockSubmit}
          onCancel={() => setStockModalOpen(false)}
          isSubmitting={submitting}
        />
      </Modal>
    </div>
  );
}
