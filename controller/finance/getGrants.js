const debug = require('debug')('server');
const Grant = require('../../model/Grant');
const Program = require('../../model/Program');

const getGrants = async (req, res) => {
  try {
    const { status, programId } = req.params;

    let query; // more queries to be added for grants
    if (status) {
      if (status === 'all' && programId === 'all') {
        query = {};
      } else if (status === 'all' && programId !== 'all') {
        query = { programId };
      } else if (status !== 'all' && programId === 'all') {
        // Active Archived
        query = { status };
      } else {
        query = { programId, status };
      }
    }

    const grants = await Grant.find(query);

    const combinedArray = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { _id, gId } = arr[controller];
        const grantstatus = arr[controller].status;
        const grantProgramId = arr[controller].programId;

        let Grantprogram;
        let GrantprogramShortForm;

        const chkProgram = await Program.findOne({
          _id: grantProgramId,
        });

        if (!chkProgram) {
          Grantprogram = null;
          GrantprogramShortForm = null;
          // eslint-disable-next-line no-else-return
        } else {
          Grantprogram = chkProgram.name;
          GrantprogramShortForm = chkProgram.shortForm;
        }

        const grantRemade = {
          _id,
          gId,
          status: grantstatus,
          programId: grantProgramId,
          program: Grantprogram,
          programShortForm: GrantprogramShortForm,
        };

        combinedArray.push(grantRemade);
        recurseProcessLeave(controller + 1, arr);
      } else {
        res.json(combinedArray);
      }
    };
    await recurseProcessLeave(0, grants);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Grants' });
  }
};

module.exports = getGrants;
