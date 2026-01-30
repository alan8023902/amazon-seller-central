import express from 'express';
import { dataService } from '../services/dataService';
import { z } from 'zod';
import { asyncHandler, createError } from '../middleware/errorHandler';
import type { ApiResponse } from '../types/index';

const router = express.Router();

// Login Schema
const LoginSchema = z.object({
  username: z.string().email(), // 使用邮箱作为用户名
  password: z.string().min(1),
});

// OTP Verification Schema
const OTPSchema = z.object({
  username: z.string().email(),
  otp: z.string().length(6), // 6位数字验证码
});

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  store_id?: string;
  is_active: boolean;
  last_login?: string;
  password: string;
  otp_secret: string;
  created_at: string;
  updated_at: string;
}

// POST /api/auth/login - 用户登录验证
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = LoginSchema.parse(req.body);
  
  // 查找用户
  const users = await dataService.readData('users') as User[];
  const user = users.find(u => u.email === username && u.is_active);
  
  if (!user) {
    throw createError('用户不存在或已被禁用', 401);
  }
  
  // 验证密码
  if (user.password !== password) {
    throw createError('密码错误', 401);
  }
  
  const response: ApiResponse<{ user: Omit<User, 'password'> }> = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        store_id: user.store_id,
        is_active: user.is_active,
        last_login: user.last_login,
        otp_secret: user.otp_secret,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    },
    message: '密码验证成功，请输入验证码',
  };
  
  res.json(response);
}));

// POST /api/auth/verify-otp - OTP验证
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { username, otp } = OTPSchema.parse(req.body);
  
  // 查找用户
  const users = await dataService.readData('users') as User[];
  const user = users.find(u => u.email === username && u.is_active);
  
  if (!user) {
    throw createError('用户不存在或已被禁用', 401);
  }
  
  // 验证OTP
  if (user.otp_secret !== otp) {
    throw createError('验证码错误', 401);
  }
  
  // 更新最后登录时间
  await dataService.update<User>('users', user.id, {
    last_login: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  const response: ApiResponse<{ 
    user: Omit<User, 'password' | 'otp_secret'>;
    token: string;
  }> = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        store_id: user.store_id,
        is_active: user.is_active,
        last_login: new Date().toISOString(),
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token: `token_${user.id}_${Date.now()}` // 简单的token生成
    },
    message: '登录成功',
  };
  
  res.json(response);
}));

// GET /api/auth/me - 获取当前用户信息
router.get('/me', asyncHandler(async (req, res) => {
  // 这里应该从token中解析用户信息，简化处理
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('未授权访问', 401);
  }
  
  const token = authHeader.substring(7);
  
  // 简单的token解析（实际项目中应该使用JWT）
  const tokenParts = token.split('_');
  if (tokenParts.length !== 3 || tokenParts[0] !== 'token') {
    throw createError('无效的token', 401);
  }
  
  const userId = tokenParts[1];
  
  const users = await dataService.readData('users') as User[];
  const user = users.find(u => u.id === userId && u.is_active);
  
  if (!user) {
    throw createError('用户不存在', 401);
  }
  
  const response: ApiResponse<{ user: Omit<User, 'password' | 'otp_secret'> }> = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        store_id: user.store_id,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    },
  };
  
  res.json(response);
}));

export = router;