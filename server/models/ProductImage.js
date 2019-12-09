module.exports = (sequelize, type) => {
  return sequelize.define("productImage", {
    image_loc: { type: type.STRING }
  },{ timestamps: false });
};
