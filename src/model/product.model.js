import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  Titulo: String,
  description: String,
  code: String,
  price: Number,
  stock: Number,
  category: String,
  status: Boolean
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);
export default Product;
