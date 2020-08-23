// procurementController.js

const createProcurement = require('./createProcurement');
const additionSupportnDocsOnRequest = require('./additionSupportnDocsOnRequest');
const procurementResponse = require('./procurementResponse');
const attachQuoteOnResponse = require('./attachQuoteOnResponse');
const getStaffProcurements = require('./getStaffProcurements');
const registerVendor = require('./registerVendor');
const editVendor = require('./editVendor');
const getVendors = require('./getVendors');

// Handle creation of a procurement request
exports.createProcurement = createProcurement;

// Handle uploading Additional files on requests
exports.additionSupportnDocsOnRequest = additionSupportnDocsOnRequest;

// Handle creation of a procurement response
exports.procurementResponse = procurementResponse;

// Handle uploading quotation file on requests
exports.attachQuoteOnResponse = attachQuoteOnResponse;

// Handle get staff procurement request response
exports.getStaffProcurements = getStaffProcurements;

// Handle registration of vendors
exports.registerVendor = registerVendor;

// Handle modification of vendors
exports.editVendor = editVendor;

// Handle get vendors
exports.getVendors = getVendors;
