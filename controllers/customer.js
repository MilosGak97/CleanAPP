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


exports.viewBOL = (req,res,next) => {
    if(req.session.moveid == true){

        Move.findByPk(req.session.moveid).then(result => {
            if(result.signature1_datetime){
                if(result.signature2_datetime){
                                
                    const travel_total = result.travel_time * result.rate;
                    const labor_total = result.labor_time * result.rate;

                    const add_service_1_total = result.add_service_11 * result.add_service_111;
                    const add_service_2_total = result.add_service_22 * result.add_service_222;
                    const add_service_3_total = result.add_service_33 * result.add_service_333;
                    res.render('bolfinal', {
                        result:result,
                        moveid: req.session.moveid,
                        labor_time: result.labor_time,
                        travel_total: travel_total,
                        labor_total: labor_total,
                        total_boolean: true,
                        packingmaterials: result.packingmaterials,
                        add_service_1_total: add_service_1_total,
                        add_service_2_total: add_service_2_total,
                        add_service_3_total: add_service_3_total,
                        subtotal: result.subtotal,
                        subtotalcc: result.subtotalcc,
                        merchantfee: result.merchantfee,
                        final_version: true,
                        signature_delivery: false
                    });
                }else{
                    return res.redirect('/signedBol');
                }
            }else{
                const now = new Date();
                const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
                console.log(formattedDate);
                /*
                res.render('customer/bol.ejs', {
                    result: result,
                    formattedDate:formattedDate,
                    moveid:req.session.moveid
                });
                */
               res.send("ELSE IN FIND BY PK");
                console.log(result);

            }
        }).catch();
    }else{
        res.redirect('/login');
    }
}