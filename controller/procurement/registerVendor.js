const { validationResult } = require('express-validator');
const debug = require('debug')('server');
const log4js = require('log4js');
const Vendor = require('../../model/Vendor');
const errorToString = require('../../helpers/errorToString');

const registerVendor = async (req, res) => {
  const errors = validationResult(req);
  const logger = log4js.getLogger('Timed');
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  const {
    name,
    vendorEmail,
    vendorTin,
    exemptFromWHT,
    onPrequalifiedList,
  } = req.body;

  let { bankDetails } = req.body;

  if (bankDetails == null) {
    bankDetails = [];
  }
  try {
    let vendor = await Vendor.findOne({
      name,
    });

    if (vendor) {
      return res.status(400).json({
        message: 'This Vendor Already Exists',
      });
    }
    // create vendor
    vendor = new Vendor({
      name,
      vendorEmail,
      vendorTin,
      exemptFromWHT,
      onPrequalifiedList,
      bankDetails,
    });

    await vendor.save();
    res.status(201).json({
      message: 'Vendor Created successfully',
      _id: vendor._id,
      name,
      vendorEmail,
      vendorTin,
      exemptFromWHT,
      onPrequalifiedList,
      bankDetails,
    });
  } catch (err) {
    debug(err.message);
    logger.error(`Error saving ${err.message}`);
    console.log(`Error saving ${err.message}`);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = registerVendor;
