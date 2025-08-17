/*const jwt = require('jsonwebtoken')

const authenticate = (requiredRole) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.sendStatus(401)
    }

    const token = authHeader.split(' ')[1]
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      }

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: '权限不足' })
      }
      
      next()
    } catch (err) {
      res.status(401).json({ error: '令牌无效' })
    }
  }
}

module.exports = authenticate*/