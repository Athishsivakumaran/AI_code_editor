const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const pty = require('node-pty-prebuilt-multiarch');
// --- Global variables ---
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
let ptyProcess;
let fsWatcher = null; 
let mainWindow; 

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });
    mainWindow.loadFile('public/index.html');
    // For debugging, you can uncomment this line.
    mainWindow.webContents.openDevTools();
    
    ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.on('data', function (data) {
        if (mainWindow) {
            mainWindow.webContents.send('terminal:incomingData', data);
        }
    });
}

ipcMain.on('terminal:data', (event, data) => {
    if (ptyProcess) {
        ptyProcess.write(data);
    }
});

function readDirectoryRecursively(dirPath) {
    try {
        const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
        return dirents
            .filter(dirent => !dirent.name.startsWith('.'))
            .map(dirent => {
                const fullPath = path.join(dirPath, dirent.name);
                if (dirent.isDirectory()) {
                    return { name: dirent.name, type: 'directory', children: readDirectoryRecursively(fullPath) };
                } else {
                    return { name: dirent.name, type: 'file' };
                }
            });
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
    }
}

async function handleFolderOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (canceled) return null;
    const folderPath = filePaths[0];

    if (fsWatcher) {
        fsWatcher.close();
    }

    fsWatcher = fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
        if (mainWindow) {
            const updatedFileTree = readDirectoryRecursively(folderPath);
            mainWindow.webContents.send('file-system:change', { files: updatedFileTree });
        }
    });

    const fileTree = readDirectoryRecursively(folderPath);
    return { path: folderPath, files: fileTree };
}

async function handleFileRead(event, filePath) {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        return null;
    }
}

app.whenReady().then(() => {
    ipcMain.handle('dialog:openFolder', handleFolderOpen);
    ipcMain.handle('fs:readFile', handleFileRead);
    ipcMain.handle('path:join', (event, ...args) => path.join(...args));
    ipcMain.handle('path:sep', () => path.sep);
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (fsWatcher) {
        fsWatcher.close();
    }
    if (process.platform !== 'darwin') app.quit();
});

