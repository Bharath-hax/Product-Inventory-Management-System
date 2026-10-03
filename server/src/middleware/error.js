export function notFound(req,res){res.status(404).json({message:'Route not found'})}
export function errorHandler(err,req,res,next){
  console.error(err)
  if(err?.code===11000) return res.status(409).json({message:'SKU already exists'})
  if(err?.name==='ValidationError') return res.status(400).json({message:Object.values(err.errors).map(e=>e.message).join(', ')})
  if(err?.name==='CastError') return res.status(400).json({message:'Invalid product id'})
  if(err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({message:'Invalid JSON request body'})
  }
  res.status(err.status||500).json({message:err.message||'Internal server error'})
}
