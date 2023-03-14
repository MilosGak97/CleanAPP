const express = require('express');
const customerController = require('../controllers/customer');
const router = express.Router();

router.get('/login', customerController.getLOGIN);

router.post('/login', customerController.postLOGIN);

router.use('/mybol', customerController.viewBOL);

router.post('/signature1', customerController.POSTsignature1);

router.get('/signedBol', customerController.GETsignedBol);

router.use('/', customerController.anyPage);

module.exports = router;