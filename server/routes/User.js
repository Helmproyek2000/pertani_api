const route = require("express").Router();
const {
  TokenValidator,
  IsAdmin,
  IsStaff,
  ErrorMiddleware,
  PaginateParameter,
  PaginationSanitizer,
  PaginateResponse
} = require("../utils/middleware");
const { Staff, User, Client } = require("../models");

const field = {
  include: [
    {
      model: Staff,
      attributes: { exclude: ["userId"] }
    },
    {
      model: Client,
      attributes: { exclude: ["userId"] }
    }
  ]
};

const IsExist = (req, res, next) => {
  const { id } = req.params;
  const { staff } = req.auth;

  if (!staff) {
    return next();
  }

  const where = Object.assign({ id }, !staff.id_admin && { is_staff: false });

  return User.findOne({ where })
    .then(user => {
      if (user) {
        req.userData = user;
        return next();
      } else {
        return res.sendStatus(404);
      }
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

route.get(
  "/",
  [TokenValidator, IsStaff, PaginationSanitizer, ErrorMiddleware],

  async (req, res) => {
    const { page_size, page_number } = req.page;
    const { staff } = req.auth;

    const where = Object.assign({}, !staff.is_admin && { is_staff: false });

    try {
      const { count, rows: users } = await User.findAndCountAll(
        PaginateParameter({ where, ...field }, { page_number, page_size })
      );
      return res.json(
        PaginateResponse(users, { count, page_number, page_size })
      );
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);
route.get(
  "/:id",
  [TokenValidator, IsStaff, IsExist, ErrorMiddleware],
  async (req, res) => {
    const { userData } = req;
    try {
      await userData.reload(field);
      return res.json(userData);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

route.post("/:id", async (req, res) => {});

route.put("/:id", async (req, res) => {});
route.patch("/:id", async (req, res) => {});
route.delete("/:id", async (req, res) => {});

module.exports = route;
