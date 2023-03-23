const express = require('express');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); /* test */
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const path = require('path');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const Message = require('./models/messages');

const customerRoutes = require('./routes/customer');

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'signatures')));


const options = {
    host: 'mydb.cpi6e39gnpl9.us-east-2.rds.amazonaws.com',
    user: 'milosgak',
    password: 'TheDVTN2020',
    database: 'node-complete',
    port: 3306,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
  }; /* test end */


  /* LOGOUT */
  const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');


/* -------------- */





  const store = new MySQLStore(options); /* test */
  
  app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: store
  }));

app.use(customerRoutes);


/* RECEIVE SMS */
app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  // Your custom response logic here
  
  twiml.message('pusi ga raicu, tomatski. stisni stop ako hoces da stanes pusenje');
  console.log("STA MAI");


    console.log(`Message received from ${req.body.From}: ${req.body.Body}`);
    console.log(`Message received on Twilio number: ${req.body.To}`);
    
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

/* VOICE CALL */

app.post('/voice', (req, res) => {
  console.log(`Call received from ${req.body.From}`);

  const twiml = new VoiceResponse();

  // Forward the call to another phone number
  twiml.dial('+17082924802');

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});



app.get('/voice', (req, res) => {
  Message.findByPk(0).then(result => {
    console.log(result.message_From);
  })
  console.log(`Call received from `);
/*
  const twiml = new VoiceResponse();

  // Forward the call to another phone number
  twiml.dial('+17082924802');

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
  */
});



sequelize
  //.sync({ force: true })
  .sync()
  .then(result => {
    //console.log(result);
    app.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });