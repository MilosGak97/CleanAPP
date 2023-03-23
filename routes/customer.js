const express = require('express');
const customerController = require('../controllers/customer');
const router = express.Router();

router.get('/login', customerController.getLOGIN);

router.post('/login', customerController.postLOGIN);

router.use('/mybol', customerController.viewBOL);

router.post('/signature1', customerController.POSTsignature1);

router.get('/signedBol', customerController.GETsignedBol);

router.post('/boldelivery', customerController.POSTbolDelivery);

router.post('/bolmaterials', customerController.POSTbolMaterials);

router.post('/bolendtime', customerController.POSTbolEndTime);

router.post('/signature2', customerController.POSTsignature2);


/* ---------- ADD CUSTOMERS -------------------- */ 
/*
router.get('/createcustomer', customerController.GETcreatecustomer);

router.post('/createcustomer', customerController.POSTcreatecustomer);
*/
router.get('/createinput1', customerController.GETcreateinput1);
router.use('/createinput2', customerController.GETcreateinput2);
router.use('/createinput3', customerController.GETcreateinput3);
router.use('/createinput4', customerController.GETcreateinput4);


router.post('/input1', customerController.POSTinput1);
router.post('/input2', customerController.POSTinput2);
router.post('/input3', customerController.POSTinput3);
router.post('/input4', customerController.POSTinput4);

 /*
router.get('/updateprice', customerController.GETupdateprice);

router.post('/updateprice', customerController.POSTupdateprice);

router.post('/updateprice2', customerController.POSTupdateprice2);
*/
router.get('/bolpdf', customerController.requestbolpdf);
router.post('/bolpdf', customerController.bolpdf);

router.post('/moveidsession', customerController.moveidsession);
router.get('/signaturerequest', customerController.signaturerequest);
router.use('/seesignatures', customerController.seesignatures);


router.use('/', customerController.anyPage);

module.exports = router;