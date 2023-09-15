module.exports = (sequelize,DataTypes) =>{
    const Member = sequelize.define('member',{
        id:{
            type: DataTypes.STRING,
            primaryKey:true
        },
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false
    });

    return Member;
}