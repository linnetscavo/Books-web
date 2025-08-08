import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // In production, use environment variables for this

// Middleware to verify JSON Web Token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Невалидный или истекший токен' });
  }
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// JWT Secret for export
export { JWT_SECRET }; 