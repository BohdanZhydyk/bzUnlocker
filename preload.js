const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('unlocker', {
  choose: type => ipcRenderer.invoke('choose', type),
  scan: path => ipcRenderer.invoke('scan', path),
  kill: pid => ipcRenderer.invoke('kill', pid),
  remove: path => ipcRenderer.invoke('remove', path),
  context: enabled => ipcRenderer.invoke('context', enabled),
  contextStatus: () => ipcRenderer.invoke('context-status'),
  initialPath: () => ipcRenderer.invoke('initial-path'),
  isAdmin: () => ipcRenderer.invoke('is-admin'),
  elevate: () => ipcRenderer.invoke('elevate'),
  openExternal: url => ipcRenderer.invoke('open-external', url)
});
