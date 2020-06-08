const express = require('express');
const bodyParser = require('body-parser');
var cowsay = require("cowsay");
const cookieParser = require('cookie-parser')

const port = process.env.PORT || 1337;
const api = require('./api');
const auth = require('./auth')
const middleware = require('./middleware');

const app = express();
app.use(middleware.cors);
app.use(cookieParser());
app.use(bodyParser.json())
// auth.setMiddleware(app)

app.post('/login', auth.authenticate, auth.login)
app.get('/products', api.listProducts);
app.get(`/products/:id`, api.getProduct);
app.post('/products', auth.ensureUser, api.createProduct);
app.put('/products/:id', auth.ensureUser, api.editProduct);
app.delete('/products/:id', auth.ensureUser, api.deleteProduct);
app.get('/orders', auth.ensureUser, api.listOrders)
app.post('/orders', auth.ensureUser, api.createOrder)
app.post('/users', api.createUser);

app.use(middleware.handleError);
app.use(middleware.notFound);


app.listen(port, () =>console.log(`Started on port ${port}`));


