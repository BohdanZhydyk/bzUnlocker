@echo off
setlocal EnableExtensions
pushd "%~dp0.." || goto :badpath
if not exist "package.json" goto :missingpkg
where npm >nul 2>&1 || goto :missingnpm

if not exist "node_modules\.bin\electron-builder.cmd" goto :install
if not exist "node_modules\.bin\vite.cmd" goto :install
goto :build

:install
echo [bzUnlocker] Installing dependencies...
call npm install
if errorlevel 1 goto :failed

:build
echo [bzUnlocker] Building Windows x64 installer...
call npm run dist:x64
set "RESULT=%ERRORLEVEL%"
if "%RESULT%"=="0" (
  echo [OK] release\bzUnlocker-Setup-x64.exe
) else (
  echo [ERROR] x64 build failed with code %RESULT%.
)
pause
popd
exit /b %RESULT%

:missingnpm
echo [ERROR] Node.js/npm not found in PATH.
goto :failed
:missingpkg
echo [ERROR] package.json is missing. Copy this CMD into the bzUnlocker project root.
goto :failed
:badpath
echo [ERROR] Cannot open project directory.
pause
exit /b 1
:failed
popd
pause
exit /b 1
