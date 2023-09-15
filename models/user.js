module.exports = (sequelize, DataTypes)=>{
    const User = sequelize.define("user",{
        id:{
            type: DataTypes.STRING,
            primaryKey:true
        },
        name:{
            type: DataTypes.STRING(64),
            default:null,
        },
        email:{
            type: DataTypes.STRING(128),
            validate: {
                isEmail: true,
            },
            allowNull: false,
            unique:true
        },
        password:{
            type: DataTypes.STRING(64),
            allowNull: false,
        }
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false
    });

    return User;
}