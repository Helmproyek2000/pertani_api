module.exports = (sequelize, type) => {
  return sequelize.define(
    "transaction",
    {
      id: {
        type: type.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      canceledAt: {
        type: type.DATE,
        allowNull: true
      },
      is_canceled: {
        type: type.BOOLEAN,
        defaultValue: false
      },
      is_completed: {
        type: type.BOOLEAN,
        defaultValue: false
      },
      completedAt: {
        type: type.DATE,
        allowNull: true
      },
      createdAt: {
        type: type.DATE,
        allowNull: false,
        defaultValue: type.NOW
      },
      is_cod: {
        type: type.BOOLEAN,
        defaultValue: false
      },
      transaction_status: {
        type: type.INTEGER.UNSIGNED,
        defaultValue: 0
      },
      total_payed: {
        type: type.INTEGER.UNSIGNED,
        defaultValue: 0
      }
    },
    { timestamps: false }
  );
};
