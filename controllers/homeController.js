const express = require("express");
const router = express.Router();

const Product = require("../models/product");

router.get("/", (req, res) => {
    const products = Product.fetchAll(); // fetch all products from JSON
    res.render("home", { products });   // render 'home.ejs' and pass products
});

module.exports = router;
