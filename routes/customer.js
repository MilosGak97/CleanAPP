const express = require('express');
const customerController = require('../controllers/customer');
const router = express.Router();

router.use('/', customerController.anyPage);

/*
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
  */

module.exports = router;