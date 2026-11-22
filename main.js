const { app, BrowserWindow, dialog, ipcMain, Notification, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile, execFileSync } = require('child_process');
const { promisify } = require('util');
const exec = promisify(execFile);
let win;

app.setAppUserModelId('local.bzunlocker.app');

function checkAdmin() {
  if (process.platform !== 'win32') return true;
  try {
    execFileSync('fltmc.exe', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function relaunchAsAdmin() {
  const exe = process.execPath;
  const rawArgs = process.argv.slice(app.isPackaged ? 1 : 2).filter(a => !a.startsWith('--'));
  const fullArgs = app.isPackaged ? rawArgs : [__dirname, ...rawArgs];
  const argList = fullArgs.map(a => `\`"${a.replace(/`/g, '``').replace(/"/g, '`"')}\`"`).join(',');
  const psCmd = `Start-Process -FilePath "${exe}" ${argList ? `-ArgumentList ${argList}` : ''} -WorkingDirectory "${__dirname}" -Verb RunAs`;
  try {
    execFileSync('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', psCmd]);
    app.quit();
    return true;
  } catch {
    return false;
  }
}

const scanErrors = {
  rm_directory: 'Nie można przeskanować katalogu jako pojedynczego zasobu.',
  rm_out_of_memory: 'Brak pamięci potrzebnej do ukończenia skanowania.',
  rm_write_fault: 'Windows nie mógł odczytać lub zapisać danych wymaganych przez skanowanie.',
  rm_timeout: 'Usługa Windows Restart Manager nie odpowiedziała na czas. Uruchom ponownie system i spróbuj ponownie.',
  rm_cancelled: 'Skanowanie zostało anulowane.',
  access_denied: 'Brak dostępu do wybranego zasobu.',
  scan_failed: 'Nie udało się przeskanować wybranego zasobu.'
};

const isSilent = process.argv.includes('--silent');
const args = process.argv.slice(app.isPackaged ? 1 : 2).filter(a => !a.startsWith('--'));
const startupPath = args.find(a => {
  try { return path.isAbsolute(a) && fs.existsSync(a); } catch { return false; }
}) || '';

const contextKey = 'HKCU\\Software\\Classes\\*\\shell\\bzUnlocker';
const folderKey = 'HKCU\\Software\\Classes\\Directory\\shell\\bzUnlocker';
const reg = (args) => exec('reg.exe', args, { windowsHide: true });
const appIconPath = () => app.isPackaged ? process.execPath : path.join(__dirname, 'public', 'icon.ico');

async function contextEnabled() {
  try {
    const { stdout } = await reg(['query', contextKey + '\\command']);
    return stdout.includes('--silent');
  } catch {
    return false;
  }
}

async function setContext(enabled) {
  for (const key of [contextKey, folderKey]) {
    if (!enabled) {
      await reg(['delete', key, '/f']).catch(() => {});
      continue;
    }
    const cmd = app.isPackaged
      ? `"${process.execPath}" --silent "%1"`
      : `"${process.execPath}" "${__dirname}" --silent "%1"`;
    await reg(['add', key, '/ve', '/t', 'REG_SZ', '/d', 'Odblokuj (bzUnlocker)', '/f']);
    const icon = app.isPackaged ? process.execPath + ',0' : appIconPath();
    await reg(['add', key, '/v', 'Icon', '/t', 'REG_SZ', '/d', icon, '/f']);
    await reg(['add', key + '\\command', '/ve', '/t', 'REG_SZ', '/d', cmd, '/f']);
  }
  return enabled;
}

function ensurePath(p) {
  if (typeof p !== 'string' || !path.isAbsolute(p) || !fs.existsSync(p)) {
    throw new Error('Nieprawidłowa ścieżka lub zasób nie istnieje.');
  }
  const resolved = path.resolve(p);
  const root = path.parse(resolved).root;
  if (resolved.toLowerCase() === root.toLowerCase()) {
    throw new Error('Nie można operować na katalogu głównym dysku.');
  }
  return resolved;
}

async function runScan(p) {
  const target = ensurePath(p);
  const script = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'native', 'scan.ps1')
    : path.join(__dirname, 'native', 'scan.ps1');
  let stdout;
  try {
    ({ stdout } = await exec(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, '-Target', target],
      { windowsHide: true, maxBuffer: 4 * 1024 * 1024, timeout: 120000 }
    ));
  } catch (error) {
    if (error?.killed || error?.code === 'ETIMEDOUT') {
      throw new Error('Skanowanie trwało zbyt długo i zostało zatrzymane.');
    }
    throw new Error('Nie udało się uruchomić skanowania.');
  }
  let parsed;
  try {
    parsed = JSON.parse(stdout.trim());
  } catch {
    throw new Error('Skaner zwrócił nieprawidłową odpowiedź.');
  }
  if (parsed.errorCode) {
    const suffix = parsed.errorCode === 'rm_failed' && parsed.systemCode ? ` (kod Windows: ${parsed.systemCode})` : '';
    throw new Error((scanErrors[parsed.errorCode] || 'Nie udało się sprawdzić blokad pliku.') + suffix);
  }
  return parsed;
}

async function runKill(pid) {
  if (!Number.isInteger(pid) || pid <= 4 || pid === process.pid) throw new Error('Niedozwolony PID.');
  try {
    await exec('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true });
    return true;
  } catch {
    throw new Error(`Nie udało się zakończyć procesu PID ${pid}. Może być wymagane uruchomienie jako administrator.`);
  }
}

async function runSilentUnlock(targetPath) {
  const targetName = path.basename(targetPath);

  function notify(title, body) {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: appIconPath()
      }).show();
    }
  }

  try {
    const res = await runScan(targetPath);
    const processes = res.processes || [];

    if (processes.length === 0) {
      notify('bzUnlocker', `Zasób "${targetName}" nie jest zablokowany.`);
    } else {
      const killedNames = [];
      for (const p of processes) {
        try {
          await runKill(p.pid);
          killedNames.push(p.name || `PID ${p.pid}`);
        } catch {}
      }
      const uniqueNames = [...new Set(killedNames)];
      notify(
        'bzUnlocker — Odblokowano',
        `Odblokowano: ${targetName}\nZamknięto: ${uniqueNames.join(', ')}`
      );
    }
  } catch (err) {
    notify('bzUnlocker — Błąd', err.message || 'Nie udało się odblokować zasobu.');
  }

  setTimeout(() => app.quit(), 2500);
}

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    icon: appIconPath(),
    backgroundColor: '#101824',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.webContents.on('will-navigate', (e, url) => {
    if ((url.startsWith('http:') || url.startsWith('https:')) && !url.startsWith('http://127.0.0.1:5173')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  win.setMenu(null);
  if (app.isPackaged) win.loadFile(path.join(__dirname, 'dist/index.html'));
  else win.loadURL('http://127.0.0.1:5173');
}

app.whenReady().then(async () => {
  if (isSilent && startupPath) {
    await runSilentUnlock(startupPath);
    return;
  }

  ipcMain.handle('is-admin', () => checkAdmin());
  ipcMain.handle('elevate', () => relaunchAsAdmin());
  ipcMain.handle('initial-path', () => startupPath);
  ipcMain.handle('open-external', async (_, url) => {
    if (typeof url === 'string' && (url.startsWith('http:') || url.startsWith('https:'))) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  });
  ipcMain.handle('choose', async (_, type) => {
    if (type !== 'file' && type !== 'folder') throw new Error('Nieprawidłowy typ wyboru.');
    const properties = type === 'file' ? ['openFile'] : ['openDirectory'];
    const result = await dialog.showOpenDialog(win, { properties });
    return result.canceled ? '' : result.filePaths[0];
  });
  ipcMain.handle('context-status', async () => {
    const enabled = await contextEnabled();
    if (enabled) await setContext(true).catch(() => {});
    return enabled;
  });
  ipcMain.handle('context', async (_, enabled) => {
    try {
      return await setContext(Boolean(enabled));
    } catch {
      throw new Error('Nie udało się zmienić wpisu w menu kontekstowym Windows.');
    }
  });
  ipcMain.handle('scan', async (_, p) => runScan(p));
  ipcMain.handle('kill', async (_, pid) => runKill(pid));
  ipcMain.handle('remove', async (_, p) => {
    const target = ensurePath(p);
    try {
      await fs.promises.rm(target, { recursive: true, force: false });
    } catch {
      throw new Error('Nie udało się usunąć zasobu. Może być nadal używany albo wymagać uprawnień administratora.');
    }
    return true;
  });

  createWindow();
});

app.on('window-all-closed', () => app.quit());
