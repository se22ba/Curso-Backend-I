const { Router } = require('express');
const path = require('path');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const pm = new ProductManager(path.join(__dirname, '..', '..', 'data', 'products.json'));


router.get('/', async (req, res) => {
  const products = await pm.getAll();
  res.render('home', { products });
});


router.get('/realtimeproducts', async (req, res) => {
  const products = await pm.getAll();
  res.render('realTimeProducts', { products });
});

module.exports = router;