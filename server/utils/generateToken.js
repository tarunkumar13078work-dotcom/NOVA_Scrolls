import jwt from 'jsonwebtoken';

export const generateAccessToken = (id) => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign({ id, type: 'access' }, secret, { expiresIn });
};

export const generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign({ id, type: 'refresh' }, secret, { expiresIn });
};

const generateToken = (id) => generateAccessToken(id);

export default generateToken;
