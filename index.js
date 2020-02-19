// Import express
require('dotenv').config();
const express = require('express');
const debug = require('debug')('server');
const cors = require('cors');

const InitiateMongoServer = require('./config/db');
// const authenticationRequired = require('./middleware/oktaAuthenticator');

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

// Initiate Mongo Server
InitiateMongoServer();

// Setup server port
const port = process.env.SERVER_PORT || 8080;

// Send message for default URL
app.get('/', (req, res) => res.send('Welcome to UG-OPS 2 API'));

// Use Api routes in the App
// app.use('/auth', authenticationRequired, auth);
app.use('/auth', auth);
app.use('/leaveApi', leaveApi);
app.use('/hrApi', hrApi);

// Launch app to listen to specified port
app.listen(port, () => {
  debug(`Running UG-OPS 2 on port ${port}`);
  console.log(`Running UG-OPS 2 on port ${port}`);
});
