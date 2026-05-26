const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET || 'safeworker_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name) throw createError(400, 'name is required');
  if (!email) throw createError(400, 'email is required');
  if (!password) throw createError(400, 'password is required');
  if (role && !['admin', 'worker'].includes(role)) {
    throw createError(400, 'role must be admin or worker');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw createError(400, 'email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'worker'
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token: signToken(user)
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw createError(400, 'email is required');
  if (!password) throw createError(400, 'password is required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw createError(401, 'Invalid email or password');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token: signToken(user)
    }
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Authenticated user fetched successfully',
    data: req.user
  });
});

module.exports = {
  register,
  login,
  me
};
