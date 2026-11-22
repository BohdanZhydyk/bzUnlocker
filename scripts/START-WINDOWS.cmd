@echo off
setlocal EnableExtensions

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo [bzUnlocker] Uruchamianie jako Administrator...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

pushd "%~dp0.." || goto :badpath
if not exist "package.json" goto :missingpkg
where npm >nul 2>&1 || goto :missingnpm

set "INSTALL=0"
if not exist "node_modules\.bin\electron.cmd" set "INSTALL=1"
if not exist "node_modules\.bin\vite.cmd" set "INSTALL=1"
if not exist "node_modules\.bin\concurrently.cmd" set "INSTALL=1"
if not exist "node_modules\.bin\wait-on.cmd" set "INSTALL=1"
if "%INSTALL%"=="1" (
  echo [bzUnlocker] Installing dependencies...
  call npm install
  if errorlevel 1 goto :failed
)

echo [bzUnlocker] Starting Vite and Electron...
call npm run dev
set "RESULT=%ERRORLEVEL%"
if not "%RESULT%"=="0" (
  echo [ERROR] npm run dev failed with code %RESULT%.
  pause
)
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
