module.exports = (sequelize, type) => {
  return sequelize.define("product", {
    id: { type: type.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: type.STRING, allowNull: false },
    stock: { type: type.INTEGER, defaultValue: 0 },
    price: { type: type.INTEGER.UNSIGNED, defaultValue: 0 },
    desc: { type: type.STRING, allowNull: true },
    avg_rate: { type: type.DOUBLE.UNSIGNED, defaultValue: 0 },
    sold: { type: type.INTEGER.UNSIGNED, defaultValue: 0 },
    rated: { type: type.INTEGER.UNSIGNED, defaultValue: 0 }
  },{ timestamps: false });
};
