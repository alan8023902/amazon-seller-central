# Quick Start Guide

## 🚀 Start All Services

```bash
npm run start:all
```

This will start:
- Frontend (http://localhost:3000)
- Backend API (http://localhost:3001)
- Admin Backend (http://localhost:3002)

---

## 🔐 Login Credentials

### Frontend (Port 3000) - Main Application
```
Email:    admin@technest.com
Password: A123456
OTP:      123456
```

**Alternative Frontend Accounts**:
- `admin@example.com` / `password123` / `123456`
- `manager@technest-us.com` / `B654321` / `654321`
- `manager@technest-jp.com` / `C789123` / `789123`

### Admin Backend (Port 3002) - Configuration Panel
```
Username: admin
Password: admin123
```

---

## 📋 What Each System Does

| System | Port | Purpose | Login Type |
|--------|------|---------|-----------|
| Frontend | 3000 | Main seller dashboard | Email + Password + OTP |
| Backend API | 3001 | REST API service | (No login needed) |
| Admin | 3002 | System configuration | Username + Password |

---

## ⚠️ Common Mistakes

### ❌ Frontend Login Fails with 401?
You're probably using admin backend credentials. Use frontend credentials instead:
- ❌ Wrong: `admin` / `admin123`
- ✅ Correct: `admin@technest.com` / `A123456`

### ❌ Admin Backend Login Fails?
Make sure you're using the correct credentials:
- Username: `admin`
- Password: `admin123`

---

## 📚 Full Documentation

For complete information, see:
- **Chinese**: `documentation/登录凭证说明.md`
- **English**: `documentation/Login-Credentials-Guide.md`

---

## 🔧 Troubleshooting

### Services won't start?
1. Make sure Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Check if ports 3000, 3001, 3002 are available

### Still having issues?
Check the detailed documentation files or review the FIXES_SUMMARY.md for recent changes.

---

## 📝 Notes

- This is a demo/educational project
- All data is stored in JSON files in `backend/data/`
- User credentials are in `backend/data/users.json`
- Admin credentials are hardcoded in the admin backend
