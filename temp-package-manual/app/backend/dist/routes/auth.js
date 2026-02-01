"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const LoginSchema = zod_1.z.object({
    username: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const OTPSchema = zod_1.z.object({
    username: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6),
});
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { username, password } = LoginSchema.parse(req.body);
    const users = await dataService_1.dataService.readData('users');
    const user = users.find(u => u.email === username && u.is_active);
    if (!user) {
        throw (0, errorHandler_1.createError)('用户不存在或已被禁用', 401);
    }
    if (user.password !== password) {
        throw (0, errorHandler_1.createError)('密码错误', 401);
    }
    const response = {
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
router.post('/verify-otp', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { username, otp } = OTPSchema.parse(req.body);
    const users = await dataService_1.dataService.readData('users');
    const user = users.find(u => u.email === username && u.is_active);
    if (!user) {
        throw (0, errorHandler_1.createError)('用户不存在或已被禁用', 401);
    }
    if (user.otp_secret !== otp) {
        throw (0, errorHandler_1.createError)('验证码错误', 401);
    }
    await dataService_1.dataService.update('users', user.id, {
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
    const response = {
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
            token: `token_${user.id}_${Date.now()}`
        },
        message: '登录成功',
    };
    res.json(response);
}));
router.get('/me', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw (0, errorHandler_1.createError)('未授权访问', 401);
    }
    const token = authHeader.substring(7);
    const tokenParts = token.split('_');
    if (tokenParts.length !== 3 || tokenParts[0] !== 'token') {
        throw (0, errorHandler_1.createError)('无效的token', 401);
    }
    const userId = tokenParts[1];
    const users = await dataService_1.dataService.readData('users');
    const user = users.find(u => u.id === userId && u.is_active);
    if (!user) {
        throw (0, errorHandler_1.createError)('用户不存在', 401);
    }
    const response = {
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
module.exports = router;
