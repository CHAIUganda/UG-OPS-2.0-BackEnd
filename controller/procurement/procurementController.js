// procurementController.js

const createProcurement = require('./createProcurement');
const additionSupportnDocsOnRequest = require('./additionSupportnDocsOnRequest');
const procurementResponse = require('./procurementResponse');

// Handle creation of a procurement request
exports.createProcurement = createProcurement;

// Handle uploading Additional files on requests
exports.additionSupportnDocsOnRequest = additionSupportnDocsOnRequest;

// Handle creation of a procurement response
exports.procurementResponse = procurementResponse;
