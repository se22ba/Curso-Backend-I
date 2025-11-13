const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');
const ProductManager = require('./managers/ProductManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const pm = new ProductManager(path.join(__dirname, '..', 'data', 'products.json'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use('/', viewsRouter);


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});


io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado');

  const products = await pm.getAll();
  socket.emit('products', products);

  socket.on('newProduct', async (data) => {
    await pm.create(data);
    const updated = await pm.getAll();
    io.emit('products', updated);
  });

  socket.on('deleteProduct', async (id) => {
    await pm.delete(id);
    const updated = await pm.getAll();
    io.emit('products', updated);
  });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));