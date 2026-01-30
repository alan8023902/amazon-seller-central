@echo off
chcp 65001 > nul
title 清理开发文件
cd /d "%~dp0"

echo.
echo ================================================================
echo                    清理开发文件
echo ================================================================
echo.
echo 此脚本将删除开发过程中产生的临时文件和缓存
echo 注意：这不会影响源代码，只清理构建产物和缓存
echo.

choice /c YN /m "确定要清理开发文件吗？(Y/N)"
if errorlevel 2 goto :EOF

echo.
echo 开始清理...

REM 删除node_modules
echo [1/6] 删除node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo   - 根目录node_modules已删除
)
if exist "backend\node_modules" (
    rmdir /s /q "backend\node_modules"
    echo   - backend\node_modules已删除
)
if exist "frontend\node_modules" (
    rmdir /s /q "frontend\node_modules"
    echo   - frontend\node_modules已删除
)
if exist "backend-admin\node_modules" (
    rmdir /s /q "backend-admin\node_modules"
    echo   - backend-admin\node_modules已删除
)

REM 删除构建文件
echo [2/6] 删除构建文件...
if exist "dist" (
    rmdir /s /q "dist"
    echo   - 根目录dist已删除
)
if exist "backend\dist" (
    rmdir /s /q "backend\dist"
    echo   - backend\dist已删除
)
if exist "frontend\dist" (
    rmdir /s /q "frontend\dist"
    echo   - frontend\dist已删除
)
if exist "backend-admin\dist" (
    rmdir /s /q "backend-admin\dist"
    echo   - backend-admin\dist已删除
)

REM 删除日志文件
echo [3/6] 删除日志文件...
if exist "backend\logs" (
    rmdir /s /q "backend\logs"
    echo   - backend\logs已删除
)
del "*.log" >nul 2>&1
del "backend\*.log" >nul 2>&1
del "frontend\*.log" >nul 2>&1
del "backend-admin\*.log" >nul 2>&1

REM 删除npm缓存
echo [4/6] 删除npm缓存...
if exist ".npm-cache" (
    rmdir /s /q ".npm-cache"
    echo   - .npm-cache已删除
)

REM 删除上传文件
echo [5/6] 删除上传文件...
if exist "backend\uploads" (
    rmdir /s /q "backend\uploads"
    echo   - backend\uploads已删除
)

REM 删除临时文件
echo [6/6] 删除临时文件...
del "*.tmp" >nul 2>&1
del "*.temp" >nul 2>&1
del ".DS_Store" >nul 2>&1

echo.
echo ================================================================
echo                    清理完成！
echo ================================================================
echo.
echo 已清理的内容:
echo - node_modules目录
echo - dist构建目录
echo - 日志文件
echo - npm缓存
echo - 上传文件
echo - 临时文件
echo.
echo 项目现在更干净了，可以重新安装依赖：
echo   npm install
echo.
pause
exit /b 0