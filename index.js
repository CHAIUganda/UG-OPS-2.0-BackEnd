// FileName: index.js

// Import express
let express = require('express');
const InitiateMongoServer = require("./config/db");

// Import routes
const auth = require("./routes/auth"); 
const leaveApi = require("./routes/leaveApi"); 

// Initialise the app
let app = express();

// Configure express to handle post requests
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Initiate Mongo Server
InitiateMongoServer();

// Setup server port
var port = process.env.PORT || 8080;

// Send message for default URL
app.get('/', (req, res) => res.send('Welcome to UG-OPS 2 API'));

// Use Api routes in the App
app.use("/auth", auth);
app.use("/leaveApi", leaveApi);


// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running UG-OPS 2 on port " + port);
});