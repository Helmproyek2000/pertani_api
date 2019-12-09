module.exports = (sequelize, type) => {
  return sequelize.define("user", {
    id: {
      type: type.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    first_name: {
      type: type.STRING
    },
    last_name: {
      type: type.STRING,
      allowNull: true,
      defaultValue: ""
    },
    email: {
      type: type.STRING,
      allowNull: true,
      unique: true
    },
    password: {
      type: type.STRING,
      allowNull: true
    },
    social_user_id: {
      type: type.STRING,
      unique: true
    },
    is_staff: {
      type: type.BOOLEAN
    },
    is_client: {
      type: type.BOOLEAN
    },
    confirmed: {
      type: type.BOOLEAN
    }
  },{ timestamps: false });
};
