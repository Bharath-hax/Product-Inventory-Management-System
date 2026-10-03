import 'dotenv/config'
import mongoose from 'mongoose'
import Product from './models/Product.js'
import StockMovement from './models/StockMovement.js'
const products=[
 {name:'Nova Wireless Keyboard',sku:'KB-NOVA-001',category:'Electronics',description:'Low-profile wireless keyboard for modern workspaces.',sellingPrice:2499,costPrice:1500,stockQuantity:42,reorderLevel:10,status:'active'},
 {name:'Aero USB-C Hub',sku:'HUB-AERO-002',category:'Accessories',description:'7-in-1 USB-C connectivity hub.',sellingPrice:3299,costPrice:2100,stockQuantity:7,reorderLevel:10,status:'active'},
 {name:'Atlas Office Chair',sku:'CHR-ATLAS-003',category:'Office',description:'Ergonomic mesh chair with adjustable lumbar support.',sellingPrice:11999,costPrice:8000,stockQuantity:18,reorderLevel:5,status:'active'},
 {name:'Pulse LED Desk Lamp',sku:'LMP-PULSE-004',category:'Home',description:'Adjustable LED lamp with three brightness modes.',sellingPrice:1799,costPrice:900,stockQuantity:4,reorderLevel:8,status:'active'},
 {name:'Forge Safety Gloves',sku:'GLV-FORGE-005',category:'Industrial',description:'Durable protective gloves for workshop operations.',sellingPrice:699,costPrice:350,stockQuantity:64,reorderLevel:15,status:'active'},
 {name:'Core HDMI Cable',sku:'CBL-CORE-006',category:'Accessories',description:'High-speed 2 metre HDMI cable.',sellingPrice:499,costPrice:200,stockQuantity:31,reorderLevel:10,status:'active'}
]
await mongoose.connect(process.env.MONGODB_URI)
await Product.deleteMany({}); await StockMovement.deleteMany({})
const created=await Product.insertMany(products)
await StockMovement.insertMany(created.map(p=>({product:p._id,type:'in',quantity:p.stockQuantity,balanceAfter:p.stockQuantity,note:'Opening inventory'})))
console.log(`Seeded ${created.length} products`)
await mongoose.disconnect()
