const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'milosgak', 'TheDVTN2020', {
  host: 'mydb.cpi6e39gnpl9.us-east-2.rds.amazonaws.com',
  dialect: 'mysql',
  logging: false,
  port: 3306
});

/*
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
  */
  
module.exports = sequelize;