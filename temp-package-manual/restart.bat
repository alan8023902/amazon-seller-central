@echo off
chcp 65001 > nul 2>&1
title Amazon Seller Central - Restart
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo.
echo ████████████████████████████████████████████████████████████████
echo ██                                                            ██
echo ██          Amazon Seller Central - Restart                  ██
echo ██                                                            ██
echo ████████████████████████████████████████████████████████████████
echo.

echo [INFO] Restarting Amazon Seller Central services...
echo.

REM Step 1: Stop all services
echo +----------------------------------------------------------------+
echo ^|                        Step 1: Stop Services                  ^|
echo +----------------------------------------------------------------+
echo.

echo [STOP] Stopping all running services...

REM Stop serve processes (safe to kill all)
echo [1/2] Stopping serve processes...
taskkill /f /im serve.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Serve processes stopped
) else (
    echo [INFO] No serve processes found
)

REM Clean all ports
echo [2/2] Cleaning all ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":80 " ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        taskkill /f /pid %%a >nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        taskkill /f /pid %%a >nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        taskkill /f /pid %%a >nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3002" ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        taskkill /f /pid %%a >nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":443" ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        taskkill /f /pid %%a >nul 2>&1
    )
)

echo [OK] All services stopped

REM Wait a moment for processes to fully terminate
echo [WAIT] Waiting for processes to terminate...
ping -n 3 127.0.0.1 >nul

echo.

REM Step 2: Start services
echo +----------------------------------------------------------------+
echo ^|                        Step 2: Start Services                 ^|
echo +----------------------------------------------------------------+
echo.

echo [START] Starting Amazon Seller Central...
echo [INFO] Calling start.bat script...
echo.

REM Call the start script
call "%~dp0start.bat"

REM Check if start script completed successfully
if !errorlevel! equ 0 (
    echo.
    echo ████████████████████████████████████████████████████████████████
    echo ██                                                            ██
    echo ██                    🔄 Restart Complete!                    ██
    echo ██                                                            ██
    echo ████████████████████████████████████████████████████████████████
    echo.
    echo [OK] Amazon Seller Central has been restarted successfully
    echo [INFO] All services are now running
) else (
    echo.
    echo ████████████████████████████████████████████████████████████████
    echo ██                                                            ██
    echo ██                    ❌ Restart Failed!                      ██
    echo ██                                                            ██
    echo ████████████████████████████████████████████████████████████████
    echo.
    echo [ERROR] Failed to restart Amazon Seller Central
    echo [TIP] Try running start.bat manually to see detailed error messages
    echo.
    echo Press any key to exit...
    set /p dummy=
    exit /b 1
)

exit /b 0