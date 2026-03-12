import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ message: 'Username already taken' });
  }

  const user = await User.create({ username, password });
  const token = generateToken(user._id);
  res.status(201).json({
    user: { id: user._id, username: user.username, createdAt: user.createdAt },
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(user._id);
  res.json({
    user: { id: user._id, username: user.username, createdAt: user.createdAt },
    token,
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
