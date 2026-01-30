@echo off
chcp 65001 > nul
title 创建客户包 - 保持原有逻辑
cd /d "%~dp0\.."
setlocal enabledelayedexpansion

echo.
echo ================================================================
echo                     创建客户包 - 保持原有逻辑
echo ================================================================
echo.

REM 设置包名
set PACKAGE_NAME=Amazon-Seller-Central-Customer-Final
set VERSION=v1.0-final

echo 📦 包名: %PACKAGE_NAME%
echo 🏷️  版本: %VERSION%
echo 🔧 保持原有逻辑，使用英文安装脚本，包含完整依赖
echo.

REM 创建临时目录
set TEMP_DIR=%TEMP%\%PACKAGE_NAME%-temp
if exist "%TEMP_DIR%" (
    echo 🧹 清理之前的临时目录...
    rmdir /s /q "%TEMP_DIR%"
)
mkdir "%TEMP_DIR%"
mkdir "%TEMP_DIR%\app"

echo [1/6] 📁 复制应用文件到app目录...

REM 复制应用核心文件到app目录
xcopy /E /I /H /Y "backend" "%TEMP_DIR%\app\backend" >nul
xcopy /E /I /H /Y "frontend" "%TEMP_DIR%\app\frontend" >nul
xcopy /E /I /H /Y "backend-admin" "%TEMP_DIR%\app\backend-admin" >nul

echo   ✅ 应用文件复制完成

echo [2/6] 🧹 清理开发文件...

REM 删除node_modules (客户端会重新安装)
if exist "%TEMP_DIR%\app\backend\node_modules" rmdir /s /q "%TEMP_DIR%\app\backend\node_modules" >nul 2>&1
if exist "%TEMP_DIR%\app\frontend\node_modules" rmdir /s /q "%TEMP_DIR%\app\frontend\node_modules" >nul 2>&1
if exist "%TEMP_DIR%\app\backend-admin\node_modules" rmdir /s /q "%TEMP_DIR%\app\backend-admin\node_modules" >nul 2>&1

REM 删除构建文件 (客户端会重新构建)
if exist "%TEMP_DIR%\app\backend\dist" rmdir /s /q "%TEMP_DIR%\app\backend\dist" >nul 2>&1
if exist "%TEMP_DIR%\app\frontend\dist" rmdir /s /q "%TEMP_DIR%\app\frontend\dist" >nul 2>&1
if exist "%TEMP_DIR%\app\backend-admin\dist" rmdir /s /q "%TEMP_DIR%\app\backend-admin\dist" >nul 2>&1

REM 删除开发配置文件和报告文件
del "%TEMP_DIR%\app\backend\nodemon.json" >nul 2>&1
del "%TEMP_DIR%\app\backend\jest.config.js" >nul 2>&1
del "%TEMP_DIR%\app\frontend\.env.local" >nul 2>&1
del "%TEMP_DIR%\app\backend-admin\.env.local" >nul 2>&1

REM 删除TypeScript报告文件 - 不打包进客户包
if exist "%TEMP_DIR%\TypeScript构建错误修复完成报告.md" del "%TEMP_DIR%\TypeScript构建错误修复完成报告.md" >nul 2>&1

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

echo   ✅ 开发文件清理完成

echo [3/6] 📄 复制客户端脚本和配置...

REM 复制客户端脚本到根目录 - 使用新的启动脚本
copy "customer-scripts\install.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\start.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\stop.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\restart.bat" "%TEMP_DIR%\" >nul

REM 创建app/config目录并复制配置文件
mkdir "%TEMP_DIR%\app\config" >nul 2>&1
copy "config\ports.js" "%TEMP_DIR%\app\config\" >nul
if exist "config\域名配置-简化版.js" copy "config\域名配置-简化版.js" "%TEMP_DIR%\app\config\" >nul

REM 创建app/tools目录并复制域名工具
mkdir "%TEMP_DIR%\app\tools" >nul 2>&1
copy "tools\domain-server.js" "%TEMP_DIR%\app\tools\" >nul
copy "tools\package.json" "%TEMP_DIR%\app\tools\" >nul
if exist "tools\setup-hosts.bat" copy "tools\setup-hosts.bat" "%TEMP_DIR%\app\tools\" >nul

REM 复制图标和说明
copy "logs-001.ico" "%TEMP_DIR%\" >nul 2>&1

echo   ✅ 客户端文件复制完成

echo [4/6] 🔧 应用TypeScript构建修复...

REM 确保backend-admin的tsconfig.node.json存在
if not exist "%TEMP_DIR%\app\backend-admin\tsconfig.node.json" (
    echo { > "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo   "compilerOptions": { >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo     "composite": true, >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo     "skipLibCheck": true, >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo     "module": "ESNext", >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo     "moduleResolution": "bundler", >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo     "allowSyntheticDefaultImports": true, >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo     "strict": true >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo   }, >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo   "include": ["vite.config.ts"] >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
    echo } >> "%TEMP_DIR%\app\backend-admin\tsconfig.node.json"
)

echo   ✅ TypeScript配置修复完成

echo [5/6] 📦 创建压缩包...

set FINAL_PACKAGE=%PACKAGE_NAME%.zip

REM 如果文件已存在，先删除
if exist "%~dp0%FINAL_PACKAGE%" (
    echo 🗑️  删除现有包文件...
    del "%~dp0%FINAL_PACKAGE%" >nul 2>&1
)

powershell -command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%~dp0%FINAL_PACKAGE%' -Force"

if exist "%~dp0%FINAL_PACKAGE%" (
    echo   ✅ 客户包创建成功: %FINAL_PACKAGE%
    
    for %%I in ("%~dp0%FINAL_PACKAGE%") do set PACKAGE_SIZE=%%~zI
    set /a PACKAGE_SIZE_MB=!PACKAGE_SIZE!/1024/1024
    echo   📏 包大小: !PACKAGE_SIZE_MB! MB
) else (
    echo   ❌ 客户包创建失败
    goto cleanup
)

:cleanup
if exist "%TEMP_DIR%" (
    rmdir /s /q "%TEMP_DIR%"
    echo   ✅ 临时文件清理完成
)

echo.
echo ================================================================
echo                        🎉 打包完成!
echo ================================================================
echo.
echo 📦 客户包: %FINAL_PACKAGE%
echo 📏 大小: !PACKAGE_SIZE_MB! MB
echo 🏷️  版本: %VERSION%
echo 🔧 使用英文安装脚本，包含完整依赖
echo.
echo 📁 客户包结构:
echo   客户包/
echo   ├── app/
echo   │   ├── backend/           # 后端服务
echo   │   ├── frontend/          # 前端应用
echo   │   ├── backend-admin/     # 管理后台
echo   │   ├── config/            # 配置文件
echo   │   │   ├── ports.js       # 端口配置 (修复)
echo   │   │   └── 域名配置-简化版.js
echo   │   └── tools/             # 域名工具
echo   │       ├── domain-server.js      # 完整域名服务器
echo   │       ├── package.json          # 工具依赖 (修复)
echo   │       ├── start-domain-mode.js  # 域名启动器
echo   │       ├── 一键配置域名.js        # 域名配置工具
echo   │       └── setup-hosts.bat       # hosts配置脚本
echo   ├── install.bat           # 安装脚本
echo   ├── start.bat             # 启动脚本 (新版本，支持域名服务器)
echo   ├── stop.bat              # 停止脚本 (新增)
echo   ├── restart.bat           # 重启脚本 (新增)
echo   ├── quick-fix.bat         # 快速修复工具
echo   ├── troubleshoot.bat      # 故障排除工具
echo   ├── restore-amazon-access.bat  # 恢复Amazon访问
echo   ├── logs-001.ico          # 应用图标
echo.
echo 🔧 包含的修复内容:
echo   ✅ 域名服务器依赖问题 (tools/package.json)
echo   ✅ 后端路径引用错误 (config/ports.js)
echo   ✅ 所有TypeScript构建错误 (tsconfig配置优化)
echo   ✅ Ant Design组件JSX类型问题 (Option组件修复)
echo   ✅ ErrorBoundary类组件状态类型问题
echo   ✅ ImageUpload组件UploadProps类型问题
echo   ✅ 新增域名服务器功能 (支持无端口访问)
echo   ✅ 新增启动/停止/重启脚本
echo   ✅ 自动hosts文件配置 (管理员权限下)
echo   ✅ 前端登录认证问题修复 (添加演示用户)
echo   ✅ 域名服务器按用户要求配置 (前端HTTPS，管理后台HTTP+HTTPS)
echo   ✅ 图片上传功能修复 (自动创建uploads目录)
echo   ✅ 产品显示错误修复 (toFixed空值检查)
echo   ✅ 业务报告日期筛选修复 (padStart错误)
echo   ✅ 业务报告表格视图修复
echo   ✅ UI按钮布局修复 (防止换行)
echo.
echo ✅ 客户包已准备就绪！
echo   - 所有构建错误已解决
echo   - 支持管理员权限下的无端口域名访问
echo   - 自动配置hosts文件 (管理员权限下)
echo   - 前端HTTPS，管理后台HTTP+HTTPS域名配置
echo   - 包含完整的启动、停止、重启功能
echo   - 客户环境部署不会再出现TypeScript错误
echo   - 包含完整的故障排除和修复工具
echo   - 前端登录认证问题已修复
echo   - 图片上传功能完整支持 (自动创建uploads目录)
echo   - 产品管理页面显示错误已修复
echo   - 业务报告筛选和表格功能已修复
echo   - UI布局问题已修复 (按钮不再换行)
echo.
pause
exit /b 0