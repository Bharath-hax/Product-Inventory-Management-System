import { useState, useEffect } from 'react';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  description: '',
  sellingPrice: '',
  costPrice: '',
  stockQuantity: '',
  reorderLevel: '',
  status: 'active',
};

export default function ProductForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || '',
        description: initialData.description || '',
        sellingPrice: initialData.sellingPrice ?? '',
        costPrice: initialData.costPrice ?? '',
        stockQuantity: initialData.stockQuantity ?? 0,
        reorderLevel: initialData.reorderLevel ?? '',
        status: initialData.status || 'active',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';
    if (!form.category.trim()) newErrors.category = 'Category is required';
    if (form.sellingPrice === '' || Number(form.sellingPrice) < 0)
      newErrors.sellingPrice = 'Enter a valid selling price';
    if (form.costPrice === '' || Number(form.costPrice) < 0)
      newErrors.costPrice = 'Enter a valid cost price';
    if (form.reorderLevel !== '' && Number(form.reorderLevel) < 0)
      newErrors.reorderLevel = 'Reorder level cannot be negative';
    if (!isEdit && (form.stockQuantity === '' || Number(form.stockQuantity) < 0))
      newErrors.stockQuantity = 'Enter a valid opening stock quantity';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      sellingPrice: Number(form.sellingPrice),
      costPrice: Number(form.costPrice),
      reorderLevel: Number(form.reorderLevel || 0),
      status: form.status,
    };
    if (!isEdit) payload.stockQuantity = Number(form.stockQuantity || 0);

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Product Name</label>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Wireless Mouse"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="label">SKU</label>
          <input
            className="input"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="e.g. WM-1001"
          />
          {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
        </div>
        <div>
          <label className="label">Category</label>
          <input
            className="input"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Electronics"
          />
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="label">Selling Price</label>
          <input
            className="input"
            type="number"
            step="0.01"
            name="sellingPrice"
            value={form.sellingPrice}
            onChange={handleChange}
          />
          {errors.sellingPrice && (
            <p className="mt-1 text-xs text-red-600">{errors.sellingPrice}</p>
          )}
        </div>
        <div>
          <label className="label">Cost Price</label>
          <input
            className="input"
            type="number"
            step="0.01"
            name="costPrice"
            value={form.costPrice}
            onChange={handleChange}
          />
          {errors.costPrice && <p className="mt-1 text-xs text-red-600">{errors.costPrice}</p>}
        </div>
        <div>
          <label className="label">
            Opening Stock Quantity {isEdit && '(use Stock In/Out to adjust)'}
          </label>
          <input
            className="input"
            type="number"
            name="stockQuantity"
            value={form.stockQuantity}
            onChange={handleChange}
            disabled={isEdit}
          />
          {errors.stockQuantity && (
            <p className="mt-1 text-xs text-red-600">{errors.stockQuantity}</p>
          )}
        </div>
        <div>
          <label className="label">Reorder Level</label>
          <input
            className="input"
            type="number"
            name="reorderLevel"
            value={form.reorderLevel}
            onChange={handleChange}
          />
          {errors.reorderLevel && (
            <p className="mt-1 text-xs text-red-600">{errors.reorderLevel}</p>
          )}
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
