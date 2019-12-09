const route = require("express").Router();

const Op = require("sequelize").Op;

const { Product, ProductCategory, ProductImage } = require("../models");

const {
  IsStaff,
  TokenValidator,
  ErrorMiddleware,
  SearchSanitizer,
  PaginationSanitizer,
  PaginateParameter,
  PaginateResponse
} = require("../utils/middleware");

const ResponseAttribute = {
  attributes: {
    exclude: ["productCategoryId"]
  },
  include: [
    {
      model: ProductCategory
    },
    {
      model: ProductImage
    }
  ]
};

const ProductCategorySanitizer = (req, res, next) => {
  const { category } = req.query;
  if (category) {
    req.params.category = parseInt(category);
  }
  next();
};

const IsExist = (req, res, next) => {
  const { id } = req.params;
  return Product.findByPk(id)
    .then(data => {
      if (data) {
        req.product = data;
        return next();
      }
      return res.sendStatus(404);
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

const CreateValidator = (req, res, next) => {
  const { name, stock, price, desc, category: productCategoryId } = req.body;

  if (req.errors.length > 0) {
    return next();
  }

  var errors = [];

  if (!(typeof name == "string" && name.length > 0))
    errors.push({
      pos: "name",
      msg: "must be a string and not empty"
    });

  if (!(typeof desc == "string" && desc.length > 0))
    errors.push({
      pos: "desc",
      msg: "must be a string and not empty"
    });

  if (!(typeof stock == "number" && stock > 0))
    errors.push({
      pos: "stock",
      msg: "must be a number and greater than 0"
    });
  if (!(typeof price == "number" && price > 0))
    errors.push({
      pos: "price",
      msg: "must be a number and greater than 0"
    });

  if (!(typeof productCategoryId == "number" && productCategoryId > 0))
    errors.push({
      pos: "category",
      msg: "must be a number and not empty"
    });

  if (errors.length > 0) {
    req.errors.push(...errors);
    return next();
  }

  return ProductCategory.findByPk(productCategoryId).then(data => {
    if (!data)
      req.errors.push({
        pos: "category",
        msg: "not exist"
      });
    return next();
  });
};

const UpdateValidator = (req, res, next) => {
  const { name, stock, price, desc, category: productCategoryId } = req.body;
  const errors = [];

  if (req.errors.length > 0) {
    return next();
  }

  if (name)
    if (!(typeof name == "string" && name.length > 0))
      errors.push({
        pos: "name",
        msg: "must be a string and not empty"
      });
  if (desc)
    if (!(typeof desc == "string" && desc.length > 0))
      errors.push({
        pos: "desc",
        msg: "must be a string and not empty"
      });
  if (stock)
    if (!(typeof stock == "number" && stock > 0))
      errors.push({
        pos: "stock",
        msg: "must be a number and greater than 0"
      });
  if (price)
    if (!(typeof price == "number" && price > 0))
      errors.push({
        pos: "price",
        msg: "must be a number and greater than 0"
      });
  if (productCategoryId)
    if (!(typeof productCategoryId == "number" && productCategoryId > 0))
      errors.push({
        pos: "category",
        msg: "must be a number and not empty"
      });

  if (errors.length > 0) {
    req.errors.push(...errors);
    return next();
  }
  if (productCategoryId)
    return ProductCategory.findByPk(productCategoryId).then(data => {
      if (!data)
        req.errors.push({
          pos: "category",
          msg: "not exist"
        });
      return next();
    });
  else return next();
};

route.get(
  "/",
  [PaginationSanitizer, SearchSanitizer, ProductCategorySanitizer],
  async (req, res) => {
    const { page_size, page_number } = req.page;
    const { search, category: productCategoryId } = req.params;

    const where = Object.assign(
      {},
      search && {
        name: {
          [Op.like]: `%${search}%`
        }
      },
      productCategoryId && { productCategoryId }
    );

    try {
      const { count, rows: product } = await Product.findAndCountAll(
        PaginateParameter(
          {
            where,
            ...ResponseAttribute
          },
          { page_number, page_size }
        )
      );

      return res.json(
        PaginateResponse(product, {
          count: count,
          page_number,
          page_size
        })
      );
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

route.get("/:id", [IsExist, ErrorMiddleware], async (req, res) => {
  const { product } = req;
  try {
    await product.reload(ResponseAttribute);
    return res.json(product);
  } catch (error) {
    return res.sendStatus(500);
  }
});
route.post(
  "/",
  [TokenValidator, IsStaff, CreateValidator, ErrorMiddleware],
  async (req, res) => {
    const { name, stock, price, desc, category: productCategoryId } = req.body;
    try {
      const product = await Product.create({
        name,
        stock,
        price,
        desc,
        productCategoryId
      });
      await product.reload(ResponseAttribute);
      return res.json(product);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);
route.put(
  "/:id",
  [TokenValidator, IsStaff, IsExist, UpdateValidator, ErrorMiddleware],
  async (req, res) => {
    const { name, stock, price, desc, category: productCategoryId } = req.body;
    const { product } = req;
    try {
      product.name = name || product.name;
      product.stock = stock || product.stock;
      product.desc = desc || product.desc;
      product.price = price || product.price;
      product.productCategoryId =
        productCategoryId || product.productCategoryId;

      await product.save();
      await product.reload(ResponseAttribute);
      return res.json(product);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);
route.delete(
  "/:id",
  [TokenValidator, IsStaff, IsExist, ErrorMiddleware],
  async (req, res) => {
    const { product } = req;
    try {
      await product.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

module.exports = route;
