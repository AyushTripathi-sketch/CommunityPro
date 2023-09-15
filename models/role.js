module.exports = (sequelize,DataTypes) => {
    const Role = sequelize.define("role",{
        id:{
            type: DataTypes.STRING,
            primaryKey: true
        },
        name:{
            type:DataTypes.STRING(64),
            unique: true,
            allowNull:false
        }
    });

    return Role;
}