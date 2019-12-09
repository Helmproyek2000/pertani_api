const route = require("express").Router();
const {
  PaginationSanitizer,
  PaginateParameter,
  PaginateResponse,
  IsClient,
  IsStaff,
  TokenValidator,
  ErrorMiddleware
} = require("../utils/middleware");

const Op = require("sequelize").Op;

const {
  User,
  Staff,
  Client,
  Product,
  Transaction,
  TransactionHistory
} = require("../models");

const TransactionStatus = [
  "Need confirmation",
  "Waiting for payment",
  "Transaction on process",
  "Product on delivery",
  "Product delivered"
];

const field = {
  include: [
    {
      model: Client,
      include: [
        {
          model: User
        }
      ]
    },
    { model: Product, through: true },
    { model: TransactionHistory, include: [{ model: Staff }] }
  ]
};

const IsExist = (req, res, next) => {
  const { id } = req.params;
  const { client } = req.auth;
  const where = Object.assign(
    { id },
    typeof client != "undefined" ? { clientUserId: client.userId } : null
  );

  Transaction.findOne({
    where,
    field
  })
    .then(data => {
      if (data) {
        req.transaction = data;
        return next();
      }
      return res.sendStatus(404);
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

const IsStatusUpdatable = (req, res, next) => {
  const { transaction } = req;
  if (!transaction) return next();
  if (
    !transaction.is_canceled &&
    !transaction.is_completed &&
    transaction.transaction_status >= 0 &&
    transaction.transaction_status < 4
  )
    return next();
  req.errors.push({
    pos: "transaction",
    msg: "status unupdatable"
  });
  return next();
};

const IsCancelable = (req, res, next) => {
  const { transaction } = req;
  const { client } = req.auth;
  if (!client || !transaction) return next();

  if (
    (!transaction.is_canceled && transaction.transaction_status === 0) ||
    transaction.transaction_status == 1
  )
    return next();

  req.errors.push({
    pos: "id",
    msg: "not exist or cannot be canceled"
  });
  return next();
};

const HasUncompleted = (req, res, next) => {
  const { client } = req.auth;

  if (!client) {
    return next();
  }

  return Transaction.findOne({
    where: {
      clientUserId: client.userId,
      is_completed: false
    }
  })
    .then(data => {
      if (!data) return next();

      req.errors.push({
        pos: "transaction",
        msg: "there is uncompleted transaction"
      });
      return next();
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

const IsCompletable = (req, res, next) => {
  const { client } = req.auth;
  if (!client) return next();
  return Transaction.findOne({
    where: {
      clientUserId: client.userId,
      is_canceled: false,
      is_completed: false,
      transaction_status: 4
    }
  })
    .then(data => {
      if (data) {
        req.transaction = data;
        return next();
      }

      req.errors.push({
        pos: "transaction",
        msg: "not completable transaction"
      });
      return next();
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

const CreateValidator = (req, res, next) => {
  const { cart, cod } = req.body;
  if (cart)
    if (!(typeof cart == "object" && cart.length >= 0))
      req.errors.push = {
        pos: "cart",
        msg: "must be an array and not empty"
      };
  if (cod)
    if (!(typeof cod == "boolean"))
      req.errors.push = {
        pos: "cod",
        msg: "must be a boolean value"
      };

  return next();
};

route.get(
  "/",
  [TokenValidator, PaginationSanitizer, IsStaff],
  async (req, res, next) => {
    const { page_number, page_size } = req.page;
    if (!req.auth.staff) {
      return next();
    }
    try {
      const { count, rows: data } = await Transaction.findAndCountAll(
        PaginateParameter(field, { page_number, page_size })
      );
      return res.json(
        PaginateResponse(data, { count, page_number, page_size })
      );
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

route.get("/", [IsClient], async (req, res) => {
  const { page_number, page_size } = req.page;

  if (!req.auth.client) {
    return ErrorMiddleware(req, res);
  }

  const { client } = req.auth;

  try {
    const { count, rows: data } = await Transaction.findAndCountAll(
      PaginateParameter(
        { where: { clientUserId: client.userId }, ...field },
        { page_number, page_size }
      )
    );
    return res.json(PaginateResponse(data, { count, page_number, page_size }));
  } catch (error) {
    return res.sendStatus(500);
  }
});

route.get(
  "/:id",
  [TokenValidator, IsClient, IsExist, ErrorMiddleware],
  async (req, res) => {
    const { transaction } = req;
    try {
      await transaction.reload(field);
      return res.json(transaction);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

route.post(
  "/",
  [TokenValidator, IsClient, CreateValidator, HasUncompleted, ErrorMiddleware],
  async (req, res) => {
    const clientUserId = 1;
    const { cart, cod } = req.body;
    const where = Object.assign(
      {},
      cod && { cod },
      cart && {
        id: {
          [Op.in]: cart
        }
      }
    );

    try {
      const client = await Client.findByPk(clientUserId, {
        include: [{ model: Product, through: true }, { model: User }]
      });

      if ((await client.countProducts({ where })) == 0) {
        return res.sendStatus(400);
      }
      const products = await client.getProducts({ where });
      const transaction = await Transaction.create({ clientUserId });

      for (const el of products) {
        await transaction.addProduct(el.id, {
          through: {
            amount: el.cart.amount,
            price: el.price,
            total: el.cart.price
          }
        });
      }

      await client.removeProduct(products);

      await transaction.reload(field);

      return res.json(transaction);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

route.post(
  "/:id/cancel",
  [TokenValidator, IsClient, IsExist, IsCancelable, ErrorMiddleware],
  async (req, res) => {
    const { transaction } = req;
    try {
      await transaction.update({ is_canceled: true, canceledAt: Date.now() });
      await transaction.reload(field);
      return res.json(transaction);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

route.post(
  "/:id/complete",
  [TokenValidator, IsClient, IsExist, IsCompletable, ErrorMiddleware],
  async (req, res) => {
    const { transaction } = req;
    try {
      transaction.is_completed = true;
      transaction.completedAt = Date.now();
      await transaction.save();

      await transaction.reload(field);

      return res.json(transaction);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

route.post(
  "/:id/update_status",
  [TokenValidator, IsStaff, IsExist, IsStatusUpdatable, ErrorMiddleware],
  async (req, res) => {
    const { transaction } = req;
    const { staff } = req.auth;
    try {
      const newStatusCode = transaction.transaction_status + 1;
      transaction.transaction_status = newStatusCode;
      await transaction.save();
      await TransactionHistory.create({
        transactionId: transaction.id,
        staffUserId: staff.userId,
        status_code: newStatusCode
      });
      await transaction.reload(field);
      return res.json(transaction);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

module.exports = route;
