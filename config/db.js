//FILENAME : db.js

// Import Mongoose
let mongoose = require('mongoose');

// Replace this with your MONGOURI.
const MONGOURI = 'mongodb://localhost/ugopps2';

const InitiateMongoServer = async () => {
    try {
    await mongoose.connect(MONGOURI, {
        useNewUrlParser: true
    });
    console.log("Connected to DB !!");
    } catch (e) {
    console.log(e);
    throw e;
    }
};

module.exports = InitiateMongoServer;
