const { Router } = require('express');
const Cart = require('../dao/models/cart.model');
const Product = require('../dao/models/product.model');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear carrito' });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: 'Id de carrito inválido' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    const index = cart.products.findIndex(p => p.product.toString() === req.params.pid);
    if (index === -1) {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    } else {
      cart.products[index].quantity += 1;
    }
    await cart.save();
    const updated = await cart.populate('products.product');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al agregar producto al carrito' });
  }
});

router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
    await cart.save();
    const updated = await cart.populate('products.product');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar producto del carrito' });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    const products = Array.isArray(req.body) ? req.body : req.body.products;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Formato de productos inválido' });
    }
    cart.products = products.map(p => ({
      product: p.product,
      quantity: p.quantity
    }));
    await cart.save();
    const updated = await cart.populate('products.product');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar productos del carrito' });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Cantidad inválida' });
    }
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    const index = cart.products.findIndex(p => p.product.toString() === req.params.pid);
    if (index === -1) {
      cart.products.push({ product: req.params.pid, quantity });
    } else {
      cart.products[index].quantity = quantity;
    }
    await cart.save();
    const updated = await cart.populate('products.product');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar cantidad' });
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    cart.products = [];
    await cart.save();
    const updated = await cart.populate('products.product');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al vaciar carrito' });
  }
});

module.exports = router;