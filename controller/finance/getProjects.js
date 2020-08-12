const debug = require('debug')('server');
const Project = require('../../model/Project');
const Program = require('../../model/Program');

const getProjects = async (req, res) => {
  try {
    const { status, programId } = req.params;

    let query; // more queries to be added for projects
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

    const projects = await Project.find(query);
    const combinedArray = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { _id, pId } = arr[controller];
        const projectStatus = arr[controller].status;
        const projectProgramId = arr[controller].programId;

        let projectProgram;
        let projectProgramShortForm;

        const chkProgram = await Program.findOne({
          _id: projectProgramId,
        });

        if (!chkProgram) {
          projectProgram = null;
          projectProgramShortForm = null;
          // eslint-disable-next-line no-else-return
        } else {
          projectProgram = chkProgram.name;
          projectProgramShortForm = chkProgram.shortForm;
        }

        const projectRemade = {
          _id,
          pId,
          status: projectStatus,
          programId: projectProgramId,
          program: projectProgram,
          programShortForm: projectProgramShortForm,
        };

        combinedArray.push(projectRemade);
        recurseProcessLeave(controller + 1, arr);
      } else {
        res.json(combinedArray);
      }
    };
    await recurseProcessLeave(0, projects);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Projects' });
  }
};

module.exports = getProjects;
