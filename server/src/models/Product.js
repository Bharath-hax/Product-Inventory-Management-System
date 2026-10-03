import mongoose from 'mongoose'
const productSchema=new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  sku:{type:String,required:true,trim:true,uppercase:true,unique:true},
  category:{type:String,required:true,trim:true},
  description:{type:String,default:'',trim:true},
  sellingPrice:{type:Number,required:true,min:0},
  costPrice:{type:Number,required:true,min:0},
  stockQuantity:{type:Number,required:true,min:0,default:0},
  reorderLevel:{type:Number,required:true,min:0,default:5},
  status:{type:String,enum:['active','inactive'],default:'active'}
},{timestamps:true})
productSchema.index({name:'text',sku:'text'})
export default mongoose.model('Product',productSchema)
