const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  nombre: { type: String, required: true },
  description: { type: String, default: null },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  status: { type: Boolean, default: true }
});

module.exports = model('Product', productSchema);