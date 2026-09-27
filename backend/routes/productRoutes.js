const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockMovements,
} = require('../controllers/productController');

const router = express.Router();

const productValidationRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number'),
  body('costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a non-negative number'),
  body('reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
];

const stockValidationRules = [
  body('type').isIn(['in', 'out']).withMessage('Type must be "in" or "out"'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

router.get('/', getProducts);
router.post('/', productValidationRules, validate, createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/stock', stockValidationRules, validate, adjustStock);
router.get('/:id/movements', getStockMovements);
router.get('/:id', getProductById);

module.exports = router;
