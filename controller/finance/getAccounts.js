const debug = require('debug')('server');
const Account = require('../../model/Account');

const getAccounts = async (req, res) => {
  try {
    const { status } = req.params;

    let query; // more queries to be added for accounts
    if (status) {
      if (status === 'all') {
        query = {};
      } else if (
        // eslint-disable-next-line operator-linebreak
        status === 'Active' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Archived'
      ) {
        query = { status };
      } else {
        return res.status(400).json({
          message: 'Invalid Status',
        });
      }
    }

    const accounts = await Account.find(query);
    res.json(accounts);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Accounts' });
  }
};

module.exports = getAccounts;
