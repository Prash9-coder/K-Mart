import jwt from 'jsonwebtoken';

const generateToken = (id, userType = 'customer') => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: userType === 'admin' ? '8h' : '30d', // Shorter expiry for admin tokens
  });
};

export default generateToken;