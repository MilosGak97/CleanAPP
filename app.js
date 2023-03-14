const express = require('express');
const app = express();
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));






app.get('/login', (req,res,next) => {
    res.render('index');
});

app.post('/login', (req,res,next) => {
    console.log(req.body.email);
    return res.send(req.body.email);
})

app.use('/', (req, res, next) => {
    res.send('Hello World');
  });
  

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