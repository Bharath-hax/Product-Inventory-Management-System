import Product from '../models/Product.js'
import StockMovement from '../models/StockMovement.js'

export async function adjustStock(id,{type,quantity,note=''}) {
  const delta=type==='in'?quantity:-quantity
  // The stock-out query contains stockQuantity >= quantity, preventing negative inventory at DB update time.
  const filter={_id:id}
  if(type==='out') filter.stockQuantity={$gte:quantity}
  const updated=await Product.findOneAndUpdate(filter,{$inc:{stockQuantity:delta}},{new:true,runValidators:true})
  if(!updated) {
    const exists=await Product.exists({_id:id})
    if(!exists) { const e=new Error('Product not found'); e.status=404; throw e }
    const e=new Error('Insufficient stock: stock cannot become negative'); e.status=409; throw e
  }
  await StockMovement.create({product:id,type,quantity,note,balanceAfter:updated.stockQuantity})
  return updated
}
