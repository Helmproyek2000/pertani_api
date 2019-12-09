const { Client, Staff, User } = require("../models");
const jwt = require("jsonwebtoken");

const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.resolve(__dirname, "../configs/private.key")
);

const publicKey = fs.readFileSync(
  path.resolve(__dirname, "../configs/public.key")
);

const TokenValidator = (req, res, next) => {
  const { authorization } = req.headers;

  if (typeof authorization === "undefined") {
    return res.sendStatus(401);
  }

  const [auth_type, auth_token] = authorization.split(" ");

  if (auth_type == "Bearer") {
    return jwt.verify(
      auth_token,
      publicKey,
      { algorithms: "RS512" },
      (err, decode) => {
        if (err) {
          return next();
        } else {
          const id = decode.userId;
          return User.findByPk(id)
            .then(user => {
              if (user) {
                req.auth.user = user;
              } else {
                return res.sendStatus(401);
              }
              return next();
            })
            .catch(err => {
              return res.sendStatus(500);
            });
        }
      }
    );
  } else {
    return next();
  }
};

const SearchSanitizer = (req, res, next) => {
  const { q } = req.query;
  req.params.search = q;
  return next();
};

const PaginationSanitizer = (req, res, next) => {
  const { page, page_size } = req.query;
  req.page = {
    page_number: parseInt(page) || 1,
    page_size: parseInt(page_size) || 10
  };
  return next();
};

const PaginateResponse = (data, { count, page_number, page_size }) => {
  return {
    page: {
      has_prev: page_number > 1,
      has_next: page_number * page_size < count,
      total_page: Math.ceil(count / page_size),
      current_page: page_number
    },
    data
  };
};

const PaginateParameter = (query, { page_number, page_size }) => {
  const offset = (page_number - 1) * page_size;
  const limit = page_size;

  return {
    ...query,
    offset,
    limit
  };
};

const ErrorMiddleware = (req, res, next) => {
  const { errors } = req;
  if (typeof errors != "undefined" && errors.length > 0) {
    return res.status(400).json(errors);
  }
  return next();
};

const IsClient = (req, res, next) => {
  const { user } = req.auth;
  if (!user) {
    return next();
  }
  if (!user.is_client) {
    res.sendStatus(403);
  } else {
    return user
      .getClient()
      .then(client => {
        req.auth.client = client;
        return next();
      })
      .catch(err => {
        return res.sendStatus(500);
      });
  }
};

const IsStaff = (req, res, next) => {
  const { user } = req.auth;
  if (!user) {
    return next();
  }
  if (!user.is_staff) {
    return res.sendStatus(403);
  } else {
    return user
      .getStaff()
      .then(staff => {
        req.auth.staff = staff;
        return next();
      })
      .catch(err => {
        return res.sendStatus(500);
      });
  }
};

const IsAdmin = (req, res, next) => {
  const { user } = req.auth;
  if (!user) {
    return next();
  }
  if (!user.is_staff) {
    return res.sendStatus(403);
  } else {
    return user
      .getStaff()
      .then(staff => {
        if (staff.is_admin) {
          req.auth.admin = staff;
        } else {
          return res.sendStatus(403);
        }
        return next();
      })
      .catch(err => {
        console.log(err);
        return res.sendStatus(500);
      });
  }
};

module.exports = {
  PaginateParameter,
  PaginateResponse,
  SearchSanitizer,
  ErrorMiddleware,
  PaginationSanitizer,
  IsClient,
  IsStaff,
  IsAdmin,
  TokenValidator
};
