import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import productRoutes from './routes/productRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import { notFound, errorHandler } from './middleware/error.js'

const requiredEnv = ['MONGODB_URI']
const missingEnv = requiredEnv.filter((key) => !process.env[key])
if (missingEnv.length) {
  console.error(`Missing environment variable(s): ${missingEnv.join(', ')}`)
  console.error('Create server/.env from server/.env.example and start the server again.')
  process.exit(1)
}

const app = express()
const PORT = Number(process.env.PORT || 8001)
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((value) => value.trim())
  : []
const isAllowedOrigin = (origin) =>
  !origin ||
  configuredOrigins.includes(origin) ||
  /^https?:\/\/localhost:\d+$/.test(origin)

app.use(cors({
  origin: (origin, callback) => {
    callback(null, isAllowedOrigin(origin))
  }
}))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'amihive-inventory-api' })
})

app.use('/api/products', productRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use(notFound)
app.use(errorHandler)

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Inventory API running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
