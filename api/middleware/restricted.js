const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'shh';

module.exports = (req, res, next) => {
  const token = req.headers.authorization
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'token invalid' })
      } else {
        req.decodedJwt = decoded;
        next()
      }
    })
  } else {
    return res.status(401).json({ message: 'token required' })
  }
}

