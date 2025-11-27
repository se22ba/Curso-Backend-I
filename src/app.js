const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');
const Product = require('./dao/models/product.model');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

io.on('connection', async socket => {
  const docs = await Product.find().lean();
  const products = docs.map(p => ({ ...p, id: p._id.toString() }));
  socket.emit('products', products);

  socket.on('newProduct', async data => {
    await Product.create(data);
    const updatedDocs = await Product.find().lean();
    const updated = updatedDocs.map(p => ({ ...p, id: p._id.toString() }));
    io.emit('products', updated);
  });

  socket.on('deleteProduct', async id => {
    await Product.findByIdAndDelete(id);
    const updatedDocs = await Product.find().lean();
    const updated = updatedDocs.map(p => ({ ...p, id: p._id.toString() }));
    io.emit('products', updated);
  });
});

const PORT = 8080;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB', err);
  });