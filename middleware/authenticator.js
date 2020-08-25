const jwt = require('jsonwebtoken');
const debug = require('debug')('server');

module.exports = (req, res, next) => {
  const token = req.header('token');
  if (!token) {
    return res.status(401).json({ message: 'Token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    debug(e);
    res.status(401).json({ message: 'Token Expired' });
  }
};
