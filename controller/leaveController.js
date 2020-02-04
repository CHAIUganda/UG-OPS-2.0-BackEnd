// leaveController.js
// Import Leave model

const { validationResult} = require("express-validator/check");
const Leave = require("../model/Leave");

// Handle new Leave
exports.createLeave = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()
        });
    }

    const {
        startDate,
        endDate,
        type,
        staffEmail,
        status,
        progress,

    } = req.body;
    try {
        // let user = await User.findOne({
        //     email
        // });
        // if (user) {
        //     return res.status(400).json({
        //         msg: "User Already Exists"
        //     });
        // }

        let leave = new Leave({
            startDate,
            endDate,
            type,
            staffEmail,
            status,
            progress
        });

        await leave.save();
        res.status(200).json({
            message: "Leave Created successfully"
          });

    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            message: "Error Creating Leave"
          });
    }
}