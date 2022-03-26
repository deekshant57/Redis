const express = require("express");

const app = express();

const productController = require("./controller/product.controller");

app.use(express.json());

app.use("/products", productController);

module.exports = app;
