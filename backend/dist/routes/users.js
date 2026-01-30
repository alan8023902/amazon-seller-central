"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    role: zod_1.z.enum(['admin', 'user', 'manager']).default('user'),
    store_id: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().default(true),
    last_login: zod_1.z.string().optional(),
    password: zod_1.z.string(),
    otp_secret: zod_1.z.string().optional(),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string(),
});
const CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    role: zod_1.z.enum(['admin', 'user', 'manager']).default('user'),
    store_id: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().default(true),
});
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, search, role, store_id } = req.query;
    let users = await dataService_1.dataService.readData('users');
    if (search) {
        const searchTerm = search.toLowerCase();
        users = users.filter(user => user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm));
    }
    if (role && role !== 'all') {
        users = users.filter(user => user.role === role);
    }
    if (store_id) {
        users = users.filter(user => user.store_id === store_id);
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = users.slice(startIndex, endIndex);
    const response = {
        success: true,
        data: paginatedUsers,
    };
    res.json(response);
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const users = await dataService_1.dataService.readData('users');
    const user = users.find(u => u.id === id);
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const response = {
        success: true,
        data: user,
    };
    res.json(response);
}));
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userData = CreateUserSchema.parse(req.body);
    const users = await dataService_1.dataService.readData('users');
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        throw (0, errorHandler_1.createError)('User with this email already exists', 400);
    }
    const generateOTPSecret = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };
    const generatePassword = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letter = letters[Math.floor(Math.random() * letters.length)];
        const numbers = Math.floor(100000 + Math.random() * 900000).toString();
        return letter + numbers;
    };
    const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ...userData,
        password: generatePassword(),
        otp_secret: generateOTPSecret(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    const createdUser = await dataService_1.dataService.create('users', newUser);
    const response = {
        success: true,
        data: createdUser,
        message: 'User created successfully',
    };
    res.json(response);
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = CreateUserSchema.partial().parse(req.body);
    const users = await dataService_1.dataService.readData('users');
    const existingUser = users.find(u => u.id === id);
    if (!existingUser) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = users.find(u => u.email === updateData.email && u.id !== id);
        if (emailExists) {
            throw (0, errorHandler_1.createError)('User with this email already exists', 400);
        }
    }
    const updatedUser = await dataService_1.dataService.update('users', id, {
        ...updateData,
        updated_at: new Date().toISOString(),
    });
    if (!updatedUser) {
        throw (0, errorHandler_1.createError)('Failed to update user', 500);
    }
    const response = {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
    };
    res.json(response);
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const success = await dataService_1.dataService.delete('users', id);
    if (!success) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const response = {
        success: true,
        message: 'User deleted successfully',
    };
    res.json(response);
}));
router.post('/:id/refresh-otp', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const generateOTPSecret = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };
    const updatedUser = await dataService_1.dataService.update('users', id, {
        otp_secret: generateOTPSecret(),
        updated_at: new Date().toISOString(),
    });
    if (!updatedUser) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const response = {
        success: true,
        data: updatedUser,
        message: 'OTP secret refreshed successfully',
    };
    res.json(response);
}));
router.post('/:id/refresh-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const generatePassword = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letter = letters[Math.floor(Math.random() * letters.length)];
        const numbers = Math.floor(100000 + Math.random() * 900000).toString();
        return letter + numbers;
    };
    const updatedUser = await dataService_1.dataService.update('users', id, {
        password: generatePassword(),
        updated_at: new Date().toISOString(),
    });
    if (!updatedUser) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const response = {
        success: true,
        data: updatedUser,
        message: 'Password refreshed successfully',
    };
    res.json(response);
}));
module.exports = router;
