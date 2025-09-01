// preload.js
const { contextBridge, ipcRenderer } = require('electron');

try {
    contextBridge.exposeInMainWorld('electronAPI', {
        openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
        readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
        joinPath: (...args) => ipcRenderer.invoke('path:join', ...args),
        pathSep: () => ipcRenderer.invoke('path:sep'),
        sendToTerminal: (data) => ipcRenderer.send('terminal:data', data),
        onTerminalData: (callback) => ipcRenderer.on('terminal:incomingData', (_event, data) => callback(data)),
        onFileSystemChange: (callback) => ipcRenderer.on('file-system:change', (_event, data) => callback(data)),
    });
} catch (error) {
    console.error('CRITICAL ERROR in preload script:', error);
}