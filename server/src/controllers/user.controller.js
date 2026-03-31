import prisma from '../utils/database.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, website, phone } = req.body;

    // Update user and profile in a transaction
    const user = await prisma.$transaction(async (prisma) => {
      // Update basic user info
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { name },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profile: true
        }
      });

      // Update or create profile
      await prisma.profile.upsert({
        where: { userId: req.user.id },
        update: {
          bio,
          location,
          website,
          phone
        },
        create: {
          userId: req.user.id,
          bio,
          location,
          website,
          phone
        }
      });

      // Re-fetch to get updated profile
      return prisma.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true }
      });
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count();

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
