module.exports = (sequelize,DataTypes)=>{
    const Community = sequelize.define("community",{
        id:{
            type:DataTypes.STRING(128),
            allowNull:false,
            primaryKey:true
        },
        name:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        slug:{
            type:DataTypes.STRING,
            unique:true
        },
    });

    return Community;
}