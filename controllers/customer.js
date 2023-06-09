const Move = require('../models/move');
const fs = require('fs');
const multer = require('multer'); 
const upload = multer(); 
const path = require('path');
const moment = require('moment');
require('moment-duration-format'); // require moment-duration-format to format duration output

const crypto = require('crypto');
const sharp = require('sharp');


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


exports.POSTbolEndTime = (req,res,next) => {

    Move.findByPk(req.session.moveid).then(result => {
        const today = new Date();
        const todayDate = today.toLocaleDateString("en-US", {timeZone: "America/Chicago"});

        if(req.body.end_time){
            result.end_time = req.body.end_time;
            result.end_date = todayDate;
        }
        
        if(req.body.add_service_1 && req.body.add_service_11 && req.body.add_service_111){
            result.add_service_1 = req.body.add_service_1;
            result.add_service_11 = req.body.add_service_11;
            result.add_service_111 = req.body.add_service_111;
         }
         if(req.body.add_service_2 && req.body.add_service_22 && req.body.add_service_222){
            result.add_service_2 = req.body.add_service_2;
            result.add_service_22 = req.body.add_service_22;
            result.add_service_222 = req.body.add_service_222;
         }
         if(req.body.add_service_3 && req.body.add_service_33 && req.body.add_service_333){
            result.add_service_3 = req.body.add_service_3;
            result.add_service_33 = req.body.add_service_33;
            result.add_service_333 = req.body.add_service_333;
         }
           
        return result.save();
    }).then(result => {
        /* FORMA ZA LABOR TIME I TRAVEL TIME*/
        const date1 = new Date(`${result.start_date}T${result.start_time}Z`).toISOString();
        const date2 = new Date(`${result.end_date}T${result.end_time}Z`).toISOString();
        
        const start_datetime = new Date(date1);
        const end_datetime = new Date(date2);

        const diffInMs = Math.abs(end_datetime - start_datetime);
        const fifteenminutes = Math.ceil(diffInMs / 900000);

        let labor_time;
        if((fifteenminutes * 0.25) < 2){
            labor_time = 2;
        }else{
            labor_time = fifteenminutes * 0.25;
        }
        const labor_total = result.rate * labor_time;
        const travel_total = result.travel_time * result.rate;
        const deposit = result.deposit;

        /* FORMA ZA MATERIALS */
        
        let packingmaterials = (result.cpb15 * 4.65) + (result.cpb30 * 6.25) + (result.cpb45 * 7.65 ) + (result.cpb60 * 8.45) + (result.cpmirror * 18.55) + (result.cpdishpack * 21.55) + (result.cpmattress * 24.00) + (result.opb15 * 1.65) + (result.opb30 * 3.00) + (result.opb45 * 4.65) + (result.opb60 * 6.25) + (result.opmirror * 10.65) + (result.opdishpack * 7.65) + (result.opmattress * 21.55) + (result.optape * 3.00) + (result.opbubble * 1.05);

        add_service_1_total = result.add_service_11 * result.add_service_111;
        add_service_2_total = result.add_service_22 * result.add_service_222;
        add_service_3_total = result.add_service_33 * result.add_service_333;

        let subtotal= labor_total + travel_total + add_service_1_total + add_service_2_total + add_service_3_total + packingmaterials - deposit;
        let subtotalcc;
        let merchantfee = subtotal * 0.03;
        if(req.body.processingfee == "true"){
            subtotalcc = subtotal + merchantfee;
            merchantfee = parseFloat(merchantfee);
            merchantfee = merchantfee.toFixed(2);

        }else{
            subtotalcc = subtotal;
            merchantfee = 0;
        }
        
        subtotalcc = parseFloat(subtotalcc);
        subtotalcc = subtotalcc.toFixed(2);

        if(req.body.update_sign == "update_sign_clicked"){
            
            res.render('boldelivery', {
                result: result,
                moveid: req.session.moveid,
                labor_time: labor_time,
                travel_total: travel_total,
                labor_total: labor_total,
                total_boolean: true,
                packingmaterials: packingmaterials,
                add_service_1_total: add_service_1_total,
                add_service_2_total: add_service_2_total,
                add_service_3_total: add_service_3_total,
                subtotal: subtotal,
                subtotalcc: subtotalcc,
                merchantfee: merchantfee,
                final_version: true,
                signature_delivery: true
            }) 
        }
            
        if(req.body.update == "update_clicked") {
            res.render('boldelivery', {
                result: result,
                moveid: req.session.moveid,
                labor_time: labor_time,
                travel_total: travel_total,
                labor_total: labor_total,
                total_boolean: true,
                packingmaterials: packingmaterials,
                add_service_1_total: add_service_1_total,
                add_service_2_total: add_service_2_total,
                add_service_3_total: add_service_3_total,
                subtotal: subtotal,
                subtotalcc: subtotalcc,
                merchantfee: merchantfee,
                final_version: false,
                signature_delivery: false
            }) 

            
        result.packingmaterials = packingmaterials;
        result.labor_time = labor_time;
        result.subtotal = subtotal;
        result.subtotalcc = subtotalcc;
        result.merchantfee = merchantfee;
        return result.save();
        }

    }).catch(err => {
        console.log(err);
    });
}


exports.POSTsignature2 = (req,res,next) => {
    upload.none();

    const signature_hash = req.body.random_string;
    const signature = req.body.signature_input;
    const moveid = req.session.moveid;
    
    // decode the signature data and save to file
    const data = signature.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    const filename = `${signature_hash}_signature.png`;
    const filepath = path.join(__dirname, '../signatures', filename);
    fs.writeFileSync(filepath, buffer);

    const now = new Date();
    const options = { timeZone: 'America/Chicago' };
    const cstDate = new Date(now.toLocaleString('en-US', options));

    Move.findByPk(moveid).then(result => {
        result.signature2_url = filename;
        result.signature2_hash = signature_hash;
        result.signature2_datetime = cstDate;
        return result.save();
    }).then(result => {
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
    }).catch(err => {
        console.log(err);
    });

}

exports.GETcreatecustomer = (req,res,next) => {
    res.render('admin/createcustomer');
}
exports.GETupdateprice = (req,res,next) => {
    res.render('updateprice');
}

exports.POSTupdateprice2 = (req,res,next) => {
    const labor_time = req.body.labor_time;
    console.log(labor_time);

}


exports.POSTcreatecustomer = (req,res,next) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const phone = req.body.phone;
    const email = req.body.email;
    const passcode = req.body.passcode;
    const rate = req.body.rate;
    const crew_size = req.body.crew_size;
    const truck_number = req.body.truck_number;
    const travel_time = req.body.travel_time;
    const deposit = req.body.deposit;
    const origin_address = req.body.origin_address;
    const origin_address2 = req.body.origin_address2;
    const origin_city = req.body.origin_city;
    const origin_state = req.body.origin_state;
    const origin_zipcode = req.body.origin_zipcode;
    const destination_address = req.body.destination_address;
    const destination_address2 = req.body.destination_address2;
    const destination_city = req.body.destination_city;
    const destination_state = req.body.destination_state;
    const destination_zipcode = req.body.destination_zipcode;


    Move.create({
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        email: email,
        passcode: passcode,
        rate: rate,
        crew_size: crew_size,
        truck_number: truck_number,
        travel_time: travel_time,
        deposit: deposit,
        origin_address: origin_address,
        origin_address2: origin_address2,
        origin_city: origin_city,
        origin_state: origin_state,
        origin_zipcode: origin_zipcode,
        destination_address: destination_address,
        destination_address2: destination_address2,
        destination_city: destination_city,
        destination_state: destination_state,
        destination_zipcode: destination_zipcode
      }).then(newMove => {
        // The new move instance is created and saved to the database
        console.log('New move created:', newMove);
        res.send("New move created.")
      }).catch(err => {
        // Handle any errors that may occur during the creation process
        console.error('Error creating move:', err);
        res.send("Error, check the logs");
      });
      
}


/*                       */

exports.GETcreateinput1 = (req,res,next) => {
    res.render('input1');
}
exports.GETcreateinput2 = (req,res,next) => {
    Move.findByPk(req.session.moveid).then(result => {
        res.render('input2', {
            result:result
        })
    })
}
exports.GETcreateinput3 = (req,res,next) => {
    Move.findByPk(req.session.moveid).then(result => {
        res.render('input3', {
            result:result
        })
    })
}

exports.GETcreateinput4 = (req,res,next) => {
    Move.findByPk(req.session.moveid).then(result => {
        res.render('input4', {
            result:result
        })
    })
}

exports.POSTinput1 = (req,res,next) => {
    const signature1_datetime = req.body.signature1_datetime;
    const start_date = req.body.start_date;
    const start_time = req.body.start_time;
    const end_date = req.body.end_date;
    const end_time = req.body.end_time;
    const signature2_datetime = req.body.signature2_datetime;
    const signatures_ip = req.body.signatures_ip;
    const packingmaterials = req.body.packingmaterials;
    const subtotal = req.body.subtotal;
    const subtotalcc = req.body.subtotalcc;

    /* packing materials */
    const cpb15 = req.body.cpb15;
    const cpb30 = req.body.cpb30;
    const cpb45 = req.body.cpb45;
    const cpb60 = req.body.cpb60;
    const cpmirror = req.body.cpmirror;
    const cpdishpack = req.body.cpdishpack;
    const cpmattress = req.body.cpmattress;
    const opb15 = req.body.opb15;
    const opb30 = req.body.opb30;
    const opb45 = req.body.opb45;
    const opb60 = req.body.opb60;
    const opmirror = req.body.opmirror;
    const opdishpack = req.body.opdishpack;
    const opmattress = req.body.opmattress;
    const optape = req.body.optape;
    const opbubble = req.body.opbubble;

    /* additional service */
    const add_service_1 = req.body.add_service_1;
    const add_service_11 = req.body.add_service_11;
    const add_service_111 = req.body.add_service_111;
    const add_service_2 = req.body.add_service_2;
    const add_service_22 = req.body.add_service_22;
    const add_service_222 = req.body.add_service_222;
    const add_service_3 = req.body.add_service_3;
    const add_service_33 = req.body.add_service_33;
    const add_service_333 = req.body.add_service_333;


        /* FORMA ZA LABOR TIME I TRAVEL TIME*/
        const date1 = new Date(`${start_date}T${start_time}Z`).toISOString();
        const date2 = new Date(`${end_date}T${end_time}Z`).toISOString();
        
        const start_datetime = new Date(date1);
        const end_datetime = new Date(date2);

        const diffInMs = Math.abs(end_datetime - start_datetime);
        const fifteenminutes = Math.ceil(diffInMs / 900000);

        let labor_time2;
        if((fifteenminutes * 0.25) < 2){
            labor_time2 = 2;
        }else{
            labor_time2 = fifteenminutes * 0.25;
        }



    /* making document id */
    const document_id = crypto.randomBytes(15).toString('hex');

    /* update in base */ 
    Move.findByPk(req.session.moveid).then(result => {
        result.signature1_datetime = signature1_datetime;
        result.start_date = start_date;
        result.start_time = start_time;
        result.labor_time = labor_time2;
        result.end_date = end_date;
        result.end_time = end_time;
        result.signature2_datetime = signature2_datetime;
        result.signatures_ip = signatures_ip;
        result.packingmaterials = packingmaterials;
        result.subtotal = subtotal;
        result.subtotalcc = subtotalcc;
        
        /* packing materials */
        result.cpb15 = cpb15;
        result.cpb30 = cpb30;
        result.cpb45 = cpb45;
        result.cpb60 = cpb60;
        result.cpmirror = cpmirror;
        result.cpdishpack = cpdishpack;
        result.cpmattress = cpmattress;
        result.opb15 = opb15;
        result.opb30 = opb30;
        result.opb45 = opb45;
        result.opb60 = opb60;
        result.opmirror = opmirror;
        result.opdishpack = opdishpack;
        result.opmattress = opmattress;
        result.optape = optape;
        result.opbubble = opbubble;
        
        /* additional service */
        result.add_service_1 = add_service_1;
        result.add_service_11 = add_service_11;
        result.add_service_111 = add_service_111;
        result.add_service_2 = add_service_2;
        result.add_service_22 = add_service_22;
        result.add_service_222 = add_service_222;
        result.add_service_3 = add_service_3;
        result.add_service_33 = add_service_33;
        result.add_service_333 = add_service_333;

        /* document_id */
        result.document_id = document_id;
        
        return result.save();
    }).catch(err => {
        console.log(err);
    });
}
exports.POSTinput2 = (req,res,next) => {
    upload.none();

    const signature_hash = crypto.randomBytes(25).toString('hex');
    
    const signature = req.body.signature_input;
    const moveid = req.session.moveid;
    
    // decode the signature data and save to file
    const data = signature.replace(/^data:image\/\w+;base64,/, '');
    
    const buffer = Buffer.from(data, 'base64');
    const filename = `${signature_hash}_signature.png`;
    
    const filepath = path.join(__dirname, '../signatures', filename);
    
    fs.writeFileSync(filepath, buffer);
    

    Move.findByPk(moveid).then(result => {
        
        result.signature2_url = filename;
        result.signature2_hash = signature_hash;
        
        return result.save();
        
    }).then(() => {
        res.redirect('/createinput3');
  }).catch(err => {
        console.log(err);
    });
}
exports.POSTinput3 = (req,res,next) => {
    upload.none();

    const signature_hash = crypto.randomBytes(25).toString('hex');
    const signature = req.body.signature_input;
    const moveid = req.session.moveid;
    
    // decode the signature data and save to file
    const data = signature.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    const filename = `${signature_hash}_signature.png`;
    const filepath = path.join(__dirname, '../signatures', filename);
    fs.writeFileSync(filepath, buffer);


    Move.findByPk(req.session.moveid).then(result => {
        result.signature1_url = filename;
        result.signature1_hash = signature_hash;
        return result.save();
        }).then(() => {
            res.redirect('/createinput4');
      })
      .catch(err =>{
        console.log(err);
    });
}
exports.POSTinput4 = (req,res,next) => {
    upload.none();

    const signature_hash = crypto.randomBytes(25).toString('hex');
    const signature = req.body.signature_input;
    const moveid = req.session.moveid;
    
    // decode the signature data and save to file
    const data = signature.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    const filename = `${signature_hash}_signature.png`;
    const filepath = path.join(__dirname, '../signatures', filename);
    fs.writeFileSync(filepath, buffer);


    Move.findByPk(req.session.moveid).then(result => {
        result.signature3_url = filename;
        result.signature3_hash = signature_hash;
        return result.save();
        }).then(() => {
            res.redirect('/seesignatures');
      })
      .catch(err =>{
        console.log(err);
    });
}

exports.moveidsession = (req,res,next) => {
    
    req.session.moveid = req.body.customer_id;
    res.redirect('/createinput2');
}

exports.signaturerequest = (req,res,next) => {
    res.render('SIGNATURErequest');
}


exports.requestbolpdf = (req,res,next) => {
    res.render('requestboldpdf');
}

exports.seesignatures = (req,res,next) => {
    Move.findByPk(req.session.moveid).then(result => {
        res.render('seesignatures', {

            result:result
    
        });})
}

exports.bolpdf = (req,res,next) => {
    console.log(req.body.customer_id);
    req.session.moveid = req.body.customer_id;
    Move.findByPk(req.session.moveid).then(result =>{
        const move_date_mysql = result.move_date;
        const move_date = moment(move_date_mysql).format('MM/DD/YY');

        /* PACKING */
        const b15_prep = result.b15 * 1.75;
        const b30_prep = result.b30 * 3.15;
        const b45_prep = result.b45 * 4.90;
        const b60_prep = result.b60 * 6.55;
        const mirror_prep = result.mirror * 8.05;
        const dishpack_prep = result.dishpack * 8.05;
        const mattress_prep = result.mattress * 10.10;
        const tape_prep = result.tape * 3.15;
        const bubble_prep = result.bubble * 1.10;

        const b15 = b15_prep.toFixed(2);
        const b30 = b30_prep.toFixed(2);
        const b45 = b45_prep.toFixed(2);
        const b60 = b60_prep.toFixed(2);
        const mirror = mirror_prep.toFixed(2);
        const dishpack = dishpack_prep.toFixed(2);
        const mattress = mattress_prep.toFixed(2);
        const tape = tape_prep.toFixed(2);
        const bubble = bubble_prep.toFixed(2);

        const start_time_prep = result.start_time;
        const end_time_prep = result.end_time;
        const travel_time_prep =  moment.duration({ hours: result.travel_time }); // create a duration object with 1.5 hours
        const total_hours = 0;
        const break_time = 0;

        const start_time = moment(start_time_prep, 'HH:mm:ss').format('h:mm A'); // convert to 12-hour time format
        const end_time = moment(end_time_prep, 'HH:mm:ss').format('h:mm A'); // convert to 12-hour time format


        
        /* duration */
        const dateTimeStrStart = moment(`${move_date_mysql}T${start_time_prep}`).toISOString(); // combine date and time and format to ISO-8601 format
        const dateTimeStrEnd = moment(`${move_date_mysql}T${end_time_prep}`).toISOString(); // combine date and time and format to ISO-8601 format
        
        const duration = moment.duration(moment(dateTimeStrEnd).diff(moment(dateTimeStrStart))); // calculate duration using moment.duration()

        const jobhrs = duration.format('h[HR] m [MIN]')
        
        const travel_time = travel_time_prep.format('h[HR] m [MIN]');

        const totalhrs_prep = travel_time_prep.add(duration); // add the two duration objects together

        const totalhrs = totalhrs_prep.format('h[HR] m [MIN]');

        const travel_time_charges =  result.travel_time*138;

        const labor_time_charges = result.labor_time*138;

        const signature1_datetime = result.signature1_datetime;
        const signature2_datetime = result.signature2_datetime;

        const datetime1 = moment(result.signature1_datetime); /*  */
        const result_datetime1 = datetime1.add(6, 'hours'); /* OVAJ DOBAR SADA - SIGNATURE 1 */

        
        const datetime2 = moment(result.signature2_datetime); /*  */
        const result_datetime2 = datetime2.add(6, 'hours'); /* OVAJ DOBAR SADA - SIGNATURE 2 */
        
        const datetime3 = moment(result.signature3_datetime); /* OVAJ DOBAR NE DIRAJ */
/*
        const converted = datetime.tz(timezone);

*/
        console.log(signature1_datetime);
        res.render('bolPDF', {
        result:result,
        move_date:move_date,
        b15:b15,
        b30:b30,
        b45:b45,
        b60:b60,
        mirror:mirror,
        dishpack:dishpack,
        mattress:mattress,
        tape:tape,
        bubble:bubble,
        start_time:start_time,
        end_time:end_time,
        jobhrs:jobhrs,
        travel_time:travel_time,
        totalhrs:totalhrs,
        travel_time_charges: travel_time_charges,
        labor_time_charges: labor_time_charges ,
        signature1_datetime:result_datetime1,
        signature2_datetime:result_datetime2,
        signature3_datetime:datetime3
        });
    }).catch(err => {
        console.log(err);
    });
}

exports.GETcreateestimate = (req,res,next) => {
    return res.render('createestimate');
}

exports.POSTcreateestimate = (req,res,next) => {
    
    const move_id = req.body.move_id;

    Move.findByPk(move_id).then(result => {
        
    const move_date = moment(result.move_date);

    const min = 3;
    const max = 20;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

    const newDate = move_date.subtract(randomNum, 'days'); 

    const estimate_date = newDate.format('MMMM Do YYYY');



    const Qmin = 1000;
    const Qmax = 9999;
    const QrandomNum = Math.floor(Math.random() * (Qmax - Qmin + 1)) + Qmin;
    const estimated_hrs = result.estimated_hrs * 138;
    const estimated_travel = result.travel_time * 138 ;
    const est_packing = parseInt(result.estimated_packing);
    const total_estimate =  estimated_hrs+ estimated_travel;
    const total_estimate1 = total_estimate + est_packing;


    

    const length = 30;
    const hash = crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0, length);
    

        res.render('estimate',{
            result:result,
            newDate:estimate_date,
            QrandomNum:QrandomNum,
            total_estimate:total_estimate1,
            hash:hash
        })       
    }).catch();
 
}