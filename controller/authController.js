// authController.js
// Import Leave model

const { validationResult} = require("express-validator/check");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Handle new staff
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()
        });
    }

    const {
        fName,
        lName,
        contractStartDate,
        contractEndDate,
        contractType,
        internationalStaff,
        annualLeaveBF,
        programmeManagerEmail,
        unPaidLeaveTaken,
        oNames,
        email,
        password
    } = req.body;
    try {
        let user = await User.findOne({
            email
        });
        if (user) {
            return res.status(400).json({
                message: "User Already Exists"
            });
        }

        user = new User({
          fName,
          lName,
          contractStartDate,
          contractEndDate,
          contractType,
          internationalStaff,
          programmeManagerEmail,
          oNames,
          email,
          password,
          leaveDetails: {
            annualLeaveBF,
            unPaidLeaveTaken
          }
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            "randomString", {
                expiresIn: 10000
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    token: token
                });
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(500).json({  message:"Error in Saving"});
    }
}

// Handle login
exports.login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()
    });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({
      email
    });
    if (!user)
      return res.status(400).json({
        message: "User Does Not Exist"
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        message: "Incorrect Password !"
      });

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      "secret",
      {
        expiresIn: 3600  //ms
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error"
    });
  }
}

// Handle me "generate token"
exports.generatetoken = async (req, res) => {
    try {
      // request.user is getting fetched from Middleware after token authentication
      const user = await User.findById(req.user.id);
      res.json(user);
    } catch (e) {
      res.status(500).json({ message: "Error in Fetching user" });
    }
  }
  

  // Handle get all users "generate token"
exports.getUsers = async (req, res) => {
    try {
      // request.user is getting fetched from Middleware after token authentication
      const user = await User.find({});
      res.json(user);
    } catch (e) {
      res.status(500).json({ message: "Error in Fetching users" });
    }
  }
