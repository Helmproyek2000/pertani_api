const route = require("express").Router();
const {
  ErrorMiddleware,
  IsStaff,
  TokenValidator
} = require("../utils/middleware");
const { ProductCategory } = require("../models");

const IsExist = (req, res, next) => {
  const { id } = req.params;
  ProductCategory.findByPk(id)
    .then(data => {
      if (data) {
        req.category = data;
        return next();
      }
      return res.sendStatus(404);
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

const CreateUpdateValidator = (req, res, next) => {
  const { name } = req.body;

  if (!(typeof name == "string" && name.length > 0))
    req.errors.push({
      pos: "name",
      msg: "must be a string and not empty"
    });

  next();
};

route.get("/", async (req, res) => {
  try {
    const data = await ProductCategory.findAll();
    return res.json(data);
  } catch (error) {
    return res.sendStatus(500);
  }
});

route.post(
  "/",
  [TokenValidator, IsStaff, CreateUpdateValidator, ErrorMiddleware],
  async (req, res) => {
    const { name } = req.body;
    try {
      const data = await ProductCategory.create({ name });
      return res.json(data);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);
route.put(
  "/:id",
  [TokenValidator, IsStaff, IsExist, CreateUpdateValidator, ErrorMiddleware],
  async (req, res) => {
    const { name } = req.body;
    const { category } = req;
    try {
      await category.update({ name });
      await category.reload();
      return res.json(category);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);
route.delete(
  "/:id",
  [TokenValidator, IsStaff, IsExist, ErrorMiddleware],
  async (req, res) => {
    const { category } = req;
    try {
      await category.destroy();
      return res.sendStatus(204);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

module.exports = route;
