// Import express
require('dotenv').config();
const express = require('express');
const debug = require('debug')('server');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');
const InitiateMongoServer = require('./config/db');
const schedule = require('./helpers/schedule');
const scheduleAnually = require('./helpers/scheduleAnually');
const authenticationRequired = require('./middleware/oktaAuthenticator');
// const authenticator = require('./middleware/authenticator'); // to be rplaced with Okta auth

// Import routes
const auth = require('./routes/auth');
const leaveApi = require('./routes/leaveApi');
const hrApi = require('./routes/hrApi');

// Initialise the app
const app = express();

// Configure express to handle post requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));
// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024, // 10 MB max file(s) size
    },
  })
);

// Initiate Mongo Server
InitiateMongoServer();

// Setup server port
const port = process.env.SERVER_PORT || 8080;

// Send message for default URL
app.get('/', (req, res) => res.send('Welcome to UG-OPS 2 API'));

// Use Api routes in the App
app.use('/auth', auth);
// app.use('/auth', auth);
app.use('/leaveApi', authenticationRequired, leaveApi);
app.use('/hrApi', authenticationRequired, hrApi);

// Launch app to listen to specified port
// redirect traffic to https
app.use((req, res, next) => {
  if (req.get('X-Forwarded-Proto') !== 'https') {
    res.redirect(`https://${req.get('Host')}${req.url}`);
  } else next();
});

http.createServer(app).listen(port, () => {
  debug(`http Running UG-OPS 2 on port ${port}`);
  console.log(`http Running UG-OPS 2 on port ${port}`);
});

https
  .createServer(
    {
      key: fs.readFileSync('/certs/privateKey.key'),
      cert: fs.readFileSync('/certs/certificate.crt'),
    },
    app
  )
  .listen(port, () => {
    debug(`https Running UG-OPS 2 on port ${port}`);
    console.log(`https Running UG-OPS 2 on port ${port}`);
  });

// Launch app to listen to specified port
// app.listen(port, () => {
//   debug(`Running UG-OPS 2 on port ${port}`);
//   console.log(`Running UG-OPS 2 on port ${port}`);
// });

// schedule operations
schedule.start();
scheduleAnually.start();
