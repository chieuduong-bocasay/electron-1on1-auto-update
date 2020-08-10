const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

let win;

const dispatch = (data) => {
  win.webContents.send("message", data);
};

const createDefaultWindow = () => {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });

  win.loadFile("app/index.html");

  return win;
};

app.on("ready", () => {
  createDefaultWindow();

  autoUpdater.checkForUpdatesAndNotify();

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("version", app.getVersion());
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

autoUpdater.on("checking-for-update", () => {
  dispatch("Checking for update...");
});

autoUpdater.on("update-available", (info) => {
  dispatch("A new update is available. Downloading now...");
});

autoUpdater.on("update-not-available", (info) => {
  dispatch("Update not available.");
});

autoUpdater.on("error", (err) => {
  dispatch("Error in auto-updater. " + err);
});

autoUpdater.on("download-progress", (progressObj) => {
  // let log_message = "Download speed: " + progressObj.bytesPerSecond
  // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
  // dispatch(log_message)

  win.webContents.send("download-progress", progressObj.percent);
});

autoUpdater.on("update-downloaded", (info) => {
  dispatch("Update downloaded, application re-start in 3 minutes");
  setTimeout(() => {
    ipcRenderer.send("restart_app");
  }, 3000);
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});
