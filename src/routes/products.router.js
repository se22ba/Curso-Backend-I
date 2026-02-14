const { Router } = require('express');
const passport = require('passport');

const ProductsRepository = require('../repositories/products.repository');
const { authorizeRole } = require('../middlewares/authorization');

const router = Router();
const productsRepo = new ProductsRepository();

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;

    const filter = {};
    if (query) {
      if (query === 'disponible') {
        filter.stock = { $gt: 0 };
      } else if (query === 'no-disponible') {
        filter.stock = { $lte: 0 };
      } else {
        filter.category = query;
      }
    }

    const sortOptions = {};
    if (sort === 'asc') sortOptions.price = 1;
    if (sort === 'desc') sortOptions.price = -1;

    const skip = (page - 1) * limit;

    const { products, totalDocs } = await productsRepo.paginateLean({ filter, sortOptions, skip, limit });

    const totalPages = Math.ceil(totalDocs / limit) || 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const baseUrl = req.baseUrl;
    const buildLink = targetPage => {
      const params = new URLSearchParams();
      params.set('page', targetPage);
      if (req.query.limit) params.set('limit', req.query.limit);
      if (req.query.sort) params.set('sort', req.query.sort);
      if (req.query.query) params.set('query', req.query.query);
      return `${baseUrl}?${params.toString()}`;
    };

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(prevPage) : null,
      nextLink: hasNextPage ? buildLink(nextPage) : null
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Error al obtener productos' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const product = await productsRepo.getByIdLean(req.params.pid);
    if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: product });
  } catch (err) {
    res.status(400).json({ status: 'error', error: 'Id de producto inválido' });
  }
});

router.post(
  '/',
  passport.authenticate('current', { session: false }),
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const created = await productsRepo.create(req.body || {});
      res.status(201).json({ status: 'success', payload: created });
    } catch (err) {
      res.status(400).json({ status: 'error', error: 'Error al crear producto' });
    }
  }
);

router.put(
  '/:pid',
  passport.authenticate('current', { session: false }),
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const updated = await productsRepo.updateById(req.params.pid, req.body || {});
      if (!updated) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
      res.json({ status: 'success', payload: updated });
    } catch (err) {
      res.status(400).json({ status: 'error', error: 'Id de producto inválido' });
    }
  }
);

router.delete(
  '/:pid',
  passport.authenticate('current', { session: false }),
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const deleted = await productsRepo.deleteById(req.params.pid);
      if (!deleted) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
      res.json({ status: 'success', payload: { id: req.params.pid } });
    } catch (err) {
      res.status(400).json({ status: 'error', error: 'Id de producto inválido' });
    }
  }
);

module.exports = router;