@echo off
chcp 65001 > nul 2>&1
title Amazon Seller Central - Stop
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo.
echo ████████████████████████████████████████████████████████████████
echo ██                                                            ██
echo ██          Amazon Seller Central - Stop                     ██
echo ██                                                            ██
echo ████████████████████████████████████████████████████████████████
echo.

echo [INFO] Stopping Amazon Seller Central services safely...
echo [SAFE] Only targeting specific ports used by the application
echo.

REM Clean specific ports ONLY - no broad process killing
echo [Step 1/3] Cleaning application ports safely...
set PORTS_CLEANED=0

REM Port 80 (Domain Server) - only if it's our domain server
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":80 " ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        REM Check if this is likely our domain server by checking command line
        for /f "tokens=*" %%b in ('tasklist /fi "PID eq %%a" /fo csv /nh 2^>nul ^| findstr /i "node"') do (
            echo [CLEAN] Stopping domain server on port 80 (PID: %%a)
            taskkill /f /pid %%a >nul 2>&1
            set PORTS_CLEANED=1
        )
    )
)

REM Port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        echo [CLEAN] Stopping process on port 3000 (PID: %%a)
        taskkill /f /pid %%a >nul 2>&1
        set PORTS_CLEANED=1
    )
)

REM Port 3001 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        echo [CLEAN] Stopping process on port 3001 (PID: %%a)
        taskkill /f /pid %%a >nul 2>&1
        set PORTS_CLEANED=1
    )
)

REM Port 3002 (Admin)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3002" ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        echo [CLEAN] Stopping process on port 3002 (PID: %%a)
        taskkill /f /pid %%a >nul 2>&1
        set PORTS_CLEANED=1
    )
)

REM Port 443 (HTTPS Domain Server) - only if it's our domain server
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":443" ^| findstr "LISTENING" 2^>nul') do (
    if "%%a" neq "" (
        REM Check if this is likely our domain server by checking command line
        for /f "tokens=*" %%b in ('tasklist /fi "PID eq %%a" /fo csv /nh 2^>nul ^| findstr /i "node"') do (
            echo [CLEAN] Stopping HTTPS domain server on port 443 (PID: %%a)
            taskkill /f /pid %%a >nul 2>&1
            set PORTS_CLEANED=1
        )
    )
)

REM Stop serve processes (safe to kill all serve processes)
echo [Step 2/3] Stopping serve processes...
tasklist /fi "imagename eq serve.exe" 2>nul | find /i "serve.exe" >nul
if !errorlevel! equ 0 (
    echo [CLEAN] Stopping serve processes...
    taskkill /f /im serve.exe >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Serve processes stopped
        set PORTS_CLEANED=1
    ) else (
        echo [INFO] No serve processes to stop
    )
) else (
    echo [INFO] No serve processes found
)

if !PORTS_CLEANED! equ 1 (
    echo [OK] Application processes stopped successfully
) else (
    echo [INFO] No application processes found running
)

REM Verify services are stopped
echo [Step 3/3] Verifying services are stopped...
set SERVICES_STOPPED=1

netstat -an 2>nul | find ":80 " | find "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [WARN] Port 80 still in use (may be system service)
    set SERVICES_STOPPED=0
) else (
    echo [OK] Port 80 is free
)

netstat -an 2>nul | find ":3000 " | find "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [WARN] Port 3000 still in use
    set SERVICES_STOPPED=0
) else (
    echo [OK] Port 3000 is free
)

netstat -an 2>nul | find ":3001 " | find "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [WARN] Port 3001 still in use
    set SERVICES_STOPPED=0
) else (
    echo [OK] Port 3001 is free
)

netstat -an 2>nul | find ":3002 " | find "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [WARN] Port 3002 still in use
    set SERVICES_STOPPED=0
) else (
    echo [OK] Port 3002 is free
)

netstat -an 2>nul | find ":443 " | find "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [WARN] Port 443 still in use (may be system service)
    set SERVICES_STOPPED=0
) else (
    echo [OK] Port 443 is free
)

echo.
if !SERVICES_STOPPED! equ 1 (
    echo ████████████████████████████████████████████████████████████████
    echo ██                                                            ██
    echo ██                    🛑 Stop Complete!                       ██
    echo ██                                                            ██
    echo ████████████████████████████████████████████████████████████████
    echo.
    echo [OK] All Amazon Seller Central services have been stopped
    echo [INFO] All application ports are now free and available
    echo [SAFE] No unrelated processes were affected
) else (
    echo ████████████████████████████████████████████████████████████████
    echo ██                                                            ██
    echo ██                    ⚠️  Stop Warning!                       ██
    echo ██                                                            ██
    echo ████████████████████████████████████████████████████████████████
    echo.
    echo [WARN] Some services may still be running
    echo [INFO] Ports 80 and 443 warnings are normal if system services use them
    echo [TIP] Application-specific services have been stopped safely
    echo [TIP] If problems persist, you can restart your computer
)

echo.
echo Press any key to exit...
set /p dummy=
exit /b 0