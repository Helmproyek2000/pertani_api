var admin = require("firebase-admin");
var jwt = require("jsonwebtoken");
var fs = require("fs");
var path = require("path");

const route = require("express").Router();

const { User, Client, Staff } = require("../models");

const { TokenValidator, ErrorMiddleware } = require("../utils/middleware");

const LoginValidator = (req, res, next) => {};

const IsNotLoggedIn = (req, res, next) => {
  const { authorization } = req.headers;

  if (typeof authorization === "undefined") {
    return next();
  }

  return res.sendStatus(403);
};

const field = {
  include: [
    {
      model: Client,
      attributes: { exclude: ["userId"] }
    },
    { model: Staff, attributes: { exclude: ["userId"] } }
  ]
};

var serviceAccount = require("../configs/pertani-shop-firebase-adminsdk-abm4l-a6bbea836d.json");
var privateKey = fs.readFileSync(
  path.resolve(__dirname, "../configs/private.key")
);
var publicKey = fs.readFileSync(
  path.resolve(__dirname, "../configs/public.key")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pertani-shop.firebaseio.com"
});

route.post("/register", [IsNotLoggedIn, ErrorMiddleware], async (req, res) => {
  const user = await admin.auth().getUser(uid);
  const uid = "M5FcfPmpAqVz0uM5G4LfR1pTX813";
  return res.json(user);
});

route.post("/login", [IsNotLoggedIn, ErrorMiddleware], async (req, res) => {
  const { token, userId } = req.body;

  try {
    const user = await User.findByPk(userId, field);

    const jwt_token = jwt.sign({ userId }, privateKey, {
      algorithm: "RS512",
      expiresIn: "2weeks"
    });

    return res.json({
      type: "Bearer",
      token: jwt_token,
      expiredin: Date.now() + 7 * 24 * 3600 * 1000,
      user
    });
  } catch (error) {
    return res.sendStatus(500);
  }
});

route.get("/me", [TokenValidator, ErrorMiddleware], async (req, res) => {
  const { user } = req.auth;

  try {
    await user.reload(field);
    return res.json(user);
  } catch (error) {
    return res.sendStatus(500);
  }
});

module.exports = route;
