import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuditLog } from '../models/AuditLog';
import { body, validationResult } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg,   // show the first specific error message
      errors: errors.array(),
    });
    return;
  }

  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const user = await User.create({ email, password, name });

  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id));

  user.refreshToken = refreshToken;
  await user.save();

  await AuditLog.create({
    userId: user._id, actorType: 'user', action: 'REGISTER',
    resourceType: 'user', resourceId: String(user._id),
    metadata: { email }, ipAddress: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });

  res.status(201).json({ success: true, message: 'Account created successfully', data: { user, accessToken, refreshToken } });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ success: false, message: 'Account is deactivated' });
    return;
  }

  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id));

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  await AuditLog.create({
    userId: user._id, actorType: 'user', action: 'LOGIN',
    resourceType: 'user', resourceId: String(user._id),
    metadata: { email }, ipAddress: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });

  const userObj = user.toJSON();
  res.json({ success: true, message: 'Login successful', data: { user: userObj, accessToken, refreshToken } });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  if (!token) {
    res.status(401).json({ success: false, message: 'Refresh token required' });
    return;
  }

  try {
    const { userId } = verifyRefreshToken(token);
    const user = await User.findById(userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const accessToken = generateAccessToken(String(user._id), user.role);
    const newRefreshToken = generateRefreshToken(String(user._id));
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request & { user?: { userId: string } }, res: Response): Promise<void> => {
  if (req.user?.userId) {
    await User.findByIdAndUpdate(req.user.userId, { $unset: { refreshToken: 1 } });
  }
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: Request & { user?: { userId: string } }, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: { user } });
};
