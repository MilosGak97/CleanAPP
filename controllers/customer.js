const Move = require('../models/move');
const fs = require('fs');
const multer = require('multer'); 
const upload = multer(); 
const path = require('path');


exports.anyPage = (req,res,next) => {
    res.send('404 Page not found');
}

exports.getLOGIN = (req,res,next) => {
    if(req.session.moveid){
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
        console.log("RESULT LENGTH:");
        console.log(results.length);
        if(results.length > 0){

        const result = results[0];
        req.session.moveid = result.id;
        res.redirect(`/mybol`);
        }else{
            res.redirect("/login2552");
        }
    }).catch( err =>    {
        console.log(err);
    })
}


exports.viewBOL = (req,res,next) => {
    console.log("VIEW BOL REQ SESSION MOVE ID:");
    console.log(req.session.moveid);
    if(req.session.moveid){

        Move.findByPk(req.session.moveid).then(result => {
            console.log("VIEW BOL result.signature1_datetime:");
            console.log(result.signature1_datetime);
            if(result.signature1_datetime){
                
            console.log("VIEW BOL result.signature2_datetime");
            console.log(result.signature2_datetime);
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
                    console.log("FIRST ELSE IN VIEW BOL");
                    return res.redirect('/signedBol');
                }
            }else{
                console.log("SECOND ELSE IN VIEW BOL");
                const now = new Date();
                const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
                
                res.render('bol.ejs', {
                    result: result,
                    formattedDate:formattedDate,
                    moveid:req.session.moveid
                });
                /*
               res.send("ELSE IN FIND BY PK");*/

            }
        }).catch(err => {
            console.log(err);
        });
    }else{
        console.log("THIRD ELSE IN VIEW BOL");
        res.redirect('/login');
    }
}


exports.POSTsignature1 = (req,res,next) => {
    upload.none();

    const signature_hash = req.body.random_string;
    const signature = req.body.signature_input;
    const moveid = req.session.moveid;
    /*
    function generateRandomString(length) {
        const bytes = crypto.randomBytes(Math.ceil(length / 2));
        const hexString = bytes.toString('hex');
        return hexString.slice(0, length);
    }
    */


    // process the name and signature data here
    // ...
    // decode the signature data and save to file
    const data = signature.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    const filename = `${signature_hash}_signature.png`;
    const filepath = path.join(__dirname, '../signatures', filename);
    fs.writeFileSync(filepath, buffer);

    // send response to client
    const start_time = req.body.start_time;
    console.log(start_time);

    const now = new Date();
    const options = { timeZone: 'America/Chicago' };
    const cstDate = new Date(now.toLocaleString('en-US', options));


    //aaa
    const today = new Date();
    const todayDate = today.toLocaleDateString("en-US", {timeZone: "America/Chicago"});
    console.log("LoadTracker 100")

    Move.findByPk(req.session.moveid).then(result => {
        result.signature1_url = filename;
        result.signature1_hash = signature_hash;
        result.signature1_datetime = cstDate;
        result.start_time = start_time;
        result.start_date = todayDate;
        console.log("LoadTracker 101")
        return result.save();
        }).then(() => {
            console.log("LoadTracker 102")
            res.redirect('/signedbol');
      })
      .catch(err =>{
        console.log(err);
    });
}


exports.GETsignedBol = (req,res,next) => {
    res.render('signedbol');
}


exports.POSTbolDelivery = (req,res,next) => {

    if(req.session.moveid){


        Move.findByPk(req.session.moveid).then(result => {
                res.render('boldelivery.ejs', {
                    result: result,
                    moveid:req.session.moveid,
                    total_boolean: false,
                    final_version: false,
                    signature_delivery: false
                });
                console.log(result);
        }).catch(err => {
            console.log(err);
        })
    }
}



exports.POSTbolMaterials = (req,res,next) => {
    Move.findByPk(req.session.moveid).then(result => {
        if(req.body.cpb15>0) { result.cpb15 = req.body.cpb15; }
        if(req.body.cpb30>0){ result.cpb30 = req.body.cpb30; }
        if(req.body.cpb45>0){ result.cpb45 = req.body.cpb45; }
        if(req.body.cpb60>0) { result.cpb60 = req.body.cpb60; }
        if(req.body.cpmirror>0){ result.cpmirror = req.body.cpmirror; }
        if(req.body.cpdishpack>0){ result.cpdishpack = req.body.cpdishpack; }
        if(req.body.cpmattress>0){ result.cpmattress = req.body.cpmattress; }

        
        if(req.body.opb15>0) { result.opb15 = req.body.opb15; }
        if(req.body.opb30>0){ result.opb30 = req.body.opb30; }
        if(req.body.opb45>0){ result.opb45 = req.body.opb45; }
        if(req.body.opb60>0) { result.opb60 = req.body.opb60; }
        if(req.body.opmirror>0){ result.opmirror = req.body.opmirror; }
        if(req.body.opdishpack>0){ result.opdishpack = req.body.opdishpack; }
        if(req.body.opmattress>0){ result.opmattress = req.body.opmattress; }
        if(req.body.optape>0) { result.optape = req.body.optape; }
        if(req.body.opbubble>0){ result.opbubble = req.body.opbubble; }
        
        return result.save();
    }).then(result => {
        res.render('boldelivery.ejs', {
            result: result,
            moveid:req.session.moveid,
            total_boolean: false,
            final_version: false,
            signature_delivery: false
        });
        console.log(result);
}).catch(err => {
    console.log(err);
})
}