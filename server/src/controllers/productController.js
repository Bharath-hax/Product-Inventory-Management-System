import { validationResult } from 'express-validator'
import Product from '../models/Product.js'
import StockMovement from '../models/StockMovement.js'
import { adjustStock } from '../services/inventoryService.js'

function validate(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    return false
  }
  return true
}

export async function listProducts(req, res, next) {
  try {
    if (!validate(req, res)) return
    const { page = 1, limit = 8, search = '', category = '', status = '' } = req.query
    const p = Math.max(1, Number(page))
    const l = Math.min(50, Math.max(1, Number(limit)))
    const q = {}

    if (search) {
      const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      q.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { sku: { $regex: safeSearch, $options: 'i' } },
      ]
    }
    if (category) q.category = category
    if (status) q.status = status

    const [items, total] = await Promise.all([
      Product.find(q).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
      Product.countDocuments(q),
    ])

    res.json({
      items,
      meta: { page: p, limit: l, total, pages: Math.max(1, Math.ceil(total / l)) },
    })
  } catch (error) {
    next(error)
  }
}

export async function getProduct(req, res, next) {
  try {
    if (!validate(req, res)) return
    const product = await Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    next(error)
  }
}

export async function createProduct(req, res, next) {
  try {
    if (!validate(req, res)) return
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}

export async function updateProduct(req, res, next) {
  try {
    if (!validate(req, res)) return
    const { stockQuantity, ...updates } = req.body
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    next(error)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    if (!validate(req, res)) return
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    await StockMovement.deleteMany({ product: req.params.id })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export async function stock(req, res, next) {
  try {
    if (!validate(req, res)) return
    const product = await adjustStock(req.params.id, req.body)
    res.json(product)
  } catch (error) {
    next(error)
  }
}

export async function movements(req, res, next) {
  try {
    if (!validate(req, res)) return
    const exists = await Product.exists({ _id: req.params.id })
    if (!exists) return res.status(404).json({ message: 'Product not found' })
    const items = await StockMovement.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean()
    res.json({ items })
  } catch (error) {
    next(error)
  }
}
