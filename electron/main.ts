import { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage, shell } from 'electron'
import path from 'path'
import https from 'https'

let mainWindow: BrowserWindow | null = null
let floatingWindow: BrowserWindow | null = null
let tray: Tray | null = null
let currentFloatingShortcut = 'Alt+X' // Default shortcut

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const isDev = !!VITE_DEV_SERVER_URL

// Lightweight logger for the Electron main process
const log = {
  log: (...args: any[]) => isDev && console.log('[Main]', ...args),
  error: (...args: any[]) => console.error('[Main]', ...args),
}

// GitHub release source
const GITHUB_REPO = 'Freakz3z/Muse'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`

/**
 * Fetch the latest version metadata from GitHub Releases.
 */
function fetchLatestRelease(): Promise<{ version: string; downloadUrl: string; notes: string } | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      headers: {
        'User-Agent': 'Muse-App',
      },
    }

    https.get(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            log.error('Failed to fetch release metadata. HTTP status:', res.statusCode)
            resolve(null)
            return
          }

          const release = JSON.parse(data)
          if (!release?.tag_name || !release?.html_url) {
            log.error('Unexpected release payload:', release)
            resolve(null)
            return
          }

          const version = release.tag_name.replace(/^v/, '')
          const downloadUrl = release.html_url
          const notes = release.body || ''

          log.log('Latest version found:', version)
          resolve({ version, downloadUrl, notes })
        } catch (error) {
          log.error('Failed to parse release metadata:', error)
          resolve(null)
        }
      })
    }).on('error', (error) => {
      log.error('Failed to fetch release metadata:', error)
      resolve(null)
    })
  })
}

/**
 * Compare semantic version segments.
 * Returns true when the latest version is newer than the current version.
 */
function isNewerVersion(currentVersion: string, latestVersion: string): boolean {
  const current = currentVersion.split('.').map(Number)
  const latest = latestVersion.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    const c = current[i] || 0
    const l = latest[i] || 0
    if (l > c) return true
    if (l < c) return false
  }
  return false
}

/**
 * Check for an available application update.
 */
async function checkForUpdate(): Promise<{
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  downloadUrl?: string
  notes?: string
}> {
  const currentVersion = app.getVersion()
  log.log('Current version:', currentVersion)

  const release = await fetchLatestRelease()

  if (!release) {
    return { hasUpdate: false, currentVersion }
  }

  const hasUpdate = isNewerVersion(currentVersion, release.version)

  return {
    hasUpdate,
    currentVersion,
    latestVersion: release.version,
    downloadUrl: release.downloadUrl,
    notes: release.notes,
  }
}

// Resolve the icon path for development and packaged builds.
function getIconPath() {
  const iconFile = process.platform === 'linux' ? 'Muse.png' : 'Muse.ico'

  if (app.isPackaged) {
    return path.join(process.resourcesPath, iconFile)
  } else {
    return path.join(__dirname, `../public/${iconFile}`)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    icon: getIconPath(),
    show: false,
  })

  // Set CSP headers based on the current environment.
  const isDev = !!VITE_DEV_SERVER_URL
  mainWindow.webContents.session.webRequest.onHeadersReceived((details: any, callback: any) => {
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
      : "script-src 'self' 'unsafe-inline';"

    const connectSrc = isDev
      ? "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* https://api.openai.com https://dashscope.aliyuncs.com https://*.openai.com https://*.aliyuncs.com;"
      : "connect-src 'self' https://api.openai.com https://dashscope.aliyuncs.com https://*.openai.com https://*.aliyuncs.com;"

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          scriptSrc,
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: blob:;",
          "font-src 'self' data:;",
          connectSrc,
          "media-src 'self' blob:;",
          "object-src 'none';",
          "base-uri 'self';",
          "form-action 'self';",
          "frame-ancestors 'none';",
          "block-all-mixed-content;",
        ].join(' ')
      }
    })
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })
}

function createTray() {
  const iconPath = getIconPath()
  const icon = nativeImage.createFromPath(iconPath)

  if (icon.isEmpty()) {
    console.error('Failed to load tray icon from:', iconPath)
    return
  }

  const trayIcon = process.platform === 'linux' ? icon : icon.resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open main window',
      click: () => mainWindow?.show()
    },
    {
      label: 'Toggle floating lookup',
      click: () => toggleFloatingWindow()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        mainWindow?.destroy()
        app.quit()
      }
    }
  ])

  tray.setToolTip('Muse')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow?.show()
  })
}

function createFloatingWindow() {
  if (floatingWindow) {
    floatingWindow.show()
    floatingWindow.focus()
    return
  }

  floatingWindow = new BrowserWindow({
    width: 450,
    height: 650,
    minWidth: 350,
    minHeight: 400,
    maxWidth: 800,
    maxHeight: 900,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    icon: getIconPath(),
    show: false,
  })

  // Set CSP headers for the floating window.
  const isDev = !!VITE_DEV_SERVER_URL
  floatingWindow.webContents.session.webRequest.onHeadersReceived((details: any, callback: any) => {
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
      : "script-src 'self' 'unsafe-inline';"

    const connectSrc = isDev
      ? "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* https://api.openai.com https://dashscope.aliyuncs.com https://*.openai.com https://*.aliyuncs.com;"
      : "connect-src 'self' https://api.openai.com https://dashscope.aliyuncs.com https://*.openai.com https://*.aliyuncs.com;"

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          scriptSrc,
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: blob:;",
          "font-src 'self' data:;",
          connectSrc,
          "media-src 'self' blob:;",
          "object-src 'none';",
        ].join(' ')
      }
    })
  })

  if (VITE_DEV_SERVER_URL) {
    floatingWindow.loadURL(`${VITE_DEV_SERVER_URL}#/floating`)
    // floatingWindow.webContents.openDevTools()
  } else {
    floatingWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'floating'
    })
  }

  floatingWindow.once('ready-to-show', () => {
    floatingWindow?.show()
  })

  floatingWindow.on('close', (event) => {
    event.preventDefault()
    floatingWindow?.hide()
  })
}

function toggleFloatingWindow() {
  if (floatingWindow?.isVisible()) {
    floatingWindow.hide()
  } else {
    if (!floatingWindow) {
      createFloatingWindow()
    } else {
      floatingWindow.show()
      floatingWindow.focus()
    }
  }
}

// Register the global shortcut for the floating window.
function registerFloatingShortcut(shortcut: string) {
  if (currentFloatingShortcut) {
    globalShortcut.unregister(currentFloatingShortcut)
  }

  const success = globalShortcut.register(shortcut, () => {
    toggleFloatingWindow()
  })

  if (success) {
    currentFloatingShortcut = shortcut
    log.log(`Floating shortcut registered: ${shortcut}`)
  } else {
    log.error(`Failed to register floating shortcut: ${shortcut}`)
    globalShortcut.register('Alt+X', () => toggleFloatingWindow())
    currentFloatingShortcut = 'Alt+X'
  }

  return success
}

// Read the current floating shortcut.
function getCurrentFloatingShortcut() {
  return currentFloatingShortcut
}

// Prevent multiple instances of the application.
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()
    createTray()

    // Ctrl+Shift+M toggles the main window.
    globalShortcut.register('CommandOrControl+Shift+M', () => {
      if (mainWindow?.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow?.show()
      }
    })

    // Register the default floating shortcut.
    registerFloatingShortcut('Alt+X')

    // Run a non-blocking update check shortly after launch.
    setTimeout(async () => {
      const updateInfo = await checkForUpdate()
      if (updateInfo.hasUpdate && mainWindow) {
        mainWindow.webContents.send('update-available', updateInfo)
        log.log('Update available:', updateInfo.latestVersion)
      }
    }, 3000)
  })
}

// IPC handlers
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.hide())

ipcMain.handle('get-window-state', () => ({
  isMaximized: mainWindow?.isMaximized() ?? false,
}))

// Floating window IPC
ipcMain.on('floating-window-toggle', () => toggleFloatingWindow())
ipcMain.on('floating-window-show', () => {
  if (!floatingWindow) {
    createFloatingWindow()
  } else {
    floatingWindow.show()
    floatingWindow.focus()
  }
})
ipcMain.on('floating-window-hide', () => floatingWindow?.hide())

// Notify the main window when data changes in the floating window.
ipcMain.on('floating-window-data-updated', () => {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('data-updated')
  }
})

// Open external links in the default browser.
ipcMain.on('open-external', (_, url: string) => {
  shell.openExternal(url)
})

// Update the floating window shortcut.
ipcMain.on('update-floating-shortcut', (_, shortcut: string) => {
  registerFloatingShortcut(shortcut)
})

// Get the current floating window shortcut.
ipcMain.handle('get-floating-shortcut', () => {
  return getCurrentFloatingShortcut()
})

// Trigger an update check from the renderer.
ipcMain.handle('check-for-update', async () => {
  const updateInfo = await checkForUpdate()
  return updateInfo
})

// Open the download page in the external browser.
ipcMain.on('open-download-page', (_, url: string) => {
  shell.openExternal(url)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
