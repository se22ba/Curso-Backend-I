const Cart = require('../dao/models/cart.model');

class CartsRepository {
  async createEmpty() {
    return Cart.create({ products: [] });
  }

  async getByIdPopulatedLean(id) {
    return Cart.findById(id).populate('products.product').lean();
  }

  async getByIdPopulated(id) {
    return Cart.findById(id).populate('products.product');
  }

  async addProduct(cid, pid, qty = 1) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const index = cart.products.findIndex(p => p.product.toString() === pid);
    if (index === -1) cart.products.push({ product: pid, quantity: qty });
    else cart.products[index].quantity += qty;

    await cart.save();
    return cart.populate('products.product');
  }

  async removeProduct(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    return cart.populate('products.product');
  }

  async replaceProducts(cid, products) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = products.map(p => ({
      product: p.product,
      quantity: p.quantity
    }));

    await cart.save();
    return cart.populate('products.product');
  }

  async setProductQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const index = cart.products.findIndex(p => p.product.toString() === pid);
    if (index === -1) cart.products.push({ product: pid, quantity });
    else cart.products[index].quantity = quantity;

    await cart.save();
    return cart.populate('products.product');
  }

  async clear(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = [];
    await cart.save();
    return cart.populate('products.product');
  }
}

module.exports = CartsRepository;