const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Expose protected methods that allow the renderer process (frontend)
// to use the ipcRenderer without exposing the entire object.
contextBridge.exposeInMainWorld('electronAPI', {
    // Expose a function to trigger the "Open Folder" dialog
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),

    // Expose a function to read a file's content
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),

    // We also need to expose the 'path.join' utility for the frontend
    // to correctly construct file paths.
    joinPath: (...args) => path.join(...args)
});
