# bzUnlocker

[English](README.md) | [Polski](README.pl.md) | [Українська](README.ua.md)

---

A lightweight Windows system utility to detect and release processes locking files and folders.

**Tech Stack:** Electron 22 + React 18 + SCSS + Vite + Windows Restart Manager API (`rstrtmgr.dll`).

---

## Download Standalone Installers (Windows)

* ⬇️ [Download bzUnlocker Setup x64 (64-bit)](https://github.com/BohdanZhydyk/bzUnlocker/raw/main/release/bzUnlocker-Setup-x64.exe)
* ⬇️ [Download bzUnlocker Setup x86 (32-bit)](https://github.com/BohdanZhydyk/bzUnlocker/raw/main/release/bzUnlocker-Setup-x86.exe)

---

## Quick Launch (CMD Scripts)

All helper scripts are located in the `scripts/` directory:

| Script | Action |
|---|---|
| `scripts\START-WINDOWS.cmd` | Launches Vite + Electron in development mode (with auto-UAC elevation). |
| `scripts\BUILD-x64.cmd` | Builds the 64-bit NSIS installer (`release\bzUnlocker-Setup-x64.exe`). |
| `scripts\BUILD-x86.cmd` | Builds the 32-bit NSIS installer (`release\bzUnlocker-Setup-x86.exe`). |

---

## Console Commands (NPM)

### 1. Install dependencies
```bash
npm install
```

### 2. Development mode (Live reload)
```bash
npm run dev
```
> **Note:** For the app to have full privileges to terminate system processes in dev mode, run terminal / VS Code as Administrator (or use `scripts\START-WINDOWS.cmd`).

### 3. Build installers
```bash
# Build frontend
npm run build

# Build 64-bit installer
npm run dist:x64

# Build 32-bit installer (x86)
npm run dist:x86
```
Build artifacts are placed in the `release/` directory.

---

## Key Features

* **Lock Detection:** Native Windows Restart Manager API scans handles without heavy third-party dependencies.
* **Auto-rescan:** Automatically verifies resource state immediately after terminating locking processes.
* **Silent Unlock:** Explorer right-click context menu entry (*Unlock (bzUnlocker)*) runs in the background with `--silent` flag — releases resource and displays a native Windows toast notification without opening GUI.
* **Multilingual:** UI available in EN, PL, and UA (clean SVG vector flags).
* **System Requirements:** Windows 7 / 10 / 11 (x86 / x64), Node.js 18 LTS.
