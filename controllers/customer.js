const Move = require('../models/move');

exports.anyPage = (req,res,next) => {
    res.send('404 Page not found');
}

exports.getLOGIN = (req,res,next) => {
    res.render('index');
}

exports.postLOGIN = (req,res,next) => {
    console.log(req.body.email);
    return res.send(req.body.email);
}