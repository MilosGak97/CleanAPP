const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const Message = sequelize.define('messages',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
        
    },

    message_From: Sequelize.STRING,
    message_To: Sequelize.STRING,
    message_Body: Sequelize.STRING,
    message_Date: Sequelize.STRING
});

module.exports = Message;
