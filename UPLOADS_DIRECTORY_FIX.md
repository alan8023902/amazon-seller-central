# Uploads Directory Fix

## 问题描述

用户发现我创建的 `backend/uploads` 目录在打包时可能不会被包含进去，因为：
1. 空目录通常不会被版本控制系统跟踪
2. 打包脚本中有删除uploads目录的逻辑
3. 客户包部署后可能缺少uploads目录，导致图片上传失败

## 解决方案

### 1. 修改打包脚本逻辑

**文件**: `dev-tools/create-customer-package-correct.bat`

**修改前**:
```bat
REM 删除上传文件和缓存目录
if exist "%TEMP_DIR%\app\backend\uploads" rmdir /s /q "%TEMP_DIR%\app\backend\uploads" >nul 2>&1
```

**修改后**:
```bat
REM 删除上传文件和缓存目录内容，但保留目录结构
if exist "%TEMP_DIR%\app\backend\uploads" (
    REM 删除uploads目录中的所有文件，但保留目录
    del /q "%TEMP_DIR%\app\backend\uploads\*.*" >nul 2>&1
    REM 删除子目录
    for /d %%i in ("%TEMP_DIR%\app\backend\uploads\*") do rmdir /s /q "%%i" >nul 2>&1
) else (
    REM 如果uploads目录不存在，创建它
    mkdir "%TEMP_DIR%\app\backend\uploads" >nul 2>&1
)

REM 创建.gitkeep文件确保目录被保留
echo. > "%TEMP_DIR%\app\backend\uploads\.gitkeep"
```

### 2. 添加.gitkeep文件

**文件**: `backend/uploads/.gitkeep`

创建了一个.gitkeep文件确保uploads目录在版本控制中被保留：
```
# This file ensures the uploads directory is preserved in version control
# The uploads directory is needed for image file storage
```

### 3. 后端自动创建目录

**文件**: `backend/src/server.ts`

**修改前**:
```typescript
// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

**修改后**:
```typescript
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// Static file serving for uploaded images
app.use('/uploads', express.static(uploadsDir));
```

## 修复效果

### 开发环境
- ✅ uploads目录现在有.gitkeep文件，会被版本控制跟踪
- ✅ 后端启动时会自动检查并创建uploads目录
- ✅ 图片上传功能正常工作

### 客户包
- ✅ 打包时会保留uploads目录结构
- ✅ 清理uploads目录中的文件，但保留目录本身
- ✅ 包含.gitkeep文件确保目录存在
- ✅ 客户部署后uploads目录一定存在

### 运行时
- ✅ 后端启动时会自动检查uploads目录
- ✅ 如果目录不存在会自动创建
- ✅ 双重保障确保图片上传功能正常

## 测试验证

### 1. 开发环境测试
```bash
# 删除uploads目录测试自动创建
rm -rf backend/uploads
npm run dev:backend
# 应该看到: "📁 Created uploads directory: ..."
```

### 2. 客户包测试
```bash
# 创建客户包
cd dev-tools
create-customer-package-correct.bat

# 解压客户包，检查uploads目录
# 应该存在: app/backend/uploads/.gitkeep
```

### 3. 图片上传测试
```bash
# 启动服务
npm run start:all

# 测试图片上传
# 1. 访问 http://localhost:3002
# 2. 登录管理后台
# 3. 进入产品管理
# 4. 上传图片
# 5. 验证上传成功
```

## 相关文件

- `backend/uploads/.gitkeep` - 确保目录被版本控制跟踪
- `backend/src/server.ts` - 后端自动创建目录逻辑
- `dev-tools/create-customer-package-correct.bat` - 打包脚本修复
- `backend/src/routes/product.ts` - 图片上传路由（multer配置）

## 总结

通过三重保障机制：
1. **版本控制保障**: .gitkeep文件确保目录被跟踪
2. **打包保障**: 修改打包脚本保留目录结构
3. **运行时保障**: 后端启动时自动检查并创建目录

确保无论在什么环境下，uploads目录都会存在，图片上传功能都能正常工作。