const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const productRoutes = require("./routes/productRoutes");
const homeRoutes = require("./routes/homeRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(homeRoutes);
app.use(productRoutes);

app.use((req, res) => {
    res.status(404).send("<h1>Page not found</h1>");
});

app.listen(80, () => console.log("Server running on port 80"));

