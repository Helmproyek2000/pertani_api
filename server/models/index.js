const sequelize = require("sequelize");

console.log("Hello World")

const db = new sequelize("pertani", "root", "12345678", {
  host: "db",
  dialect: "mysql",
  logging: false
})

db.authenticate()
  .then(() => {
    console.log("Database Authenticated");
  })
  .catch(error => {
    console.error(error);
  });

const Product = require("./Product")(db, sequelize);
const ProductCategory = require("./ProductCategory")(db, sequelize);
const ProductImage = require("./ProductImage")(db, sequelize);
const Transaction = require("./Transaction")(db, sequelize);
const TransactionDetail = require("./TransactionDetail")(db, sequelize);
const TransactionHistory = require("./TransactionHistory")(db, sequelize);
const User = require("./User")(db, sequelize);
const Client = require("./Client")(db, sequelize);
const Staff = require("./Staff")(db, sequelize);
const Cart = require("./Cart")(db, sequelize);

Product.belongsTo(ProductCategory);
Product.hasMany(ProductImage);

Product.belongsToMany(Client, { through: Cart });
Client.belongsToMany(Product, { through: Cart });

Transaction.belongsTo(Client);

Transaction.belongsToMany(Product, { through: TransactionDetail });
Product.belongsToMany(Transaction, { through: TransactionDetail });

Transaction.hasMany(TransactionHistory);
TransactionHistory.belongsTo(Staff);

Client.belongsTo(User);
Staff.belongsTo(User);

User.hasOne(Client);
User.hasOne(Staff);

// db.sync({force:true});

module.exports = {
  Product,
  ProductCategory,
  ProductImage,
  Transaction,
  TransactionDetail,
  TransactionHistory,
  User,
  Client,
  Cart,
  Staff
};
