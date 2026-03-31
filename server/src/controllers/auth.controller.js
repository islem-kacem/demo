import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user',
        profile: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    // Store refresh token in database
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpires
      }
    });

    // Set cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.status(201).json({
      success: true,
      user,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    // Store refresh token
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpires
      }
    });

    // Set cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Delete refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: decoded.userId }
      });
    }

    res.clearCookie('accessToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Check if refresh token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};
