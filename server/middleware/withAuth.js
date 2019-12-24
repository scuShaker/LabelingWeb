const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secret = process.env.SECRET;

function withAuth(req, res, next) {
  const token =
      req.body.token ||
      req.query.token ||
      req.headers['x-access-token'] ||
      req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  }else{
    try{
      const decoded = jwt.verify(token, secret);
      req.username = decoded.username;
      next();
    } catch (e) {
        res.status(401).json({error: e.toString()});
      }
  }
}

module.exports = withAuth;