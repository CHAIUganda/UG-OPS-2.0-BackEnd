// Import express
require('dotenv').config();
const express = require('express');
const debug = require('debug')('server');

const InitiateMongoServer = require('./config/db');

// Import routes
const auth = require('./routes/auth');
const leaveApi = require('./routes/leaveApi');

// Initialise the app
const app = express();

// Configure express to handle post requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initiate Mongo Server
InitiateMongoServer();

// Setup server port
const port = process.env.PORT || 8080;

// Send message for default URL
app.get('/', (req, res) => res.send('Welcome to UG-OPS 2 API'));

// Use Api routes in the App
app.use('/auth', auth);
app.use('/leaveApi', leaveApi);

// Launch app to listen to specified port
app.listen(port, () => {
  debug(`Running UG-OPS 2 on port ${port}`);
});
