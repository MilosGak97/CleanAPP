const express = require('express');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); /* test */
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const path = require('path');

const customerRoutes = require('./routes/customer');

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));


const options = {
    host: 'mydb.cpi6e39gnpl9.us-east-2.rds.amazonaws.com',
    user: 'milosgak',
    password: 'TheDVTN2020',
    database: 'node-complete',
    port: 3306,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
  }; /* test end */
  
  const store = new MySQLStore(options); /* test */
  
  app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: store
  }));

app.use(customerRoutes);


sequelize
  //.sync({ force: true })
  .sync()
  .then(result => {
    //console.log(result);
    app.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });