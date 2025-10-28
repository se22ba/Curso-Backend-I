
const express = require('express');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

const app = express();
app.use(express.json());


app.get('/', (req, res) => {
  res.json({ ok: true, api: 'Hola soy una APUS' });
});


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));