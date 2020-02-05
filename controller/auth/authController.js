// authController.js

const registerUser = require('./registerUser');

// Handle new staff
exports.registerUser = registerUser;

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
    const user = await User.findOne({
      email
    });
    if (!user) {
      return res.status(400).json({
        message: 'User Does Not Exist'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Incorrect Password !'
      });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      'secret',
      {
        expiresIn: 3600 // ms
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token
        });
      }
    );
  } catch (e) {
    debug(e);
    res.status(500).json({
      message: 'Server Error'
    });
  }
};

// Handle me "generate token"
exports.generatetoken = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Error in Fetching user' });
  }
};

// Handle get all users "generate token"
exports.getUsers = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.find({});
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Error in Fetching users' });
  }
};
