const Move = require('../models/move');

exports.anyPage = (req,res,next) => {
    res.send('404 Page not found');
}

exports.getLOGIN = (req,res,next) => {
    if(req.session.moveid == true){
        res.redirect('/mybol');
    }else{
        res.render('login');
    }
}

exports.postLOGIN = (req,res,next) => {
    const email = req.body.email;
    const passcode = req.body.password;

    Move.findAll({
        where: {
            email: email,
            passcode: passcode
        }
    }).then(results => {
        if(results.length > 0){
        const result = results[0];
        req.session.moveid = result.id;
        res.redirect(`/mybol`);
        }else{
            res.redirect("/login");
        }
    }).catch( err =>    {
        console.log(err);
    })
}