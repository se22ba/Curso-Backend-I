const express = require('express');
const path = require('path');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');


const app = express();
app.use(express.json());



app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);



const PORT = 8080;
app.listen(PORT, () => {
console.log(`Servidor escuchando en puerto ${PORT}`);
});