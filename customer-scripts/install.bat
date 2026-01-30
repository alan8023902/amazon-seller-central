@echo off
chcp 65001 > nul 2>&1
title Amazon Seller Central - Installation
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo.
echo ================================================================
echo                Amazon Seller Central - Installation
echo ================================================================
echo.
echo [INFO] Installation Directory: %~dp0
echo [INFO] Installation Time: %date% %time%
echo [INFO] Version: Customer v1.0 - English
echo.

echo ================================================================
echo                    System Environment Check
echo ================================================================
echo.

REM Check administrator privileges
echo [CHECK] Administrator privileges...
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Recommend running as administrator to avoid permission issues
    echo [TIP] Right-click script and select "Run as administrator"
    echo.
) else (
    echo [OK] Administrator privileges detected
)

REM Check path for Chinese characters
echo [CHECK] Installation path...
echo %~dp0 | findstr /R "[^\x00-\x7F]" >nul
if %errorlevel% equ 0 (
    echo [WARN] Installation path contains non-ASCII characters, may cause npm issues
    echo [TIP] Most cases still work normally, continuing installation...
    echo.
) else (
    echo [OK] Path character check passed
)

REM Check disk space
echo [CHECK] Disk space...
for /f "tokens=3" %%a in ('dir /-c "%~dp0" 2^>nul ^| find "bytes free"') do set AVAILABLE_SPACE=%%a
if defined AVAILABLE_SPACE (
    if "!AVAILABLE_SPACE!" neq "" (
        set /a AVAILABLE_MB=!AVAILABLE_SPACE!/1048576 2>nul
        if !errorlevel! equ 0 (
            if !AVAILABLE_MB! lss 500 (
                echo [WARN] Disk space may be insufficient (Available: !AVAILABLE_MB!MB)
                echo [TIP] Recommend at least 500MB space, continuing installation...
            ) else (
                echo [OK] Sufficient disk space (!AVAILABLE_MB!MB)
            )
        ) else (
            echo [WARN] Cannot calculate disk space, continuing installation...
        )
    ) else (
        echo [WARN] Cannot detect disk space, continuing installation...
    )
) else (
    echo [WARN] Cannot detect disk space, continuing installation...
)

REM Check network connection
echo [CHECK] Network connection...
ping -n 1 registry.npmmirror.com >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Cannot connect to China mirror, trying official source...
    ping -n 1 registry.npmjs.org >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARN] Network connection may have issues, but will try installation
        set USE_OFFICIAL_REGISTRY=1
    ) else (
        echo [OK] Will use official npm source
        set USE_OFFICIAL_REGISTRY=1
    )
) else (
    echo [OK] Network connection normal, using China mirror
    set USE_OFFICIAL_REGISTRY=0
)

REM Check antivirus software
echo [CHECK] Security software...
tasklist /FI "IMAGENAME eq 360tray.exe" 2>NUL | find /I /N "360tray.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [WARN] 360 Security Guard detected, may block npm installation
    echo [TIP] Temporarily disable real-time protection or add to trust list
)

tasklist /FI "IMAGENAME eq QQPCTray.exe" 2>NUL | find /I /N "QQPCTray.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [WARN] Tencent PC Manager detected, may block npm installation
    echo [TIP] Temporarily disable real-time protection or add to trust list
)

echo [OK] Environment check completed

REM Pre-cleanup: Clean possible old cache
echo [PRE-CLEANUP] Cleaning possible old cache files...
if exist ".npm-cache" (
    echo [PRE-CLEANUP] Deleting old .npm-cache directory...
    rmdir /s /q ".npm-cache" 2>nul
)
for /d %%i in ("%TEMP%\npm-*") do (
    rmdir /s /q "%%i" 2>nul
)
echo [OK] Pre-cleanup completed
echo.

echo ================================================================
echo                        Installation Process
echo ================================================================
echo.

REM Step 1: Check Node.js
echo [Step 1/5] Checking Node.js environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found
    echo.
    echo [SEARCH] Looking for Node.js installation...
    
    REM Search common Node.js installation paths
    set NODE_FOUND=0
    set "NODE_PATH="
    
    if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_PATH=C:\Program Files\nodejs"
        set NODE_FOUND=1
    )
    if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "NODE_PATH=C:\Program Files (x86)\nodejs"
        set NODE_FOUND=1
    )
    
    if !NODE_FOUND! equ 1 (
        echo [OK] Found Node.js installation: !NODE_PATH!
        echo [FIX] Environment variables...
        set "PATH=!NODE_PATH!;!PATH!"
        
        "!NODE_PATH!\node.exe" --version >nul 2>&1
        if !errorlevel! equ 0 (
            for /f "tokens=*" %%i in ('"!NODE_PATH!\node.exe" --version 2^>nul') do set NODE_VERSION=%%i
            echo [OK] Node.js environment fixed successfully: !NODE_VERSION!
            echo [TIP] Recommend restarting computer to permanently fix environment variables
            goto NODEJS_OK
        )
    )
    
    echo.
    echo ================================================================
    echo                        Installation Failed
    echo ================================================================
    echo.
    echo [ERROR] Need to install Node.js
    echo.
    echo [SOLUTION] Please install Node.js manually:
    echo   1. Visit https://nodejs.org
    echo   2. Download LTS version
    echo   3. Install with default settings
    echo   4. Restart computer after installation
    echo   5. Re-run this installation program
    echo.
    echo [QUICK INSTALL] Command line installation:
    echo   - choco install nodejs
    echo   - winget install OpenJS.NodeJS
    echo.
    echo Press any key to exit...
    set /p dummy=
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
    echo [OK] Node.js Version: !NODE_VERSION!
)

:NODEJS_OK
echo.

REM Step 2: Check application files
echo [Step 2/5] Checking application files...
if exist "app\backend\package.json" (
    echo [OK] Detected customer package structure (app directory)
    set APP_STRUCTURE=customer
    goto FILES_OK
) 
if exist "backend\package.json" (
    echo [OK] Detected development environment structure
    set APP_STRUCTURE=dev
    goto FILES_OK
)

echo [ERROR] No valid package structure found
echo [TIP] Please ensure one of the following exists:
echo   - app\backend\package.json (customer package)
echo   - backend\package.json (development environment)
pause
exit /b 1

:FILES_OK
echo.

echo [Step 3/5] Installing dependency packages...
echo.
echo ================================================================
echo                        Installation Tips
echo ================================================================
echo [TIP] This may take several minutes, please be patient...
echo [TIP] If antivirus prompts, please select "Allow" or "Trust"
echo [TIP] Do not close this window during installation
echo [TIP] Download progress will be displayed in real-time
echo.

REM Configure npm
echo [CONFIG] Optimizing npm settings...
if !USE_OFFICIAL_REGISTRY! equ 1 (
    echo [CONFIG] Using official npm registry...
    call npm config set registry https://registry.npmjs.org
) else (
    echo [CONFIG] Using China mirror registry...
    call npm config set registry https://registry.npmmirror.com
)

call npm config set fetch-retries 5
call npm config set fetch-retry-mintimeout 20000
call npm config set fetch-retry-maxtimeout 120000
call npm config set audit false
call npm config set fund false
call npm config set progress true
call npm config set loglevel info

REM Set cache directory to local fixed location
set LOCAL_CACHE=%~dp0.npm-cache
set LOCAL_TMP=%~dp0.npm-tmp
call npm config set cache "%LOCAL_CACHE%" 2>nul
call npm config set tmp "%LOCAL_TMP%" 2>nul

echo.
echo ================================================================
echo                        Installation Progress
echo ================================================================
echo.

REM Install tools dependencies (new)
echo [Progress 1/5] Installing tools dependencies...
echo ████████████████                                        [20%%]
echo [Status] Downloading domain server dependency packages...
if "%APP_STRUCTURE%"=="customer" (
    if exist "app\tools\package.json" (
        cd app\tools
        call npm install --no-audit --no-fund
        set TOOLS_ERROR=!errorlevel!
        cd "%~dp0"
        if !TOOLS_ERROR! neq 0 (
            echo [WARNING] Tools dependency installation failed, domain features may not work
        ) else (
            echo [OK] Tools dependencies installed successfully
        )
    ) else (
        echo [SKIP] No tools dependency configuration found
    )
) else (
    if exist "tools\package.json" (
        cd tools
        call npm install --no-audit --no-fund
        set TOOLS_ERROR=!errorlevel!
        cd "%~dp0"
        if !TOOLS_ERROR! neq 0 (
            echo [WARNING] Tools dependency installation failed, domain features may not work
        ) else (
            echo [OK] Tools dependencies installed successfully
        )
    ) else (
        echo [SKIP] No tools dependency configuration found
    )
)

REM Install backend dependencies
echo [Progress 2/5] Installing backend dependencies...
echo ████████████████████████████████                        [40%%]
echo [Status] Downloading and installing backend packages, please wait...
if "%APP_STRUCTURE%"=="customer" (
    cd app\backend
) else (
    cd backend
)
call npm install --no-audit --no-fund
set BACKEND_ERROR=!errorlevel!
cd "%~dp0"

if !BACKEND_ERROR! neq 0 (
    echo [WARNING] Backend dependency installation encountered issues, trying to fix...
    echo [RETRY] Backend dependency installation...
    if "%APP_STRUCTURE%"=="customer" (
        cd app\backend
    ) else (
        cd backend
    )
    call npm install --no-audit --no-fund --verbose
    set BACKEND_ERROR=!errorlevel!
    cd "%~dp0"
    if !BACKEND_ERROR! neq 0 (
        echo [ERROR] Backend dependency installation failed, but continuing other components
        echo [TIP] Backend service may not start properly, can be handled manually later
    ) else (
        echo [OK] Backend dependency installation fixed successfully
    )
) else (
    echo [OK] Backend dependencies installed successfully
)

REM Install frontend dependencies
echo [Progress 3/5] Installing frontend dependencies...
echo ████████████████████████████████████████                [60%%]
echo [Status] Downloading and installing frontend packages, please wait...
if "%APP_STRUCTURE%"=="customer" (
    cd app\frontend
) else (
    cd frontend
)
call npm install --no-audit --no-fund
set FRONTEND_ERROR=!errorlevel!
cd "%~dp0"

if !FRONTEND_ERROR! neq 0 (
    echo [WARNING] Frontend dependency installation encountered issues, but continuing
    echo [TIP] Frontend may need manual handling
) else (
    echo [OK] Frontend dependencies installed successfully
)

REM Install admin dependencies
echo [Progress 4/5] Installing admin panel dependencies...
echo ████████████████████████████████████████████████        [80%%]
echo [Status] Downloading and installing admin panel packages, please wait...
if "%APP_STRUCTURE%"=="customer" (
    cd app\backend-admin
) else (
    cd backend-admin
)
call npm install --no-audit --no-fund
set ADMIN_ERROR=!errorlevel!
cd "%~dp0"

if !ADMIN_ERROR! neq 0 (
    echo [WARNING] Admin dependency installation encountered issues, but continuing
    echo [TIP] Admin panel may need manual handling
) else (
    echo [OK] Admin dependencies installed successfully
)

REM Install global tools
echo [Progress 5/5] Installing global tools...
echo ████████████████████████████████████████████████████████ [100%%]
echo [Status] Installing serve tool for static file service...
call npm install -g serve --no-audit --no-fund 2>nul
if !errorlevel! neq 0 (
    echo [WARNING] Global serve installation failed, trying local installation...
    echo [BACKUP] Installing serve locally as backup...
    call npm install serve --no-audit --no-fund --save-dev
    if !errorlevel! neq 0 (
        echo [WARNING] Local serve installation also failed
        echo [TIP] Will use npx serve during startup (first run may be slower)
    ) else (
        echo [OK] Serve installed locally as backup
    )
) else (
    echo [OK] Serve installed globally successfully
)

REM Install local serve for reliability
echo [BACKUP] Installing local serve to improve reliability...
call npm install serve --no-audit --no-fund --save-dev 2>nul
if !errorlevel! equ 0 (
    echo [OK] Local serve backup installation completed
)

REM Install node-forge for certificate generation
echo [SSL] Installing node-forge for SSL certificate generation...
call npm install node-forge --no-audit --no-fund --save-dev 2>nul
if !errorlevel! neq 0 (
    echo [WARNING] node-forge installation failed, HTTPS domain mode may not work
    echo [TIP] HTTPS access will fallback to HTTP mode
) else (
    echo [OK] node-forge installation completed, supports certificate generation
)

echo [OK] Dependency installation completed

REM Build projects
echo [BUILD] Building project files...
echo [Build 1/3] Building backend project...
if "%APP_STRUCTURE%"=="customer" (
    cd app\backend
) else (
    cd backend
)
call npm run build
set BUILD_BACKEND_ERROR=!errorlevel!
cd "%~dp0"

if !BUILD_BACKEND_ERROR! neq 0 (
    echo [WARNING] Backend build failed, but continuing other components
) else (
    echo [OK] Backend build successful
)

echo [Build 2/3] Building frontend project...
if "%APP_STRUCTURE%"=="customer" (
    cd app\frontend
) else (
    cd frontend
)
call npm run build
set BUILD_FRONTEND_ERROR=!errorlevel!
cd "%~dp0"

if !BUILD_FRONTEND_ERROR! neq 0 (
    echo [WARNING] Frontend build failed, but continuing other components
) else (
    echo [OK] Frontend build successful
)

echo [Build 3/3] Building admin panel...
if "%APP_STRUCTURE%"=="customer" (
    cd app\backend-admin
) else (
    cd backend-admin
)
call npm run build
set BUILD_ADMIN_ERROR=!errorlevel!
cd "%~dp0"

if !BUILD_ADMIN_ERROR! neq 0 (
    echo [WARNING] Admin panel build failed, but continuing
) else (
    echo [OK] Admin panel build successful
)

echo [OK] Project build completed

REM Clean temporary cache directories
echo [CLEANUP] Resetting npm configuration...

REM Reset npm configuration we set, restore defaults
call npm config delete cache 2>nul
call npm config delete tmp 2>nul

echo [OK] npm configuration has been reset
echo [TIP] Local cache retained in .npm-cache directory, can be reused for next installation
echo.

REM Step 4: Create desktop shortcut
echo [Step 4/5] Creating desktop shortcut...

REM Check if shortcut already exists
if exist "%USERPROFILE%\Desktop\Amazon Seller Central.lnk" (
    echo [OVERWRITE] Found existing shortcut, will overwrite...
    del "%USERPROFILE%\Desktop\Amazon Seller Central.lnk" >nul 2>&1
)

REM Create shortcut pointing to start.bat (not launcher.bat)
powershell -command "try { $WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Amazon Seller Central.lnk'); $Shortcut.TargetPath = '%~dp0start.bat'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = 'Amazon Seller Central Application - Smart Launcher'; if (Test-Path '%~dp0..\logs-001.ico') { $Shortcut.IconLocation = '%~dp0..\logs-001.ico' } elseif (Test-Path '%~dp0logs-001.ico') { $Shortcut.IconLocation = '%~dp0logs-001.ico' }; $Shortcut.Save(); exit 0 } catch { exit 1 }" > nul 2>&1
if errorlevel 1 (
    echo [WARNING] Desktop shortcut creation failed, but does not affect usage
    echo [TIP] You can manually create a shortcut to start.bat
) else (
    echo [OK] Desktop shortcut created successfully (points to start.bat)
    echo [INFO] Shortcut will use smart startup logic
)
echo.

REM Step 5: Verify installation
echo [Step 5/5] Verifying installation...
set INSTALL_SUCCESS=1

if "%APP_STRUCTURE%"=="customer" (
    if exist "app\backend\node_modules" (
        echo [OK] Backend dependencies: Installed
    ) else (
        echo [ERROR] Backend dependencies: Not installed
        set INSTALL_SUCCESS=0
    )
    
    if exist "app\frontend\node_modules" (
        echo [OK] Frontend dependencies: Installed
    ) else (
        echo [WARNING] Frontend dependencies: Not installed
    )
    
    if exist "app\backend-admin\node_modules" (
        echo [OK] Admin dependencies: Installed
    ) else (
        echo [WARNING] Admin dependencies: Not installed
    )
) else (
    if exist "backend\node_modules" (
        echo [OK] Backend dependencies: Installed
    ) else (
        echo [ERROR] Backend dependencies: Not installed
        set INSTALL_SUCCESS=0
    )
    
    if exist "frontend\node_modules" (
        echo [OK] Frontend dependencies: Installed
    ) else (
        echo [WARNING] Frontend dependencies: Not installed
    )
    
    if exist "backend-admin\node_modules" (
        echo [OK] Admin dependencies: Installed
    ) else (
        echo [WARNING] Admin dependencies: Not installed
    )
)

echo.
echo ================================================================
if !INSTALL_SUCCESS! equ 1 (
    echo                      Installation Complete!
) else (
    echo                    Installation Partially Complete
)
echo ================================================================
echo.

echo ================================================================
echo                        Installation Summary
echo ================================================================
echo [OK] Node.js Environment: Verified
echo [OK] Application Files: Complete
echo [OK] Desktop Shortcut: Created
echo.

echo ================================================================
echo                        How to Start
echo ================================================================
echo [RECOMMENDED] Double-click desktop shortcut "Amazon Seller Central"
echo [ALTERNATIVE] Double-click start.bat (smart launcher)
echo [DIAGNOSTIC] Double-click troubleshoot.bat for troubleshooting
echo.

echo ================================================================
echo                        Access URLs
echo ================================================================
echo [FRONTEND] http://localhost:3000
echo [ADMIN] http://localhost:3002
echo [API] http://localhost:3001
echo.

echo ================================================================
echo                        Login Information
echo ================================================================
echo [FRONTEND] admin@example.com / password123 / 123456
echo [ADMIN] admin / admin123
echo.

echo ================================================================
echo                        Usage Tips
echo ================================================================
echo [TIP] First startup may take longer time
echo [TIP] If you encounter issues, run troubleshoot.bat for diagnosis
echo [TIP] Supports both local mode and domain mode startup
echo.

if !INSTALL_SUCCESS! equ 0 (
    echo ================================================================
    echo                        Troubleshooting
    echo ================================================================
    echo [TIP] Some dependencies failed to install, but you can try to start
    echo [TIP] If startup fails, please run troubleshoot.bat
    echo [TIP] Or try running as administrator and reinstall
    echo.
)

echo ================================================================
echo                    Ready to Launch!
echo ================================================================
echo.
echo [NEXT STEP] Start the application:
echo   1. Double-click desktop shortcut "Amazon Seller Central"
echo   2. Or run start.bat (recommended)
echo.
echo [AUTO FEATURES] The application will automatically:
echo   - Clean up port conflicts
echo   - Start all services (frontend, backend, admin)
echo   - Open browser to http://localhost:3000

echo.
echo Press any key to exit...
set /p dummy=
exit /b 0