const { contextBridge, ipcRenderer } = require("electron");
const log = require("electron-log");

// Security: Validate channel names to prevent injection
const validChannels = {
  // Authentication channels
  "auth:login": true,
  "auth:logout": true,
  "auth:check": true,
  "auth:register": true,

  // User channels
  "users:create": true,
  "users:getAll": true,
  "users:getById": true,
  "users:update": true,
  "users:delete": true,
  "users:search": true,

  // Product channels
  "products:getAll": true,
  "products:getById": true,
  "products:create": true,
  "products:update": true,
  "products:delete": true,
  "products:search": true,

  // Transaction channels
  "transactions:create": true,
  "transactions:getAll": true,
  "transactions:getById": true,
  "transactions:getByDateRange": true,

  // Settings channels
  "settings:get": true,
  "settings:update": true,

  // System channels
  "system:getVersion": true,
  "system:restart": true,
  "system:minimize": true,
  "system:maximize": true,
  "system:close": true,
};

const safeInvoke = async (channel, ...args) => {
  if (!validChannels[channel]) {
    log.error("Invalid IPC channel:", channel);
    throw new Error(`Invalid channel: ${channel}`);
  }

  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    log.error("IPC invoke error:", { channel, error: error.message });
    throw error;
  }
};

const safeSend = (channel, ...args) => {
  if (!validChannels[channel]) {
    log.error("Invalid IPC channel:", channel);
    throw new Error(`Invalid channel: ${channel}`);
  }

  try {
    ipcRenderer.send(channel, ...args);
  } catch (error) {
    log.error("IPC send error:", { channel, error: error.message });
    throw error;
  }
};

contextBridge.exposeInMainWorld("electronAPI", {
  auth: {
    login: (credentials) => safeInvoke("auth:login", credentials),
    logout: () => safeInvoke("auth:logout"),
    checkAuth: () => safeInvoke("auth:check"),
    register: (userData) => safeInvoke("auth:register", userData),
  },
  users: {
    create: (user) => safeInvoke("users:create", user),
  },
  products: {
    getAll: () => safeInvoke("products:getAll"),
    getById: (id) => safeInvoke("products:getById", id),
    create: (product) => safeInvoke("products:create", product),
    update: (id, product) => safeInvoke("products:update", id, product),
    delete: (id) => safeInvoke("products:delete", id),
    search: (query) => safeInvoke("products:search", query),
  },
  transactions: {
    create: (transaction) => safeInvoke("transactions:create", transaction),
    getAll: (options) => safeInvoke("transactions:getAll", options),
    getById: (id) => safeInvoke("transactions:getById", id),
    getByDateRange: (start, end) =>
      safeInvoke("transactions:getByDateRange", start, end),
  },
  settings: {
    get: (key) => safeInvoke("settings:get", key),
    update: (settings) => safeInvoke("settings:update", settings),
  },
  system: {
    getVersion: () => safeInvoke("system:getVersion"),
    restart: () => safeInvoke("system:restart"),
    minimize: () => safeInvoke("system:minimize"),
    maximize: () => safeInvoke("system:maximize"),
    close: () => safeInvoke("system:close"),
  },
  on: (channel, callback) => {
    if (!validChannels[channel]) {
      log.error("Invalid IPC channel for listener:", channel);
      return;
    }
    ipcRenderer.on(channel, callback);
  },
  removeListener: (channel, callback) => {
    if (!validChannels[channel]) {
      log.error("Invalid IPC channel for removeListener:", channel);
      return;
    }
    ipcRenderer.removeListener(channel, callback);
  },
  removeAllListeners: (channel) => {
    if (!validChannels[channel]) {
      log.error("Invalid IPC channel for removeAllListeners:", channel);
      return;
    }
    ipcRenderer.removeAllListeners(channel);
  },
});

contextBridge.exposeInMainWorld("electronEnv", {
  platform: process.platform,
  arch: process.arch,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});

log.info("Preload script loaded successfully");

// OPTIONAL: remove node globals
delete global.require;
delete global.exports;
delete global.module;
delete global.__dirname;
delete global.__filename;
delete global.process;
delete global.Buffer;

log.info("Node.js globals removed for security");
