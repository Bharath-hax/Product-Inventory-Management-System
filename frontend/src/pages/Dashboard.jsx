import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/productApi';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

const StatCard = ({ label, value, accent }) => (
  <div className="card">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardApi.getInventorySummary();
      setSummary(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchSummary} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Inventory Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={summary.totalProducts} accent="text-brand-600" />
        <StatCard label="Active Products" value={summary.activeProducts} accent="text-green-600" />
        <StatCard label="Low Stock Products" value={summary.lowStockProducts} accent="text-amber-600" />
        <StatCard label="Total Stock Units" value={summary.totalStockUnits} accent="text-slate-700" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Low Stock Products</h2>
          {summary.lowStockList.length === 0 ? (
            <p className="text-sm text-slate-500">No low-stock products right now.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.lowStockList.map((p) => (
                <li key={p._id} className="flex items-center justify-between py-2 text-sm">
                  <Link to={`/products/${p._id}`} className="text-brand-600 hover:underline">
                    {p.name} <span className="text-slate-400">({p.sku})</span>
                  </Link>
                  <span className="font-medium text-amber-600">
                    {p.stockQuantity} / {p.reorderLevel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Recent Stock Movements</h2>
          {summary.recentMovements.length === 0 ? (
            <p className="text-sm text-slate-500">No stock movements recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.recentMovements.map((m) => (
                <li key={m._id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {m.product?.name || 'Unknown product'}{' '}
                    <span className="text-slate-400">({m.product?.sku})</span>
                  </span>
                  <span
                    className={`font-medium ${
                      m.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {m.type === 'in' ? '+' : '-'}
                    {m.quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
