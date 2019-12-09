module.exports = (sequelize, type) => {
  return sequelize.define(
    "client",
    {
      nip: { type: type.STRING },
      ktp_image: { type: type.STRING },
      address: { type: type.STRING, allowNull: false },
      userId: { type: type.INTEGER, primaryKey: true },
      city: { type: type.STRING, allowNull: false },
      province: { type: type.STRING, allowNull: false }
    },
    { timestamps: false }
  );
};
