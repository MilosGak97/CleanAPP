const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'milosgak', 'TheDVTN2020', {
  host: 'mydb.cpi6e39gnpl9.us-east-2.rds.amazonaws.com',
  dialect: 'mysql',
  logging: true, 
  port: 3306
});




  
module.exports = sequelize;