const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get inventory dashboard summary
// @route   GET /api/dashboard/inventory
// @access  Public
const getInventoryDashboard = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ status: 'active' });

  const lowStockProducts = await Product.countDocuments({
    $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
  });

  const stockAgg = await Product.aggregate([
    { $group: { _id: null, totalStockUnits: { $sum: '$stockQuantity' } } },
  ]);
  const totalStockUnits = stockAgg[0]?.totalStockUnits || 0;

  const recentMovements = await StockMovement.find()
    .populate('product', 'name sku')
    .sort({ createdAt: -1 })
    .limit(10);

  const lowStockList = await Product.find({
    $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
  })
    .sort({ stockQuantity: 1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalStockUnits,
      recentMovements,
      lowStockList,
    },
  });
});

module.exports = { getInventoryDashboard };
