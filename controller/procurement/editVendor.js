const { validationResult } = require('express-validator');
const debug = require('debug')('server');
const Vendor = require('../../model/Vendor');
const errorToString = require('../../helpers/errorToString');

const editVendor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }
  // eslint-disable-next-line object-curly-newline
  const { vendorId } = req.body;
  let {
    name,
    vendorEmail,
    vendorTin,
    exemptFromWHT,
    onPrequalifiedList,
    bankDetails,
  } = req.body;

  try {
    const vendor = await Vendor.findOne({
      _id: vendorId,
    });

    if (!vendor) {
      return res.status(400).json({
        message: 'Vendor Doesnot Exist',
      });
    }
    // check for what has not been modified
    if (name == null) {
      name = vendor.name;
    }
    if (vendorEmail == null) {
      vendorEmail = vendor.vendorEmail;
    }
    if (vendorTin == null) {
      vendorTin = vendor.vendorTin;
    }
    if (exemptFromWHT == null) {
      if (vendor.exemptFromWHT == null) {
        exemptFromWHT = false;
      } else {
        exemptFromWHT = vendor.exemptFromWHT;
      }
    }
    if (onPrequalifiedList == null) {
      if (vendor.onPrequalifiedList == null) {
        onPrequalifiedList = false;
      } else {
        onPrequalifiedList = vendor.onPrequalifiedList;
      }
    }

    if (bankDetails == null) {
      bankDetails = vendor.bankDetails;
    }

    // modify vendor
    await Vendor.updateOne(
      {
        _id: vendorId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          name,
          vendorEmail,
          vendorTin,
          exemptFromWHT,
          onPrequalifiedList,
          bankDetails,
        },
      }
    );

    res.status(201).json({
      message: 'Vendor details have been Modified successfully',
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
    console.log(err.message);
    res.status(500).json({ message: 'Error in Modifying Vwndor' });
  }
};

module.exports = editVendor;
