const express = require("express");
const router = express.Router();
//const homeController = require("../controllers/homeController");

const Product = require("../models/product");

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/menu', (req, res) => {
    const products = Product.fetchAll();
    res.render('menu', {products});
});

router.get('/contact', (req, res) => {
    res.render('contact');
});
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

module.exports = router;