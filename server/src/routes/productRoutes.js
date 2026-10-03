import { Router } from 'express'
import { body, param, query } from 'express-validator'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  stock,
  movements,
} from '../controllers/productController.js'

const router = Router()
const id = param('id').isMongoId().withMessage('Invalid product id')
const categories = ['Electronics', 'Office', 'Home', 'Industrial', 'Accessories', 'Other']
const statuses = ['active', 'inactive']

const productRules = [
  body('name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Product name must be 2-120 characters'),
  body('sku').isString().trim().isLength({ min: 2, max: 40 }).withMessage('SKU must be 2-40 characters'),
  body('category').isIn(categories).withMessage('Invalid category'),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be 0 or more'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be 0 or more'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('reorderLevel').isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
  body('status').isIn(statuses).withMessage('Invalid status'),
]

router.get(
  '/',
  [
    query('page').optional({ values: 'falsy' }).isInt({ min: 1 }),
    query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 50 }),
    query('search').optional({ values: 'falsy' }).isString().isLength({ max: 100 }),
    query('category').optional({ values: 'falsy' }).isIn(categories),
    query('status').optional({ values: 'falsy' }).isIn(statuses),
  ],
  listProducts,
)
router.get('/:id', [id], getProduct)
router.post('/', productRules, createProduct)
router.put('/:id', [id, ...productRules], updateProduct)
router.delete('/:id', [id], deleteProduct)
router.post(
  '/:id/stock',
  [
    id,
    body('type').isIn(['in', 'out']),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('note').optional().isString().isLength({ max: 500 }),
  ],
  stock,
)
router.get('/:id/movements', [id], movements)

export default router
