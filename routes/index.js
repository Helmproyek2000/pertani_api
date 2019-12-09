const route = require("express").Router();

const ProductCategoryRoute = require("../routes/ProductCategory");
const ProductRoute = require("../routes/Product");
const CartRoute = require("../routes/Cart");
const TransactionRoute = require("../routes/Transaction");
const UserRoute = require("../routes/User");
const AuthRoute = require("../routes/Auth");

route.use("/category", ProductCategoryRoute);
route.use("/product", ProductRoute);
route.use("/transaction", TransactionRoute);
route.use("/cart", CartRoute);
route.use("/user", UserRoute);
route.use("/auth", AuthRoute);

module.exports = route;
