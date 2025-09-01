document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables and Element References ---
    let currentFolderPath = null, fileData = {}, openTabs = [], activeTab = null, editor;
    const fileTreeEl = document.getElementById('file-tree'), tabBarEl = document.getElementById('tab-bar'),
          emptyTabMessageEl = document.getElementById('empty-tab-message'), editorContainer = document.getElementById('editor-container'),
          openFolderBtn = document.getElementById('open-folder-btn'), folderNameEl = document.getElementById('folder-name'),
          terminalContainer = document.getElementById('terminal-container'),
          terminalSection = document.getElementById('terminal-section');
    
    const fileIcons = {
        js: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="text-yellow-400" viewBox="0 0 16 16"><path d="M7.424 10.182a.56.56 0 0 1 .188-.46l.454-.403a.56.56 0 0 1 .46-.188c.119 0 .23.05.313.144l.426.475c.1.11.15.24.15.371a.56.56 0 0 1-.188.46l-.454-.402a.56.56 0 0 1-.46.188c-.119 0-.23-.05-.313-.144l-.426-.475a.46.46 0 0 1-.15-.37Zm3.754-5.322a.56.56 0 0 1 .188-.46l.455-.402a.56.56 0 0 1 .46-.188c.118 0 .23.05.312.144l.426.475c.1.11.15.24.15.371a.56.56 0 0 1-.188.46l-.454-.403a.56.56 0 0 1-.46.188c-.119 0-.23-.05-.313-.144l-.426-.475a.46.4-6Z"/></svg>`,
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="text-orange-600" viewBox="0 0 16 16"><path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Z"/><path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 0h-13ZM1 1.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5-.5h-13a.5.5 0 0 1-.5-.5v-13Z"/></svg>`,
        css: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="text-blue-500" viewBox="0 0 16 16"><path d="M3.146 3.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L4.793 5.5 3.146 3.854a.5.5 0 0 1 0-.708Zm-1.414-.354a.5.5 0 0 1 0 .708L.32 5.5l1.414 1.414a.5.5 0 0 1-.707.708L-1.06 5.854a.5.5 0 0 1 0-.708l2.12-2.122a.5.5 0 0 1 .708 0ZM8 1l2.854 2.854a.5.5 0 0 1 0 .708L8 7.414l-2.854-2.854a.5.5 0 1 1 .708-.708L8 6l2.146-2.146a.5.5 0 0 1 .708 0L13.707 6a.5.5 0 1 1-.707.708L11 4.707 8.854 6.854a.5.5 0 0 1-.708 0L6 4.707 3.854 6.854a.5.5 0 0 1-.708-.708L6 3.293 3.854 1.146a.5.5 0 1 1 .708-.708L7.146 3 8 4.293 10.146 2.146a.5.5 0 0 1 .708 0L13 4.293l2.146-2.147a.5.5 0 0 1 .708.708L13.707 5l1.414 1.414a.5.5 0 0 1 0 .708l-2.122 2.121a.5.5 0 0 1-.707 0L10.146 7 8 9.146 5.854 7a.5.5 0 0 1-.708 0L3 4.854 1.586 6.267a.5.5 0 1 1-.707-.707L3.146.414a2.5 2.5 0 0 1 3.536 0l1.292 1.293L10.828.414a2.5 2.5 0 0 1 3.536 0l1.414 1.414a2.5 2.5 0 0 1 0 3.536l-1.293 1.292L16 8.586a2.5 2.5 0 0 1 0 3.536l-1.414 1.414a2.5 2.5 0 0 1-3.536 0L9.707 12.293 8 14l-1.707-1.707a2.5 2.5 0 0 1-3.536 0L1.343 10.88a2.5 2.5 0 0 1 0-3.536l1.293-1.293L.414 4.854a2.5 2.5 0 0 1 0-3.536Z"/></svg>`,
        json: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="text-green-400" viewBox="0 0 16 16"><path d="M12 1.5v13h-2v-2.25A2.75 2.75 0 0 0 7.25 9.5h-2.5A2.75 2.75 0 0 0 2 12.25V14.5H0v-13h2v2.25A2.75 2.75 0 0 1 4.75 6.5h2.5A2.75 2.75 0 0 1 10 3.75V1.5h2ZM10 12.25a1.25 1.25 0 0 1-1.25 1.25h-5A1.25 1.25 0 0 1 2.5 12.25V12h5v.25Z"/><path d="M4.75 5a1.25 1.25 0 0 1 1.25-1.25h5A1.25 1.25 0 0 1 12.25 5V6h-5V5Z"/></svg>`,
        md: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 0h-13ZM3 12V4h1.5l1.5 2 1.5-2H9v8H7.5V7.5l-1.5 2-1.5-2V12H3Zm8.5-4h-1V5.5H14v.65L12.5 9H14v3h-1.5v-2.5h-1V12h-1V8Z"/></svg>`,
        file: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8.5a.5.5 0 0 0-.146-.354L9.854 1.146A.5.5 0 0 0 9.5 1h-6Z"/><path d="M9 1h.5v3a.5.5 0 0 0 .5.5h3v.5a.5.5 0 0 0 1 0V4.5a.5.5 0 0 0-.146-.354l-3-3A.5.5 0 0 0 10.5 1H10V.5a.5.5 0 0 0-1 0V1Z"/></svg>`,
        folder: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="folder-caret text-sky-400" viewBox="0 0 16 16"><path d="M6 12.796V3.204L11.481 8 6 12.796Z"/></svg>`,
    };
    
    function getIcon(filename, isFolder = false, isOpen = false) {
        if (isFolder) {
            const iconSvg = fileIcons.folder;
            const openClass = isOpen ? ' open' : '';
            return iconSvg.replace('class="folder-caret', `class="folder-caret${openClass}`);
        }
        const ext = filename.split('.').pop();
        return fileIcons[ext] || fileIcons.file;
    }

    function getLanguage(filename) {
        const ext = filename.split('.').pop();
        switch (ext) {
            case 'js': return 'javascript';
            case 'html': return 'html';
            case 'css': return 'css';
            case 'json': return 'json';
            case 'md': return 'markdown';
            case 'ts': return 'typescript';
            case 'py': return 'python';
            case 'java': return 'java';
            case 'xml': return 'xml';
            default: return 'plaintext';
        }
    }
    
    function renderFileTree(nodes, parentEl, currentPath) {
        nodes.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
        }).forEach(node => {
            const el = document.createElement('div');
            const nodeRelativePath = currentPath ? `${currentPath}/${node.name}` : node.name;

            if (node.type === 'directory') {
                el.classList.add('folder-entry');
                el.dataset.path = nodeRelativePath;
                el.innerHTML = `
                    <div class="folder-header flex items-center p-1 rounded-md">
                        ${getIcon(node.name, true, false)}
                        <span class="ml-2 text-sm">${node.name}</span>
                    </div>
                    <div class="children-container ml-4 hidden border-l border-color pl-2"></div>
                `;
                const childrenContainer = el.querySelector('.children-container');
                const folderHeader = el.querySelector('.folder-header');
                
                folderHeader.addEventListener('click', () => {
                    const isHidden = childrenContainer.classList.toggle('hidden');
                    folderHeader.querySelector('svg').classList.toggle('open', !isHidden);
                });
                
                if (node.children && node.children.length > 0) {
                    renderFileTree(node.children, childrenContainer, nodeRelativePath);
                }
            } else {
                el.classList.add('file-entry', 'flex', 'items-center', 'p-1', 'rounded-md');
                el.innerHTML = `${getIcon(node.name)} <span class="ml-2 text-sm">${node.name}</span>`;
                el.addEventListener('click', () => openFile(nodeRelativePath));
            }
            parentEl.appendChild(el);
        });
    }

    function renderTabs() {
        tabBarEl.innerHTML = '';
        if (openTabs.length === 0) {
            tabBarEl.appendChild(emptyTabMessageEl);
            return;
        }
        openTabs.forEach(filepath => {
            const tab = document.createElement('div');
            tab.className = `tab p-3 pr-2 text-sm cursor-pointer flex items-center justify-between border-t border-transparent ${filepath === activeTab ? 'active' : ''}`;
            tab.dataset.filepath = filepath;
            const filename = filepath.split('/').pop();

            const title = document.createElement('span');
            title.textContent = filename;

            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '&times;';
            closeBtn.className = 'close-tab-btn ml-3 text-lg';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeTab(filepath);
            });
            
            tab.appendChild(title);
            tab.appendChild(closeBtn);

            tab.addEventListener('click', () => switchTab(filepath));
            tabBarEl.appendChild(tab);
        });
    }
    
    async function openFile(relativePath) {
        if (openTabs.includes(relativePath)) {
            switchTab(relativePath);
            return;
        }
        const fullPath = await window.electronAPI.joinPath(currentFolderPath, relativePath);
        const content = await window.electronAPI.readFile(fullPath);
        
        if (content !== null) {
            const model = monaco.editor.createModel(content, getLanguage(relativePath));
            fileData[relativePath] = { content, model };
            openTabs.push(relativePath);
            switchTab(relativePath);
        }
    }

    function closeTab(filepath) {
        const index = openTabs.indexOf(filepath);
        if (index === -1) return;

        openTabs.splice(index, 1);
        fileData[filepath].model.dispose();
        delete fileData[filepath];

        if (activeTab === filepath) {
            const newActivePath = openTabs[index] || openTabs[index - 1] || null;
            switchTab(newActivePath);
        } else {
            renderTabs();
        }
    }

    function switchTab(relativePath) {
        activeTab = relativePath;
        if (relativePath && fileData[relativePath]) {
            editor.setModel(fileData[relativePath].model);
            editor.updateOptions({ readOnly: false });
        } else {
            editor.setModel(null);
            editor.updateOptions({ readOnly: true });
            editor.setValue("// Select a file to edit or open a folder to begin.");
        }
        renderTabs();
    }

    // --- App Initialization Function ---
    function initializeApp() {
        if (!window.electronAPI) {
            document.body.innerHTML = `<div class="text-red-500 p-8"><h1>Fatal Error</h1><p>Application could not connect to its backend.</p></div>`;
            return;
        }
        
        term.onData(data => window.electronAPI.sendToTerminal(data));
        window.electronAPI.onTerminalData(data => term.write(data));

        openFolderBtn.disabled = false;
        openFolderBtn.classList.remove('disabled:cursor-not-allowed');
        openFolderBtn.addEventListener('click', async () => {
            const folderData = await window.electronAPI.openFolder();
            if (folderData) {
                currentFolderPath = folderData.path;
                const separator = await window.electronAPI.pathSep();
                folderNameEl.textContent = currentFolderPath.split(separator).pop();
                fileData = {}; openTabs = []; switchTab(null);
                fileTreeEl.innerHTML = ''; 
                renderFileTree(folderData.files, fileTreeEl, '');
            }
        });
        
        window.electronAPI.onFileSystemChange((data) => {
            const openFolders = new Set();
            document.querySelectorAll('.folder-entry .folder-header .open').forEach(el => {
                const folderEntry = el.closest('.folder-entry');
                if (folderEntry && folderEntry.dataset.path) {
                   openFolders.add(folderEntry.dataset.path);
                }
            });

            fileTreeEl.innerHTML = ''; 
            renderFileTree(data.files, fileTreeEl, '');

            document.querySelectorAll('.folder-entry').forEach(entry => {
                if (openFolders.has(entry.dataset.path)) {
                    const header = entry.querySelector('.folder-header');
                    if(header) header.click();
                }
            });
        });
    }

    // --- CORRECTED Loading and Initialization Sequence ---
    let monacoReady = false;
    let apiReady = false;

    function attemptToInitialize() {
        if (monacoReady && apiReady) {
            initializeApp();
        }
    }
    
    // The API is ready if the preload script successfully exposed it.
    if (window.electronAPI) {
        apiReady = true;
    } else {
        console.error("FATAL: window.electronAPI was not found. The preload script likely failed.");
    }

    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs' }});
    require(['vs/editor/editor.main'], () => {
        editor = monaco.editor.create(editorContainer, { 
            value: "// Welcome to your IDE!", 
            theme: 'vs-dark', 
            automaticLayout: true, 
            readOnly: true 
        });
        monacoReady = true;
        attemptToInitialize();
    });
    
    const term = new Terminal({
        cursorBlink: true, convertEol: true,
        fontFamily: 'Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace',
        theme: { background: '#121212', foreground: '#e0e0e0', cursor: '#0e639c' }
    });
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalContainer);
    fitAddon.fit();

    let resizeTimeout;
    new ResizeObserver(() => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => fitAddon.fit(), 150);
    }).observe(terminalSection);
});