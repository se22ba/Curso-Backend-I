const { Router } = require('express');
const passport = require('passport');

const CartsRepository = require('../repositories/carts.repository');
const ProductsRepository = require('../repositories/products.repository');
const TicketsRepository = require('../repositories/tickets.repository');
const { authorizeCartOwnerUser } = require('../middlewares/authorization');

const router = Router();

const cartsRepo = new CartsRepository();
const productsRepo = new ProductsRepository();
const ticketsRepo = new TicketsRepository();

router.post('/', async (req, res) => {
  try {
    const cart = await cartsRepo.createEmpty();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear carrito' });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartsRepo.getByIdPopulatedLean(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: 'Id de carrito inválido' });
  }
});

router.post(
  '/:cid/product/:pid',
  passport.authenticate('current', { session: false }),
  authorizeCartOwnerUser(),
  async (req, res) => {
    try {
      const product = await productsRepo.getByIdLean(req.params.pid);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

      const updated = await cartsRepo.addProduct(req.params.cid, req.params.pid, 1);
      if (!updated) return res.status(404).json({ error: 'Carrito no encontrado' });

      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: 'Error al agregar producto al carrito' });
    }
  }
);

router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const updated = await cartsRepo.removeProduct(req.params.cid, req.params.pid);
    if (!updated) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar producto del carrito' });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const products = Array.isArray(req.body) ? req.body : req.body.products;
    if (!Array.isArray(products)) return res.status(400).json({ error: 'Formato de productos inválido' });

    const updated = await cartsRepo.replaceProducts(req.params.cid, products);
    if (!updated) return res.status(404).json({ error: 'Carrito no encontrado' });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar productos del carrito' });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || quantity < 1) return res.status(400).json({ error: 'Cantidad inválida' });

    const updated = await cartsRepo.setProductQuantity(req.params.cid, req.params.pid, quantity);
    if (!updated) return res.status(404).json({ error: 'Carrito no encontrado' });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar cantidad' });
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const updated = await cartsRepo.clear(req.params.cid);
    if (!updated) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al vaciar carrito' });
  }
});

router.post(
  '/:cid/purchase',
  passport.authenticate('current', { session: false }),
  authorizeCartOwnerUser(),
  async (req, res) => {
    try {
      const cart = await cartsRepo.getByIdPopulated(req.params.cid);
      if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

      const purchased = [];
      const notPurchased = [];

      for (const item of cart.products) {
        const pid = item.product._id.toString();
        const qty = item.quantity;
        const product = await productsRepo.getById(pid);

        if (!product) {
          notPurchased.push({ product: pid, quantity: qty });
          continue;
        }

        if (product.stock >= qty) {
          product.stock -= qty;
          await product.save();
          purchased.push({ product: pid, quantity: qty, price: product.price });
        } else {
          notPurchased.push({ product: pid, quantity: qty });
        }
      }

      const amount = purchased.reduce((acc, p) => acc + p.price * p.quantity, 0);
      const purchaser = req.user.email;

      const ticket = await ticketsRepo.create({
        amount,
        purchaser
      });

      await cartsRepo.replaceProducts(req.params.cid, notPurchased);

      res.json({
        status: 'success',
        payload: {
          ticket,
          notPurchased
        }
      });
    } catch (err) {
      res.status(500).json({ status: 'error', error: 'Error al finalizar compra' });
    }
  }
);

module.exports = router;