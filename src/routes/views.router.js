const { Router } = require('express');
const Product = require('../dao/models/product.model');
const Cart = require('../dao/models/cart.model');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('home', {
      title: 'Home',
      products
    });
  } catch (err) {
    res.status(500).send('Error al cargar Home');
  }
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('realTimeProducts', {
      title: 'Tiempo Real',
      products
    });
  } catch (err) {
    res.status(500).send('Error al cargar RealTimeProducts');
  }
});

router.get('/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const cartId = req.query.cid || '';

    const filter = {};
    if (query) {
      if (query === 'disponible') filter.stock = { $gt: 0 };
      else if (query === 'no-disponible') filter.stock = { $lte: 0 };
      else filter.category = query;
    }

    const sortOptions = {};
    if (sort === 'asc') sortOptions.price = 1;
    if (sort === 'desc') sortOptions.price = -1;

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

    const basePath = '/products';
    const buildLink = targetPage => {
      const params = new URLSearchParams();
      params.set('page', targetPage);
      if (req.query.limit) params.set('limit', req.query.limit);
      if (req.query.sort) params.set('sort', req.query.sort);
      if (req.query.query) params.set('query', req.query.query);
      if (cartId) params.set('cid', cartId);
      return `${basePath}?${params.toString()}`;
    };

    res.render('products', {
      title: 'Productos',
      products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(prevPage) : null,
      nextLink: hasNextPage ? buildLink(nextPage) : null,
      cartId
    });
  } catch (err) {
    res.status(500).send('Error al cargar productos');
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate('products.product')
      .lean();

    res.render('cart', {
      title: 'Carrito',
      cart
    });
  } catch (err) {
    res.status(500).send('Error al cargar carrito');
  }
});

module.exports = router;