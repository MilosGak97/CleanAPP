const express = require('express');
const app = express();
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const path = require('path');

const customerRoutes = require('./routes/customer');

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));



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