import Product from '../models/Product.js'
export async function inventorySummary(req,res,next){try{
 const [totalProducts,activeProducts,lowStockProducts,totalStockUnits]=await Promise.all([
  Product.countDocuments(),Product.countDocuments({status:'active'}),Product.countDocuments({$expr:{$lte:['$stockQuantity','$reorderLevel']}}),
  Product.aggregate([{$group:{_id:null,total:{$sum:'$stockQuantity'}}}])
 ])
 res.json({totalProducts,activeProducts,lowStockProducts,totalStockUnits:totalStockUnits[0]?.total||0})
}catch(e){next(e)}}
