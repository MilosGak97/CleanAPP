const express = require('express');
const app = express();
const sequelize = require('./util/database');

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/login', (req,res,next) => {
    res.render('index');
});

app.post('/login', (req,res,next) => {
    console.log("Console log za login post");
    return res.send("Uspesno zavrsen kod u login postu");
})

app.use('/', (req, res, next) => {
    res.send('Hello World');
  });
  
app.listen(8080);