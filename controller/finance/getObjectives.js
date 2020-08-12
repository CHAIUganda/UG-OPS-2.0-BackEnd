const debug = require('debug')('server');
const Objective = require('../../model/Objective');
const Program = require('../../model/Program');

const getObjectives = async (req, res) => {
  try {
    const { status, programId } = req.params;

    let query; // more queries to be added for objectives
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
    const objectives = await Objective.find(query);
    const combinedArray = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { _id, objectiveCode } = arr[controller];
        const objectiveStatus = arr[controller].status;
        const objectiveProgramId = arr[controller].programId;

        let objectiveProgram;
        let objectiveProgramShortForm;

        const chkProgram = await Program.findOne({
          _id: objectiveProgramId,
        });

        if (!chkProgram) {
          objectiveProgram = null;
          objectiveProgramShortForm = null;
          // eslint-disable-next-line no-else-return
        } else {
          objectiveProgram = chkProgram.name;
          objectiveProgramShortForm = chkProgram.shortForm;
        }

        const projectRemade = {
          _id,
          objectiveCode,
          status: objectiveStatus,
          programId: objectiveProgramId,
          program: objectiveProgram,
          programShortForm: objectiveProgramShortForm,
        };

        combinedArray.push(projectRemade);
        recurseProcessLeave(controller + 1, arr);
      } else {
        res.json(combinedArray);
      }
    };
    await recurseProcessLeave(0, objectives);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Objectives' });
  }
};

module.exports = getObjectives;
