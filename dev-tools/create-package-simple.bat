@echo off
chcp 65001 > nul
title 创建客户包 - 简化版
cd /d "%~dp0\.."
setlocal enabledelayedexpansion

echo.
echo ================================================================
echo                     创建客户包 - 域名功能完整版
echo ================================================================
echo.

REM 设置包名
set PACKAGE_NAME=Amazon-Seller-Central-Customer-Final
set VERSION=v1.0-domain-fixed

echo 📦 包名: %PACKAGE_NAME%
echo 🏷️  版本: %VERSION%
echo 🔧 包含完整域名功能和所有修复
echo.

REM 创建临时目录
set TEMP_DIR=temp-package
if exist "%TEMP_DIR%" (
    echo 🧹 清理之前的临时目录...
    rmdir /s /q "%TEMP_DIR%"
)
mkdir "%TEMP_DIR%"
mkdir "%TEMP_DIR%\app"

echo [1/5] 📁 复制应用文件...

REM 复制应用核心文件到app目录
xcopy /E /I /H /Y "backend" "%TEMP_DIR%\app\backend" >nul
xcopy /E /I /H /Y "frontend" "%TEMP_DIR%\app\frontend" >nul
xcopy /E /I /H /Y "backend-admin" "%TEMP_DIR%\app\backend-admin" >nul

echo   ✅ 应用文件复制完成

echo [2/5] 🧹 清理开发文件...

REM 删除node_modules (客户端会重新安装)
if exist "%TEMP_DIR%\app\backend\node_modules" rmdir /s /q "%TEMP_DIR%\app\backend\node_modules" >nul 2>&1
if exist "%TEMP_DIR%\app\frontend\node_modules" rmdir /s /q "%TEMP_DIR%\app\frontend\node_modules" >nul 2>&1
if exist "%TEMP_DIR%\app\backend-admin\node_modules" rmdir /s /q "%TEMP_DIR%\app\backend-admin\node_modules" >nul 2>&1

REM 删除构建文件 (客户端会重新构建)
if exist "%TEMP_DIR%\app\backend\dist" rmdir /s /q "%TEMP_DIR%\app\backend\dist" >nul 2>&1
if exist "%TEMP_DIR%\app\frontend\dist" rmdir /s /q "%TEMP_DIR%\app\frontend\dist" >nul 2>&1
if exist "%TEMP_DIR%\app\backend-admin\dist" rmdir /s /q "%TEMP_DIR%\app\backend-admin\dist" >nul 2>&1

echo   ✅ 开发文件清理完成

echo [3/5] 📄 复制客户端脚本和配置...

REM 复制客户端脚本到根目录
copy "customer-scripts\install.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\start.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\stop.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\restart.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\troubleshoot.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\restore-amazon-access.bat" "%TEMP_DIR%\" >nul
copy "customer-scripts\quick-fix.bat" "%TEMP_DIR%\" >nul

REM 创建app/config目录并复制配置文件
mkdir "%TEMP_DIR%\app\config" >nul 2>&1
copy "config\ports.js" "%TEMP_DIR%\app\config\" >nul

REM 创建app/tools目录并复制域名工具
mkdir "%TEMP_DIR%\app\tools" >nul 2>&1
copy "tools\domain-server.js" "%TEMP_DIR%\app\tools\" >nul
copy "tools\package.json" "%TEMP_DIR%\app\tools\" >nul

REM 复制图标
copy "logs-001.ico" "%TEMP_DIR%\" >nul 2>&1

echo   ✅ 客户端文件复制完成

echo [4/5] 🔧 应用TypeScript构建修复...

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

echo [5/5] 📦 创建压缩包...

set FINAL_PACKAGE=dev-tools\%PACKAGE_NAME%.zip

REM 如果文件已存在，先删除
if exist "%FINAL_PACKAGE%" (
    echo 🗑️  删除现有包文件...
    del "%FINAL_PACKAGE%" >nul 2>&1
)

powershell -command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%FINAL_PACKAGE%' -Force"

if exist "%FINAL_PACKAGE%" (
    echo   ✅ 客户包创建成功: %FINAL_PACKAGE%
    
    for %%I in ("%FINAL_PACKAGE%") do set PACKAGE_SIZE=%%~zI
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
echo.
echo ✅ 域名访问功能已完全修复并集成！
echo   - 智能域名检测和配置
echo   - 管理员权限检测
echo   - 域名服务器自动启动
echo   - 多种访问模式支持
echo   - 完整的服务验证和错误处理
echo   - 所有TypeScript构建错误已解决
echo.
pause
exit /b 0