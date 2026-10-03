import mongoose from 'mongoose'
const schema=new mongoose.Schema({
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true,index:true},
  type:{type:String,enum:['in','out'],required:true},
  quantity:{type:Number,required:true,min:1},
  note:{type:String,default:''},
  balanceAfter:{type:Number,required:true,min:0}
},{timestamps:true})
export default mongoose.model('StockMovement',schema)
