@echo off
chcp 65001 > nul
title 配置Hosts文件
setlocal enabledelayedexpansion

echo.
echo ================================================================
echo                        配置Hosts文件
echo ================================================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 需要管理员权限才能修改hosts文件
    echo 💡 请右键以管理员身份运行此脚本
    pause
    exit /b 1
) else (
    echo ✅ 管理员权限检测通过
)

echo.
echo 🔍 检查当前hosts文件配置...

set HOSTS_FILE=%WINDIR%\System32\drivers\etc\hosts
set BACKUP_FILE=%WINDIR%\System32\drivers\etc\hosts.backup

REM 备份hosts文件
if not exist "%BACKUP_FILE%" (
    echo 📋 创建hosts文件备份...
    copy "%HOSTS_FILE%" "%BACKUP_FILE%" >nul
    echo ✅ 备份完成: %BACKUP_FILE%
)

REM 检查是否已经配置
findstr /C:"sellercentral.amazon.com" "%HOSTS_FILE%" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 域名映射已存在
    echo.
    echo 当前配置:
    findstr "sellercentral.amazon.com" "%HOSTS_FILE%"
    findstr "admin.sellercentral.amazon.com" "%HOSTS_FILE%"
    findstr "api.sellercentral.amazon.com" "%HOSTS_FILE%"
    echo.
    choice /c YN /m "是否重新配置域名映射? (Y/N)"
    if errorlevel 2 goto END
    if errorlevel 1 goto CONFIGURE
) else (
    echo ❌ 域名映射不存在，需要配置
    goto CONFIGURE
)

:CONFIGURE
echo.
echo 🔧 配置域名映射...

REM 删除旧的配置
echo 删除旧的域名配置...
findstr /V "sellercentral.amazon.com" "%HOSTS_FILE%" > "%HOSTS_FILE%.tmp"
move "%HOSTS_FILE%.tmp" "%HOSTS_FILE%" >nul

REM 添加新的配置
echo.
echo # Amazon Seller Central Clone - Domain Mapping >> "%HOSTS_FILE%"
echo 127.0.0.1 sellercentral.amazon.com >> "%HOSTS_FILE%"
echo 127.0.0.1 admin.sellercentral.amazon.com >> "%HOSTS_FILE%"
echo 127.0.0.1 api.sellercentral.amazon.com >> "%HOSTS_FILE%"
echo # End Amazon Seller Central Clone >> "%HOSTS_FILE%"

echo ✅ 域名映射配置完成

echo.
echo 🔍 验证配置...
findstr "sellercentral.amazon.com" "%HOSTS_FILE%"

echo.
echo ================================================================
echo                        🎉 配置完成!
echo ================================================================
echo.
echo ✅ 域名映射已配置:
echo    sellercentral.amazon.com → 127.0.0.1
echo    admin.sellercentral.amazon.com → 127.0.0.1
echo    api.sellercentral.amazon.com → 127.0.0.1
echo.
echo 💡 现在可以使用以下命令启动完整域名服务:
echo    node domain-server.js
echo.
echo 🌐 启动后可以通过以下地址访问:
echo    前端: http://localhost:3000
echo    前端: http://sellercentral.amazon.com
echo    前端: https://sellercentral.amazon.com
echo    后端: http://localhost:3001/api
echo    后端: http://api.sellercentral.amazon.com:3001/api
echo    管理: http://localhost:3002
echo    管理: http://admin.sellercentral.amazon.com
echo.
echo 🔧 如需删除域名配置，请运行:
echo    setup-hosts.bat cleanup
echo.

:END
echo 按任意键退出...
pause >nul
exit /b 0

:CLEANUP
echo.
echo 🧹 清理域名配置...
if exist "%BACKUP_FILE%" (
    copy "%BACKUP_FILE%" "%HOSTS_FILE%" >nul
    echo ✅ 已恢复原始hosts文件
) else (
    findstr /V "sellercentral.amazon.com" "%HOSTS_FILE%" > "%HOSTS_FILE%.tmp"
    move "%HOSTS_FILE%.tmp" "%HOSTS_FILE%" >nul
    echo ✅ 已删除域名配置
)
echo.
echo 🎉 清理完成!
pause >nul
exit /b 0