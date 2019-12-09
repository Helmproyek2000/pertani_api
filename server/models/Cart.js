module.exports = (sequelize, type) => {
  return sequelize.define(
    "cart",
    {
      amount: { type: type.INTEGER.UNSIGNED, defaultValue: 0 },
      total: { type: type.INTEGER.UNSIGNED, defaultValue: 0 }
    },
    { timestamps: false }
  );
};
