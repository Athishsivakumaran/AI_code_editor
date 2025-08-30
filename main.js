const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Creates the main application window.
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            // The preload script is essential for securely exposing Node.js APIs
            // to your frontend (renderer) process.
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Recommended for security
            nodeIntegration: false, // Recommended for security
        }
    });

    // Load the frontend of your IDE.
    mainWindow.loadFile('public/index.html');

    // Optional: Open the DevTools.
    // mainWindow.webContents.openDevTools();
}

// --- IPC Handlers for File System Operations ---

// This function is triggered when the "Open Folder" button is clicked in the frontend.
async function handleFolderOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) {
        return; // User canceled the dialog
    } else {
        const folderPath = filePaths[0];
        const files = fs.readdirSync(folderPath);
        return { path: folderPath, files: files };
    }
}

// This function is triggered when a file is clicked in the explorer.
async function handleFileRead(event, filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error('Failed to read file:', error);
        return null; // Return null or an error message
    }
}


// --- App Lifecycle ---

app.whenReady().then(() => {
    // Set up the IPC listeners. These are the secure endpoints your
    // frontend can call.
    ipcMain.handle('dialog:openFolder', handleFolderOpen);
    ipcMain.handle('fs:readFile', handleFileRead);

    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
