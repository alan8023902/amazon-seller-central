@echo off
chcp 65001 > nul
title Amazon Seller Central - 开发环境启动
cd /d "%~dp0\.."

echo.
echo ================================================================
echo                Amazon Seller Central 开发环境
echo ================================================================
echo.

REM 检查Node.js
echo 🔍 检查开发环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js
    echo 请先安装Node.js: https://nodejs.org
    pause
    exit /b 1
)

REM 检查依赖
echo 📦 检查项目依赖...
if not exist "node_modules" (
    echo 📥 安装根目录依赖...
    npm install
)

if not exist "frontend\node_modules" (
    echo 📥 安装前端依赖...
    cd frontend
    npm install
    cd ..
)

if not exist "backend\node_modules" (
    echo 📥 安装后端依赖...
    cd backend
    npm install
    cd ..
)

if not exist "backend-admin\node_modules" (
    echo 📥 安装管理后台依赖...
    cd backend-admin
    npm install
    cd ..
)

echo.
echo 🚀 选择启动模式...
echo.
echo 1. 🏠 基础开发模式 (localhost:3000, 3001, 3002)
echo 2. 🌐 域名模式 (使用完整域名服务器)
echo 3. 🔧 域名配置工具
echo.

choice /c 123 /m "请选择启动模式"
set CHOICE_RESULT=!errorlevel!

if !CHOICE_RESULT! equ 1 goto BASIC_MODE
if !CHOICE_RESULT! equ 2 goto DOMAIN_MODE
if !CHOICE_RESULT! equ 3 goto CONFIG_MODE

:BASIC_MODE
echo.
echo 🚀 启动基础开发模式...
echo.

REM 清理现有进程
echo 🧹 清理现有进程...
taskkill /f /im node.exe >nul 2>&1

REM 启动后端
echo [1/3] 🔧 启动后端服务 (端口 3001)...
start /min "" cmd /c "cd backend && npm run dev"

REM 等待后端启动
ping -n 3 127.0.0.1 >nul

REM 启动前端
echo [2/3] 🌐 启动前端服务 (端口 3000)...
start /min "" cmd /c "cd frontend && npm run dev"

REM 启动管理后台
echo [3/3] ⚙️  启动管理后台 (端口 3002)...
start /min "" cmd /c "cd backend-admin && npm run dev"

REM 等待服务启动
echo 等待所有服务启动...
ping -n 8 127.0.0.1 >nul

echo.
echo ================================================================
echo                        🎉 开发环境启动完成!
echo ================================================================
echo.
echo 📱 访问地址:
echo    前端开发服务:   http://localhost:3000
echo    管理后台:       http://localhost:3002
echo    后端API:        http://localhost:3001
echo.

echo 🌐 正在打开开发页面...
ping -n 2 127.0.0.1 >nul

start "" "http://localhost:3000"
ping -n 1 127.0.0.1 >nul
start "" "http://localhost:3002"

goto END_SUCCESS

:DOMAIN_MODE
echo.
echo 🌐 启动域名模式...
echo.

REM 检查hosts配置
findstr /C:"sellercentral.amazon.com" "%WINDIR%\System32\drivers\etc\hosts" >nul 2>&1
if !errorlevel! neq 0 (
    echo ⚠️  警告: 未检测到域名映射
    echo 💡 请先运行 tools\setup-hosts.bat 配置域名
    echo.
    choice /c YN /m "是否继续启动域名服务器? (Y/N)"
    if errorlevel 2 goto END
)

echo 🚀 启动完整域名服务器...
node tools\domain-server.js
goto END

:CONFIG_MODE
echo.
echo 🔧 启动域名配置工具...
echo.
node tools\一键配置域名.js
goto END

:END_SUCCESS

echo 🔑 登录信息:
echo    前端:    admin@example.com / password123 / 123456
echo    管理后台: admin / admin123
echo.
echo 💡 开发提示:
echo    - 代码修改会自动热重载
echo    - 后端API文档: http://localhost:3001/api-docs
echo    - 按 Ctrl+C 停止服务
echo.

:END
echo.
echo 开发环境已启动，按任意键退出启动器...
pause >nul
exit /b 0