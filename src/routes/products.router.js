const { Router } = require('express');
const path = require('path');
const ProductManager = require('../managers/ProductManager');


const router = Router();
const pm = new ProductManager(path.join(__dirname, '..', '..', 'data', 'products.json'));



router.get('/', async (req, res) => {
const products = await pm.getAll();
res.json(products);
});



router.get('/:pid', async (req, res) => {
const item = await pm.getById(req.params.pid);
if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
res.json(item);
});



router.post('/', async (req, res) => {
const created = await pm.create(req.body || {});
res.status(201).json(created);
});



router.put('/:pid', async (req, res) => {
const updated = await pm.update(req.params.pid, req.body || {});
if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
res.json(updated);
});



router.delete('/:pid', async (req, res) => {
const ok = await pm.delete(req.params.pid);
if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
res.json({ status: 'eliminado' });
});


module.exports = router;