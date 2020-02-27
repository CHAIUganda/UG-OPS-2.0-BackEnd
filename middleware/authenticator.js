const jwt = require('jsonwebtoken');
const debug = require('debug')('server');

module.exports = (req, res, next) => {
  const token = req.header('token');
  if (!token) {
    return res.status(403).json({ message: 'Auth Error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    debug(e);
    res.status(500).json({ message: 'Server Error' });
  }
};
