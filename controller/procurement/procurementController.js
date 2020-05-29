// procurementController.js

const createProcurement = require('./createProcurement');
const additionSupportnDocsOnRequest = require('./additionSupportnDocsOnRequest');

// Handle creation of a procurement request
exports.createProcurement = createProcurement;

// Handle uploading Additional files on requests
exports.additionSupportnDocsOnRequest = additionSupportnDocsOnRequest;
