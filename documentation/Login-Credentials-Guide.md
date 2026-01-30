# Login Credentials Guide

## System Architecture Overview

This project contains three independent application systems, each with different login credentials:

### 1. Frontend Application - Port 3000
**Purpose**: Simulates Amazon Seller Central main application for sellers to view sales data, manage products, etc.

**Login Credentials** (from `backend/data/users.json`):

| Email | Password | OTP Code | Role | Description |
|-------|----------|----------|------|-------------|
| admin@technest.com | A123456 | 123456 | Admin | System Administrator |
| admin@example.com | password123 | 123456 | Admin | Demo Administrator |
| manager@technest-us.com | B654321 | 654321 | Manager | US Store Manager |
| manager@technest-jp.com | C789123 | 789123 | Manager | Japan Store Manager |
| staff1@technest-us.com | D456789 | 456789 | User | US Customer Service |
| staff2@technest-jp.com | E987654 | 987654 | User | Japan Customer Service |

**Login Flow**:
1. Visit http://localhost:3000
2. Enter email address (e.g., admin@technest.com)
3. Click "Continue"
4. Enter password (e.g., A123456)
5. Click "Sign In"
6. Enter OTP verification code (e.g., 123456)
7. Click "Sign In" to complete

---

### 2. Admin Backend - Port 3002
**Purpose**: Administrator backend for configuring system data, managing stores, users, etc.

**Login Credentials** (fixed):

| Username | Password |
|----------|----------|
| admin | admin123 |

**Login Flow**:
1. Visit http://localhost:3002
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Login"

---

### 3. Backend API Service - Port 3001
**Purpose**: RESTful API service providing data interfaces for frontend and admin backend

**Main Endpoints**:
- Authentication: `/api/auth/login`, `/api/auth/verify-otp`
- Stores: `/api/stores`
- Products: `/api/products`
- Sales Data: `/api/sales`
- Dashboard: `/api/dashboard`
- Users: `/api/users`

---

## FAQ

### Q: Why does frontend login fail with 401 Unauthorized?
**A**: Make sure you're using frontend user credentials, not admin backend credentials.
- ❌ Wrong: Using `admin` / `admin123` (these are admin backend credentials)
- ✅ Correct: Using `admin@technest.com` / `A123456` (these are frontend user credentials)

### Q: Admin backend login fails?
**A**: Make sure you're using the correct admin backend credentials:
- Username: `admin`
- Password: `admin123`

### Q: How to add new users?
**A**:
1. Login to admin backend (http://localhost:3002)
2. Go to "User Management" page
3. Click "Add User"
4. Fill in user information and save
5. New users can login to frontend with their email and password

### Q: What is OTP verification code?
**A**: OTP (One-Time Password) is used for enhanced security. In this demo system, OTP codes are pre-set in user data. Production environments should use TOTP or other secure OTP generation methods.

### Q: How to change user password?
**A**:
1. Login to admin backend
2. Go to "User Management" page
3. Find the user to modify
4. Click edit and change password
5. Save changes

---

## Development Environment Startup

### Using startup script (recommended)
```bash
# Run in project root directory
npm run start:all
```

### Or start services separately
```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend

# Terminal 3: Start admin backend
npm run dev:admin
```

---

## Data Storage

All user data is stored in `backend/data/users.json`. Modifying this file directly updates user information.

**User Data Structure**:
```json
{
  "id": "user-admin-001",
  "email": "admin@technest.com",
  "name": "System Administrator",
  "role": "admin",
  "store_id": "store-us-main",
  "is_active": true,
  "password": "A123456",
  "otp_secret": "123456",
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-20T10:00:00.000Z"
}
```

---

## Security Notes

⚠️ **Important**: This is a demo project and should not be used in production. Production environments should:
- Use encrypted password storage (bcrypt, argon2, etc.)
- Implement proper JWT token authentication
- Use TOTP or other secure OTP schemes
- Enable HTTPS
- Implement rate limiting and brute-force protection
- Add audit logging

---

## Support

For questions, please refer to project documentation or contact the development team.
