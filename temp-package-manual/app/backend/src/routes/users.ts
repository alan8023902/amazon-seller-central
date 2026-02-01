import express from 'express';
import { dataService } from '../services/dataService';
import { z } from 'zod';
import { asyncHandler, createError } from '../middleware/errorHandler';
import type { ApiResponse } from '../types/index';

const router = express.Router();

// User Schema
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'manager']).default('user'),
  store_id: z.string().optional(),
  is_active: z.boolean().default(true),
  last_login: z.string().optional(),
  password: z.string(),
  otp_secret: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user', 'manager']).default('user'),
  store_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type User = z.infer<typeof UserSchema>;
type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// GET /api/users - Get all users
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, store_id } = req.query;
  
  let users = await dataService.readData('users') as User[];
  
  // Apply filters
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    users = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }
  
  if (role && role !== 'all') {
    users = users.filter(user => user.role === role);
  }
  
  if (store_id) {
    users = users.filter(user => user.store_id === store_id);
  }
  
  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const paginatedUsers = users.slice(startIndex, endIndex);
  
  const response: ApiResponse<User[]> = {
    success: true,
    data: paginatedUsers,
  };
  
  res.json(response);
}));

// GET /api/users/:id - Get user by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const users = await dataService.readData('users') as User[];
  const user = users.find(u => u.id === id);
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: user,
  };
  
  res.json(response);
}));

// POST /api/users - Create new user
router.post('/', asyncHandler(async (req, res) => {
  const userData = CreateUserSchema.parse(req.body);
  
  // Check if email already exists
  const users = await dataService.readData('users') as User[];
  const existingUser = users.find(u => u.email === userData.email);
  
  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }
  
  // Generate 6-digit OTP secret for SMS verification
  const generateOTPSecret = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Generate simple password: 1 letter + 6 digits
  const generatePassword = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const numbers = Math.floor(100000 + Math.random() * 900000).toString();
    return letter + numbers;
  };
  
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    ...userData,
    password: generatePassword(),
    otp_secret: generateOTPSecret(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  const createdUser = await dataService.create<User>('users', newUser);
  
  const response: ApiResponse<User> = {
    success: true,
    data: createdUser,
    message: 'User created successfully',
  };
  
  res.json(response);
}));

// PUT /api/users/:id - Update user
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = CreateUserSchema.partial().parse(req.body);
  
  const users = await dataService.readData('users') as User[];
  const existingUser = users.find(u => u.id === id);
  
  if (!existingUser) {
    throw createError('User not found', 404);
  }
  
  // Check email uniqueness if email is being updated
  if (updateData.email && updateData.email !== existingUser.email) {
    const emailExists = users.find(u => u.email === updateData.email && u.id !== id);
    if (emailExists) {
      throw createError('User with this email already exists', 400);
    }
  }
  
  const updatedUser = await dataService.update<User>('users', id, {
    ...updateData,
    updated_at: new Date().toISOString(),
  });
  
  if (!updatedUser) {
    throw createError('Failed to update user', 500);
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: 'User updated successfully',
  };
  
  res.json(response);
}));

// DELETE /api/users/:id - Delete user
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const success = await dataService.delete('users', id);
  
  if (!success) {
    throw createError('User not found', 404);
  }
  
  const response: ApiResponse = {
    success: true,
    message: 'User deleted successfully',
  };
  
  res.json(response);
}));

// POST /api/users/:id/refresh-otp - Refresh user's OTP secret
router.post('/:id/refresh-otp', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const generateOTPSecret = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  const updatedUser = await dataService.update<User>('users', id, {
    otp_secret: generateOTPSecret(),
    updated_at: new Date().toISOString(),
  });
  
  if (!updatedUser) {
    throw createError('User not found', 404);
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: 'OTP secret refreshed successfully',
  };
  
  res.json(response);
}));

// POST /api/users/:id/refresh-password - Refresh user's password
router.post('/:id/refresh-password', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const generatePassword = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const numbers = Math.floor(100000 + Math.random() * 900000).toString();
    return letter + numbers;
  };
  
  const updatedUser = await dataService.update<User>('users', id, {
    password: generatePassword(),
    updated_at: new Date().toISOString(),
  });
  
  if (!updatedUser) {
    throw createError('User not found', 404);
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: 'Password refreshed successfully',
  };
  
  res.json(response);
}));

export = router;