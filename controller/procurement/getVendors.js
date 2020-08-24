const debug = require('debug')('server');
const Vendor = require('../../model/Vendor');

const getVendors = async (req, res) => {
  try {
    const vendor = await Vendor.find({});

    const combinedArray = [];

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const {
          _id,
          name,
          vendorEmail,
          registeredAddress,
          vendorTin,
          exemptFromWHT,
          onPrequalifiedList,
          bankDetails,
        } = arr[controller];

        const vendorRemade = {
          _id,
          name,
          vendorEmail,
          registeredAddress,
          vendorTin,
          exemptFromWHT,
          onPrequalifiedList,
          bankDetails,
        };

        combinedArray.push(vendorRemade);

        recurseProcessLeave(controller + 1, arr);
      } else {
        res.status(200).json(combinedArray);
      }
    };
    await recurseProcessLeave(0, vendor);
  } catch (e) {
    debug(e.message);
    res
      .status(500)
      .json({ message: `Error in Fetching Vendors:: ${e.message}`, e });
  }
};

module.exports = getVendors;
