const { Router } = require('express');
const Product = require('../dao/models/product.model');

const router = Router();

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
    if (sort === 'asc') {
      sortOptions.price = 1;
    }
    if (sort === 'desc') {
      sortOptions.price = -1;
    }

    const skip = (page - 1) * limit;

    const [products, totalDocs] = await Promise.all([
      Product.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalDocs / limit) || 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const baseUrl = req.baseUrl;
    const buildLink = targetPage => {
      const params = new URLSearchParams();
      params.set('page', targetPage);
      if (req.query.limit) {
        params.set('limit', req.query.limit);
      }
      if (req.query.sort) {
        params.set('sort', req.query.sort);
      }
      if (req.query.query) {
        params.set('query', req.query.query);
      }
      return `${baseUrl}?${params.toString()}`;
    };

    const prevLink = hasPrevPage ? buildLink(prevPage) : null;
    const nextLink = hasNextPage ? buildLink(nextPage) : null;

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Error al obtener productos' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: product });
  } catch (err) {
    res.status(400).json({ status: 'error', error: 'Id de producto inválido' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, description, code, price, stock, category, status } = req.body;
    const created = await Product.create({ nombre, description, code, price, stock, category, status });
    res.status(201).json({ status: 'success', payload: created });
  } catch (err) {
    res.status(400).json({ status: 'error', error: 'Error al crear producto' });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body || {}, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    res.status(400).json({ status: 'error', error: 'Id de producto inválido' });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid).lean();
    if (!deleted) {
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: { id: req.params.pid } });
  } catch (err) {
    res.status(400).json({ status: 'error', error: 'Id de producto inválido' });
  }
});

module.exports = router;