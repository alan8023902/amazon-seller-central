@echo off
chcp 65001 > nul 2>&1
title Amazon Seller Central - Start
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo.
echo ████████████████████████████████████████████████████████████████
echo ██                                                            ██
echo ██          Amazon Seller Central - Start                       ██
echo ██                                                            ██
echo ████████████████████████████████████████████████████████████████
echo.

REM Check Node.js Environment
echo [Step 1/6] Checking Node.js Environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Press any key to exit...
    set /p dummy=
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do echo [OK] Node.js Version: %%i
)

echo.

REM Check Administrator Privileges
echo [Step 2/6] Checking Administrator Privileges...
net session >nul 2>&1
if !errorlevel! neq 0 (
    echo [WARN] Not running as Administrator
    echo [INFO] Domain server functionality will be limited to port-based access
    echo [INFO] For full domain mode without ports, run as Administrator
    set HAS_ADMIN=0
) else (
    echo [OK] Administrator privileges detected
    set HAS_ADMIN=1
)

echo.

REM Check Services Status - DETAILED PORT CHECKING
echo [Step 3/6] Smart Service Detection...
echo [INFO] Checking if services are already running...

REM Initialize service status variables
set FRONTEND_RUNNING=0
set BACKEND_RUNNING=0
set ADMIN_RUNNING=0

REM Check port 3000 (Frontend)
echo [CHECK] Checking port 3000 (Frontend)...
powershell -Command "if(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Port 3000: Frontend service is running
    set FRONTEND_RUNNING=1
) else (
    echo [INFO] Port 3000: Frontend service not running
)

REM Check port 3001 (Backend)
echo [CHECK] Checking port 3001 (Backend)...
powershell -Command "if(Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Port 3001: Backend service is running
    set BACKEND_RUNNING=1
) else (
    echo [INFO] Port 3001: Backend service not running
)

REM Check port 3002 (Admin)
echo [CHECK] Checking port 3002 (Admin)...
powershell -Command "if(Get-NetTCPConnection -LocalPort 3002 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Port 3002: Admin service is running
    set ADMIN_RUNNING=1
) else (
    echo [INFO] Port 3002: Admin service not running
)

REM Summary of service status
echo.
echo [SUMMARY] Service Status:
if !FRONTEND_RUNNING! equ 1 (
    echo   ✅ Frontend ^(3000^): Running
) else (
    echo   ❌ Frontend ^(3000^): Not Running
)
if !BACKEND_RUNNING! equ 1 (
    echo   ✅ Backend ^(3001^): Running
) else (
    echo   ❌ Backend ^(3001^): Not Running
)
if !ADMIN_RUNNING! equ 1 (
    echo   ✅ Admin ^(3002^): Running
) else (
    echo   ❌ Admin ^(3002^): Not Running
)

echo.

REM Check Domain Configuration
echo [Step 4/6] Checking Domain Configuration...
echo [DEBUG] Checking hosts file for domain configuration...

REM Check hosts file for domain mapping
findstr /C:"sellercentral.amazon.com" "%WINDIR%\System32\drivers\etc\hosts" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Domain mapping found in hosts file
    set DOMAIN_MODE=1
    
    REM Check if domain server file exists
    if exist "tools\domain-server.js" (
        echo [OK] Domain server file found at tools\domain-server.js
        set DOMAIN_SERVER_PATH=tools
        
        REM Check if tools dependencies exist
        if exist "tools\node_modules\express" (
            echo [OK] Express dependency found
            if "!HAS_ADMIN!"=="1" (
                echo [OK] Administrator privileges available - Full domain mode enabled
                set USE_DOMAIN_SERVER=1
            ) else (
                echo [WARN] No administrator privileges detected!
                echo [INFO] For no-port domain access, you need to:
                echo [INFO]   1. Close this window
                echo [INFO]   2. Right-click start.bat and select "Run as administrator"
                echo [INFO]   3. This will enable: https://sellercentral.amazon.com ^(no port^)
                echo [INFO] 
                echo [INFO] Current mode: Port-based domain access
                echo [INFO]   - http://sellercentral.amazon.com:3000
                echo [INFO]   - http://admin.sellercentral.amazon.com:3002
                set USE_DOMAIN_SERVER=0
            )
        ) else (
            echo [WARN] Express dependency missing, installing...
            cd tools
            call npm install express http-proxy-middleware cors node-forge --save --no-audit --no-fund
            if !errorlevel! equ 0 (
                echo [OK] Dependencies installed successfully
                cd ..
                if "!HAS_ADMIN!"=="1" (
                    echo [OK] Administrator privileges available - Full domain mode enabled
                    set USE_DOMAIN_SERVER=1
                ) else (
                    echo [INFO] No administrator privileges - Port-based domain access
                    set USE_DOMAIN_SERVER=0
                )
            ) else (
                echo [ERROR] Failed to install dependencies
                cd ..
                set USE_DOMAIN_SERVER=0
            )
        )
    ) else if exist "app\tools\domain-server.js" (
        echo [OK] Domain server file found at app\tools\domain-server.js ^(customer package^)
        set DOMAIN_SERVER_PATH=app\tools
        
        REM Check if tools dependencies exist
        if exist "app\tools\node_modules\express" (
            echo [OK] Express dependency found
            if "!HAS_ADMIN!"=="1" (
                echo [OK] Administrator privileges available - Full domain mode enabled
                set USE_DOMAIN_SERVER=1
            ) else (
                echo [WARN] No administrator privileges detected!
                echo [INFO] For no-port domain access, you need to:
                echo [INFO]   1. Close this window
                echo [INFO]   2. Right-click start.bat and select "Run as administrator"
                echo [INFO]   3. This will enable: https://sellercentral.amazon.com ^(no port^)
                echo [INFO] 
                echo [INFO] Current mode: Port-based domain access
                echo [INFO]   - http://sellercentral.amazon.com:3000
                echo [INFO]   - http://admin.sellercentral.amazon.com:3002
                set USE_DOMAIN_SERVER=0
            )
        ) else (
            echo [WARN] Express dependency missing, installing...
            cd app\tools
            call npm install express http-proxy-middleware cors node-forge --save --no-audit --no-fund
            if !errorlevel! equ 0 (
                echo [OK] Dependencies installed successfully
                cd ..\..
                if "!HAS_ADMIN!"=="1" (
                    echo [OK] Administrator privileges available - Full domain mode enabled
                    set USE_DOMAIN_SERVER=1
                ) else (
                    echo [INFO] No administrator privileges - Port-based domain access
                    set USE_DOMAIN_SERVER=0
                )
            ) else (
                echo [ERROR] Failed to install dependencies
                cd ..\..
                set USE_DOMAIN_SERVER=0
            )
        )
    ) else (
        echo [ERROR] Domain server file not found
        echo [DEBUG] Checked paths:
        echo [DEBUG]   - tools\domain-server.js ^(development^)
        echo [DEBUG]   - app\tools\domain-server.js ^(customer package^)
        set USE_DOMAIN_SERVER=0
    )
) else (
    echo [INFO] Domain mapping not found in hosts file
    if "!HAS_ADMIN!"=="1" (
        echo [ADMIN] Attempting to configure hosts file automatically...
        echo [INFO] Adding domain mappings to hosts file...
        
        REM 备份hosts文件
        copy "%WINDIR%\System32\drivers\etc\hosts" "%WINDIR%\System32\drivers\etc\hosts.backup" >nul 2>&1
        
        REM 添加域名映射
        echo. >> "%WINDIR%\System32\drivers\etc\hosts"
        echo # Amazon Seller Central Clone - Domain Mapping >> "%WINDIR%\System32\drivers\etc\hosts"
        echo 127.0.0.1 sellercentral.amazon.com >> "%WINDIR%\System32\drivers\etc\hosts"
        echo 127.0.0.1 admin.sellercentral.amazon.com >> "%WINDIR%\System32\drivers\etc\hosts"
        
        REM 验证添加是否成功
        findstr /C:"sellercentral.amazon.com" "%WINDIR%\System32\drivers\etc\hosts" >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Domain mapping added successfully to hosts file
            set DOMAIN_MODE=1
            set USE_DOMAIN_SERVER=1
        ) else (
            echo [ERROR] Failed to add domain mapping to hosts file
            set DOMAIN_MODE=0
            set USE_DOMAIN_SERVER=0
        )
    ) else (
        echo [NO-ADMIN] Cannot modify hosts file without administrator privileges
        echo [INFO] To enable domain mode:
        echo       1. Close this window
        echo       2. Right-click start.bat and select "Run as administrator"
        echo       3. Or manually add to hosts file:
        echo          127.0.0.1 sellercentral.amazon.com
        echo          127.0.0.1 admin.sellercentral.amazon.com
        set DOMAIN_MODE=0
        set USE_DOMAIN_SERVER=0
    )
)

echo.

REM Check Application Structure
echo [Step 5/6] Checking Application Structure...

REM Determine app structure (customer package vs development)
if exist "app\backend\package.json" (
    echo [OK] Backend files found ^(customer package^)
    set "APP_STRUCTURE=customer"
    set "BACKEND_PATH=app\backend"
    set "FRONTEND_PATH=app\frontend"
    set "ADMIN_PATH=app\backend-admin"
) else if exist "backend\package.json" (
    echo [OK] Backend files found ^(development environment^)
    set "APP_STRUCTURE=dev"
    set "BACKEND_PATH=backend"
    set "FRONTEND_PATH=frontend"
    set "ADMIN_PATH=backend-admin"
) else (
    echo [ERROR] Backend files not found
    echo [INFO] Current directory: %CD%
    echo [TIP] Expected either app\backend\package.json or backend\package.json
    echo.
    echo Press any key to exit...
    set /p dummy=
    exit /b 1
)

if "%APP_STRUCTURE%"=="customer" (
    if exist "!FRONTEND_PATH!" (
        echo [OK] Frontend files found
    ) else (
        echo [ERROR] Frontend files not found at !FRONTEND_PATH!
        echo Press any key to exit...
        set /p dummy=
        exit /b 1
    )
    
    if exist "!ADMIN_PATH!" (
        echo [OK] Admin files found
    ) else (
        echo [ERROR] Admin files not found at !ADMIN_PATH!
        echo Press any key to exit...
        set /p dummy=
        exit /b 1
    )
) else (
    if exist "!FRONTEND_PATH!" (
        echo [OK] Frontend files found
    ) else (
        echo [ERROR] Frontend files not found at !FRONTEND_PATH!
        echo Press any key to exit...
        set /p dummy=
        exit /b 1
    )
    
    if exist "!ADMIN_PATH!" (
        echo [OK] Admin files found
    ) else (
        echo [ERROR] Admin files not found at !ADMIN_PATH!
        echo Press any key to exit...
        set /p dummy=
        exit /b 1
    )
)

echo.

REM Start Services
echo [Step 6/6] Smart Service Startup...
echo [DEBUG] Configuration: DOMAIN_MODE=!DOMAIN_MODE!, USE_DOMAIN_SERVER=!USE_DOMAIN_SERVER!, HAS_ADMIN=!HAS_ADMIN!

REM Check if all services are already running (including domain server if needed)
set ALL_SERVICES_RUNNING=0
if "!USE_DOMAIN_SERVER!"=="1" (
    REM For domain server mode, check if domain server is running on port 80
    powershell -Command "if(Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        if !BACKEND_RUNNING! equ 1 (
            echo [INFO] Domain server and backend are already running, skipping startup...
            set ALL_SERVICES_RUNNING=1
        )
    ) else (
        echo [INFO] Domain server not running on port 80, will start domain server mode...
    )
) else (
    REM For basic mode, check all three services
    if !FRONTEND_RUNNING! equ 1 (
        if !BACKEND_RUNNING! equ 1 (
            if !ADMIN_RUNNING! equ 1 (
                echo [INFO] All basic services are already running, skipping startup...
                set ALL_SERVICES_RUNNING=1
            )
        )
    )
)

if !ALL_SERVICES_RUNNING! equ 1 (
    goto OPEN_BROWSER
)

REM Start services based on domain configuration
if "!USE_DOMAIN_SERVER!"=="1" (
    echo.
    echo +----------------------------------------------------------------+
    echo ^|                    Starting Domain Server Mode                ^|
    echo +----------------------------------------------------------------+
    echo.
    
    REM Start backend service first (only if not running)
    if !BACKEND_RUNNING! equ 0 (
        echo [Progress 1/3] Starting Backend Service ^(Port 3001^)...
        if "%APP_STRUCTURE%"=="customer" (
            start /b /min "" cmd /c "cd !BACKEND_PATH! && npm start > ..\backend.log 2>&1"
        ) else (
            start /b /min "" cmd /c "cd !BACKEND_PATH! && npm start > backend.log 2>&1"
        )
        
        echo [WAIT] Waiting for backend service to initialize...
        ping -n 8 127.0.0.1 >nul
        
        REM Verify backend started
        powershell -Command "if(Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Backend service started successfully on port 3001
        ) else (
            echo [WARN] Backend service may not have started properly
        )
    ) else (
        echo [Progress 1/3] Backend Service already running ^(Port 3001^)
    )
    
    REM Start domain server (this will handle frontend and admin on port 80)
    echo [Progress 2/3] Starting Domain Server ^(Port 80^)...
    echo [INFO] Starting domain server with administrator privileges...
    if "%APP_STRUCTURE%"=="customer" (
        start /b "" cmd /c "node !DOMAIN_SERVER_PATH!\domain-server.js > domain-server.log 2>&1"
    ) else (
        start /b "" cmd /c "node !DOMAIN_SERVER_PATH!\domain-server.js > domain-server.log 2>&1"
    )
    
    echo [WAIT] Waiting for domain server to initialize...
    ping -n 15 127.0.0.1 >nul
    
    REM Verify domain server started
    echo [Progress 3/3] Verifying Domain Server Status...
    powershell -Command "if(Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Domain server started successfully on port 80
        echo [TEST] Testing domain server response...
        
        REM Test if domain server is actually serving content
        powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost' -Method Head -TimeoutSec 5 -ErrorAction Stop; if ($response.StatusCode -eq 200) { Write-Host '[OK] Domain server responding correctly' } else { Write-Host '[WARN] Domain server responded with status:' $response.StatusCode } } catch { Write-Host '[ERROR] Domain server not responding:' $_.Exception.Message }"
        
        REM Check HTTPS server (port 443)
        powershell -Command "if(Get-NetTCPConnection -LocalPort 443 -State Listen -ErrorAction SilentlyContinue) { Write-Host '[OK] HTTPS domain server also running on port 443' } else { Write-Host '[INFO] HTTPS domain server not running (may be normal)' }" 2>nul
        
        echo [SUCCESS] Domain server mode activated!
        goto OPEN_BROWSER
    ) else (
        echo [ERROR] Domain server failed to start on port 80
        echo [DEBUG] Checking domain server log...
        if exist "domain-server.log" (
            echo [LOG] Last 5 lines of domain server log:
            powershell -Command "Get-Content domain-server.log -Tail 5 2>$null"
        ) else (
            echo [DEBUG] No domain server log found
        )
        echo [DEBUG] Checking if port 80 is occupied...
        powershell -Command "Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, State"
        echo [ERROR] Domain server startup failed - falling back to basic mode
        goto BASIC_MODE
    )
) else (
    goto BASIC_MODE
)

:BASIC_MODE
echo.
echo +----------------------------------------------------------------+
echo ^|                        Basic Mode                             ^|
echo +----------------------------------------------------------------+
echo.

REM Start backend service (only if not running)
if !BACKEND_RUNNING! equ 0 (
    echo [Progress 1/3] Starting Backend Service ^(Port 3001^)...
    if "%APP_STRUCTURE%"=="customer" (
        start /b /min "" cmd /c "cd app\backend && npm start >nul 2>&1"
    ) else (
        start /b /min "" cmd /c "cd backend && npm start >nul 2>&1"
    )
    echo [WAIT] Waiting for backend service to initialize...
    ping -n 8 127.0.0.1 >nul
) else (
    echo [Progress 1/3] Backend Service already running ^(Port 3001^)
)

REM Start frontend service (only if not running)
if !FRONTEND_RUNNING! equ 0 (
    echo [Progress 2/3] Starting Frontend Service ^(Port 3000^)...
    if "%APP_STRUCTURE%"=="customer" (
        if exist "!FRONTEND_PATH!\dist" (
            echo [DEBUG] Starting: npm run preview in !FRONTEND_PATH!
            start /b /min "" cmd /c "cd !FRONTEND_PATH! && npm run preview"
        ) else (
            echo [DEBUG] Starting: npm run dev in !FRONTEND_PATH!
            start /b /min "" cmd /c "cd !FRONTEND_PATH! && npm run dev"
        )
    ) else (
        if exist "!FRONTEND_PATH!\dist" (
            echo [DEBUG] Starting: npm run preview in !FRONTEND_PATH!
            start /b /min "" cmd /c "cd !FRONTEND_PATH! && npm run preview"
        ) else (
            echo [DEBUG] Starting: npm run dev in !FRONTEND_PATH!
            start /b /min "" cmd /c "cd !FRONTEND_PATH! && npm run dev"
        )
    )
    echo [WAIT] Waiting for frontend service to initialize...
    ping -n 8 127.0.0.1 >nul
) else (
    echo [Progress 2/3] Frontend Service already running ^(Port 3000^)
)

REM Start admin backend (only if not running)
if !ADMIN_RUNNING! equ 0 (
    echo [Progress 3/3] Starting Admin Backend ^(Port 3002^)...
    if "%APP_STRUCTURE%"=="customer" (
        if exist "!ADMIN_PATH!\dist" (
            echo [DEBUG] Starting: npm run preview in !ADMIN_PATH!
            start /b /min "" cmd /c "cd !ADMIN_PATH! && npm run preview"
        ) else (
            echo [DEBUG] Starting: npm run dev in !ADMIN_PATH!
            start /b /min "" cmd /c "cd !ADMIN_PATH! && npm run dev"
        )
    ) else (
        if exist "!ADMIN_PATH!\dist" (
            echo [DEBUG] Starting: npm run preview in !ADMIN_PATH!
            start /b /min "" cmd /c "cd !ADMIN_PATH! && npm run preview"
        ) else (
            echo [DEBUG] Starting: npm run dev in !ADMIN_PATH!
            start /b /min "" cmd /c "cd !ADMIN_PATH! && npm run dev"
        )
    )
    echo [WAIT] Waiting for admin service to initialize...
    ping -n 8 127.0.0.1 >nul
) else (
    echo [Progress 3/3] Admin Service already running ^(Port 3002^)
)

echo.
echo [WAIT] Allowing additional time for all services to fully initialize...
ping -n 10 127.0.0.1 >nul

REM Final service verification
echo [VERIFY] Final service verification...
set RETRY_COUNT=0

:VERIFY_SERVICES
set /a RETRY_COUNT+=1
echo [VERIFY] Attempt %RETRY_COUNT%/3 - Checking all services...

powershell -Command "$ports = @(3000, 3001, 3002); $running = @(); foreach($port in $ports) { $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if($conn) { $running += $port; Write-Host \"[OK] Service running on port $port\" } else { Write-Host \"[WARN] Service not ready on port $port\" } }; if($running.Count -eq 3) { Write-Host \"[SUCCESS] All services are running!\"; exit 0 } else { Write-Host \"[INFO] $($running.Count)/3 services running\"; exit 1 }"

if !errorlevel! equ 0 (
    echo [SUCCESS] All services verified and running!
    goto OPEN_BROWSER
)

if %RETRY_COUNT% LSS 3 (
    echo [WAIT] Some services still starting, waiting 5 more seconds...
    ping -n 6 127.0.0.1 >nul
    goto VERIFY_SERVICES
) else (
    echo [WARNING] Some services may not have started properly
    echo [CONTINUE] Opening browser anyway - working services will be accessible
)

:OPEN_BROWSER
echo.
echo ████████████████████████████████████████████████████████████████
echo ██                                                            ██
echo ██                      🎉 Startup Complete!                 ██
echo ██                                                            ██
echo ████████████████████████████████████████████████████████████████
echo.

echo +----------------------------------------------------------------+
echo ^|                        Access URLs                           ^|
echo +----------------------------------------------------------------+

if "!USE_DOMAIN_SERVER!"=="1" (
    echo [Domain Mode] Primary Access ^(No Ports^):
    echo   🌐 Frontend App:     https://sellercentral.amazon.com ^(HTTPS Only^)
    echo   🌐 Admin Panel:      http://admin.sellercentral.amazon.com ^(HTTP^)
    echo   🌐 Admin Panel:      https://admin.sellercentral.amazon.com ^(HTTPS^)
    echo   🔗 Backend API:      http://localhost:3001/api
    echo.
    echo [Backup] Local Access:
    echo   🏠 Frontend App:     http://localhost:3000
    echo   🏠 Admin Panel:      http://localhost:3002
) else if "!DOMAIN_MODE!"=="1" (
    echo [Domain Mode] With Port Numbers:
    echo   🌐 Frontend App:     https://sellercentral.amazon.com:3000
    echo   🌐 Admin Panel:      http://admin.sellercentral.amazon.com:3002
    echo   🔗 Backend API:      http://localhost:3001/api
    echo.
    echo [Local Mode] Standard Access:
    echo   🏠 Frontend App:     http://localhost:3000
    echo   🏠 Admin Panel:      http://localhost:3002
) else (
    echo [Local Mode] Standard Access:
    echo   🏠 Frontend App:     http://localhost:3000
    echo   🏠 Admin Panel:      http://localhost:3002
    echo   🔗 Backend API:      http://localhost:3001/api
)

echo.
echo +----------------------------------------------------------------+
echo ^|                        Login Information                      ^|
echo +----------------------------------------------------------------+
echo [Frontend] Option 1: admin@example.com / password123 / 123456
echo [Frontend] Option 2: admin@technest.com / A123456 / 123456
echo [Admin] admin / admin123
echo.

echo [LAUNCH] Opening browser with default domain URLs...
ping -n 2 127.0.0.1 >nul

REM Default to domain URLs when available
if "!USE_DOMAIN_SERVER!"=="1" (
    echo [OPEN] Opening domain URLs without ports...
    start "" "https://sellercentral.amazon.com"
    ping -n 2 127.0.0.1 >nul
    start "" "http://admin.sellercentral.amazon.com"
) else if "!DOMAIN_MODE!"=="1" (
    echo [OPEN] Opening domain URLs with ports...
    start "" "http://sellercentral.amazon.com:3000"
    ping -n 2 127.0.0.1 >nul
    start "" "http://admin.sellercentral.amazon.com:3002"
) else (
    echo [OPEN] Opening localhost URLs...
    start "" "http://localhost:3000"
    ping -n 2 127.0.0.1 >nul
    start "" "http://localhost:3002"
)

echo.
echo [OK] Application opened in browser
echo.

echo +----------------------------------------------------------------+
echo ^|                        Usage Tips                            ^|
echo +----------------------------------------------------------------+
echo [INFO] All services are running in background
echo [INFO] Closing this window will not stop services
echo [INFO] To stop services, run stop.bat or restart computer
if "!USE_DOMAIN_SERVER!"=="1" (
    echo [INFO] Domain server is running - access without port numbers
) else if "!DOMAIN_MODE!"=="1" (
    echo [INFO] Domain mode with ports - run as admin for no-port access
) else (
    echo [INFO] To enable domain mode, configure hosts file and run as admin
)
echo.

echo Press any key to exit launcher ^(services will continue running^)...
set /p dummy="Press Enter to exit..."
echo.
echo [INFO] Launcher exiting - services continue running in background
exit /b 0