import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import hashToken from '../utils/hashToken.js';
import asyncHandler from '../utils/asyncHandler.js';

const buildAuthPayload = (user, accessToken, refreshToken) => ({
  user: { id: user._id, username: user.username, createdAt: user.createdAt },
  token: accessToken,
  refreshToken,
});

export const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ message: 'Username already taken' });
  }

  const user = await User.create({ username, password });
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.status(201).json(buildAuthPayload(user, accessToken, refreshToken));
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.json(buildAuthPayload(user, accessToken, refreshToken));
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  if (decoded.type !== 'refresh') {
    return res.status(401).json({ message: 'Invalid refresh token type' });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokenHash) {
    return res.status(401).json({ message: 'Session expired' });
  }

  const incomingHash = hashToken(refreshToken);
  if (incomingHash !== user.refreshTokenHash) {
    return res.status(401).json({ message: 'Refresh token mismatch' });
  }

  const nextAccessToken = generateAccessToken(user._id);
  const nextRefreshToken = generateRefreshToken(user._id);
  user.refreshTokenHash = hashToken(nextRefreshToken);
  await user.save();

  res.json(buildAuthPayload(user, nextAccessToken, nextRefreshToken));
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.json({ message: 'Logged out' });
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch (_error) {
    return res.json({ message: 'Logged out' });
  }

  await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
  res.json({ message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
