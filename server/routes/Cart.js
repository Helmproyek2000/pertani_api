const route = require("express").Router();

const {
  TokenValidator,
  IsClient,
  ErrorMiddleware
} = require("../utils/middleware");

const { Product, ProductCategory, ProductImage } = require("../models");

const field = {
  include: [
    {
      model: Product,
      through: { attributes: ["amount", "total"] },
      attributes: {
        exclude: ["productCategoryId"]
      },
      include: [{ model: ProductCategory }, { model: ProductImage }]
    }
  ]
};

const DeleteValidator = (req, res, next) => {
  const { id } = req.params;
  const { client } = req.auth;

  return Product.findByPk(id)
    .then(data => {
      return client.hasProduct(data).then(isExist => {
        if (isExist) {
          req.product = data;
          return next();
        } else {
          return res.sendStatus(404);
        }
      });
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

const CreateValidator = (req, res, next) => {
  const { productId, amount } = req.body;
  var errors = [];

  if (typeof productId != "number" || productId <= 0) {
    errors.push({
      pos: "productId",
      msg: "must be a positive number"
    });
  }

  if (typeof amount != "number" || amount <= 0) {
    errors.push({
      pos: "amount",
      msg: "must be a positive number"
    });
  }

  req.errors.push(...errors);

  if (errors.length > 0) return next();

  return Product.findByPk(productId, {
    attributes: ["id", "name", "stock", "price"],
    include: { model: ProductCategory, attributes: ["id", "name"] }
  })
    .then(data => {
      if (data) {
        req.product = data;
        return next();
      }

      errors.push({
        pos: "productId",
        msg: "doesn't exist"
      });

      req.errors.push(...errors);
      return next();
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

route.get(
  "/",
  [TokenValidator, IsClient, ErrorMiddleware],
  async (req, res) => {
    const { client } = req.auth;
    try {
      await client.reload(field);

      return res.json(client.products);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

route.post(
  "/",
  [TokenValidator, IsClient, CreateValidator, ErrorMiddleware],
  async (req, res) => {
    const { product } = req;
    const { client } = req.auth;
    const { amount } = req.body;
    try {
      await client.addProduct(product, {
        through: { amount, total: product.price * amount }
      });
      await client.reload(field);
      return res.json(client.products);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

route.delete(
  "/:id",
  [TokenValidator, IsClient, DeleteValidator, ErrorMiddleware],
  async (req, res) => {
    const { product } = req;
    const { client } = req.auth;
    try {
      await client.removeProduct(product);
      return res.status(204).send();
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

module.exports = route;
