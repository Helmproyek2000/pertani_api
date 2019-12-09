module.exports = (sequelize, type) => {
  return sequelize.define("productCategory", {
    id: {
      type: type.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: type.STRING
    }
  },{ timestamps: false });
};
