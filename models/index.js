'use strict';

const { log } = require('console');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};
const dotenv = require("dotenv");
dotenv.config();

let sequelize;
if(config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable],config);
}else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}
fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname,file))(sequelize,Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if(db[modelName].associate){
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//user-community (many to many relationship through member)
db.user.belongsToMany(db.community, {as:'communities',through: db.member, foreignKey: 'user'});
db.community.belongsToMany(db.user, {as:'members',through: db.member, foreignKey: 'community'});

//user-member (one to many relationship through user)
db.user.hasMany(db.member,{as:'members', foreignKey:'user'});
db.member.belongsTo(db.user,{as:'users', foreignKey:'user'});

//user-community (one to many relationship through owner)
db.user.hasMany(db.community,{as:'communityowned',foreignKey:'owner'});
db.community.belongsTo(db.user,{as:'communityowner',foreignKey:'owner'});

//role-member (one to many relationship through role)
db.role.hasMany(db.member,{as:'members', foreignKey:'role'});
db.member.belongsTo(db.role,{as:'roles', foreignKey:'role'});


module.exports = db;