const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const sessionsRouter = require('./routes/sessions.router');
const viewsRouter = require('./routes/views.router');

const ProductsRepository = require('./repositories/products.repository');

const initializePassport = require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

initializePassport();
app.use(passport.initialize());

app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const productsRepo = new ProductsRepository();

io.on('connection', async socket => {
  const products = await productsRepo.getAllLean();
  socket.emit('products', products);

  socket.on('newProduct', async data => {
    await productsRepo.create(data);
    const updated = await productsRepo.getAllLean();
    io.emit('products', updated);
  });

  socket.on('deleteProduct', async id => {
    await productsRepo.deleteById(id);
    const updated = await productsRepo.getAllLean();
    io.emit('products', updated);
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB', err);
  });