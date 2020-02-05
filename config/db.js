// Import Mongoose
const mongoose = require('mongoose');
const debug = require('debug')('mongoos');

// Replace this with your MONGOURI.
const MONGOURI = 'mongodb://localhost/ugopps2';

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true
    });
    debug('Connected to DB !!');
  } catch (e) {
    debug(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;
