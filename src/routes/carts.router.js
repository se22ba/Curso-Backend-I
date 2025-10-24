const { Router } = require('express');
const path = require('path');
const CartManager = require('../managers/CartManager');


const router = Router();
const cm = new CartManager(path.join(__dirname, '..', '..', 'data', 'carts.json'));



router.post('/', async (req, res) => {
const cart = await cm.createCart();
res.status(201).json(cart);
});



router.get('/:cid', async (req, res) => {
const cart = await cm.getById(req.params.cid);
if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
res.json(cart.products);
});



router.post('/:cid/product/:pid', async (req, res) => {
const updatedCart = await cm.addProduct(req.params.cid, req.params.pid);
if (!updatedCart) return res.status(404).json({ error: 'Carrito no encontrado' });
res.json(updatedCart);
});


module.exports = router;