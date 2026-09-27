import { useState } from 'react';

export default function StockAdjustForm({ product, onSubmit, onCancel, isSubmitting }) {
  const [type, setType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      setError('Enter a quantity greater than 0');
      return;
    }
    if (type === 'out' && qty > product.stockQuantity) {
      setError(`Cannot remove more than available stock (${product.stockQuantity})`);
      return;
    }
    setError('');
    onSubmit({ type, quantity: qty, note: note.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-500">
        Current stock for <span className="font-semibold text-slate-700">{product.name}</span>:{' '}
        <span className="font-semibold">{product.stockQuantity}</span> units
      </p>

      <div>
        <label className="label">Movement Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('in')}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
              type === 'in'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            Stock In
          </button>
          <button
            type="button"
            onClick={() => setType('out')}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
              type === 'out'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            Stock Out
          </button>
        </div>
      </div>

      <div>
        <label className="label">Quantity</label>
        <input
          type="number"
          min="1"
          className="input"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Note (optional)</label>
        <input
          type="text"
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Purchase order #123"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Movement'}
        </button>
      </div>
    </form>
  );
}
