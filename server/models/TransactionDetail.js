module.exports = (sequelize,type)=>{
    return sequelize.define("transactionDetail",{
        amount:{
            type:type.INTEGER.UNSIGNED,
            defaultValue:0
        },
        price:{
            type:type.INTEGER.UNSIGNED,
            defaultValue:0
        },
        testimony:{
            type:type.STRING
        },
        rating:{
            type:type.INTEGER.UNSIGNED,
        }
    },{ timestamps: false })
}