module.exports = (sequelize,type)=>{
    return sequelize.define("transactionHistory",{
        status_code:{
            type:type.INTEGER.UNSIGNED,
            defaultValue:0
        },

    },{ timestamps: false })
}