module.exports = (sequelize,type)=>{
    return sequelize.define("staff",{
        userId:{
            type:type.INTEGER,
            primaryKey:true,
        },
        is_admin:{
            type:type.BOOLEAN,
            defaultValue:true
        },
    },{ timestamps: false })
}