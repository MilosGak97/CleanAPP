const express = require('express');
const app = express();

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