const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    List products with pagination, search and filters
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const { search, category, status, lowStock } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) filter.category = category;
  if (status) filter.status = status;

  if (lowStock === 'true') {
    filter.$expr = { $lte: ['$stockQuantity', '$reorderLevel'] };
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Public
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    category,
    description,
    sellingPrice,
    costPrice,
    stockQuantity,
    reorderLevel,
    status,
  } = req.body;

  const existing = await Product.findOne({ sku: sku.toUpperCase() });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `A product with SKU "${sku}" already exists`,
    });
  }

  const product = await Product.create({
    name,
    sku,
    category,
    description,
    sellingPrice,
    costPrice,
    stockQuantity: stockQuantity || 0,
    reorderLevel: reorderLevel || 0,
    status: status || 'active',
  });

  if (product.stockQuantity > 0) {
    await StockMovement.create({
      product: product._id,
      type: 'in',
      quantity: product.stockQuantity,
      note: 'Initial stock on product creation',
      balanceAfter: product.stockQuantity,
    });
  }

  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
    const duplicate = await Product.findOne({ sku: req.body.sku.toUpperCase() });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `A product with SKU "${req.body.sku}" already exists`,
      });
    }
  }

  const allowedFields = [
    'name',
    'sku',
    'category',
    'description',
    'sellingPrice',
    'costPrice',
    'reorderLevel',
    'status',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  await product.save();
  res.status(200).json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await StockMovement.deleteMany({ product: product._id });
  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Add or remove stock (stock-in / stock-out)
// @route   POST /api/products/:id/stock
// @access  Public
const adjustStock = asyncHandler(async (req, res) => {
  const { type, quantity, note } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const qty = Number(quantity);

  if (!['in', 'out'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Type must be "in" or "out"' });
  }
  if (!qty || qty <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
  }

  if (type === 'out' && product.stockQuantity - qty < 0) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock. Available: ${product.stockQuantity}, requested: ${qty}`,
    });
  }

  product.stockQuantity =
    type === 'in' ? product.stockQuantity + qty : product.stockQuantity - qty;

  await product.save();

  const movement = await StockMovement.create({
    product: product._id,
    type,
    quantity: qty,
    note: note || '',
    balanceAfter: product.stockQuantity,
  });

  res.status(200).json({ success: true, data: { product, movement } });
});

// @desc    Get stock movement history for a product
// @route   GET /api/products/:id/movements
// @access  Public
const getStockMovements = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const total = await StockMovement.countDocuments({ product: product._id });
  const movements = await StockMovement.find({ product: product._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: movements,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockMovements,
};
