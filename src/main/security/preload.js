import { contextBridge, ipcRenderer } from "electron";
import log from "electron-log";

// Security: Validate channel names to prevent injection
const validChannels = {
  // Authentication channels
  "auth:login": true,
  "auth:logout": true,
  "auth:check": true,
  "auth:register": true,

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

// Helper function to validate and invoke IPC
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

// Helper function for one-way communication
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

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Authentication API
  auth: {
    login: (credentials) => safeInvoke("auth:login", credentials),
    logout: () => safeInvoke("auth:logout"),
    checkAuth: () => safeInvoke("auth:check"),
    register: (userData) => safeInvoke("auth:register", userData),
  },

  // Products API
  products: {
    getAll: () => safeInvoke("products:getAll"),
    getById: (id) => safeInvoke("products:getById", id),
    create: (product) => safeInvoke("products:create", product),
    update: (id, product) => safeInvoke("products:update", id, product),
    delete: (id) => safeInvoke("products:delete", id),
    search: (query) => safeInvoke("products:search", query),
  },

  // Transactions API
  transactions: {
    create: (transaction) => safeInvoke("transactions:create", transaction),
    getAll: (options) => safeInvoke("transactions:getAll", options),
    getById: (id) => safeInvoke("transactions:getById", id),
    getByDateRange: (startDate, endDate) =>
      safeInvoke("transactions:getByDateRange", startDate, endDate),
  },

  // Settings API
  settings: {
    get: (key) => safeInvoke("settings:get", key),
    update: (settings) => safeInvoke("settings:update", settings),
  },

  // System API
  system: {
    getVersion: () => safeInvoke("system:getVersion"),
    restart: () => safeInvoke("system:restart"),
    minimize: () => safeInvoke("system:minimize"),
    maximize: () => safeInvoke("system:maximize"),
    close: () => safeInvoke("system:close"),
  },

  // Event listeners for renderer process
  on: (channel, callback) => {
    if (!validChannels[channel]) {
      log.error("Invalid IPC channel for listener:", channel);
      return;
    }

    ipcRenderer.on(channel, callback);
  },

  // Remove event listeners
  removeListener: (channel, callback) => {
    if (!validChannels[channel]) {
      log.error("Invalid IPC channel for removeListener:", channel);
      return;
    }

    ipcRenderer.removeListener(channel, callback);
  },

  // Remove all listeners for a channel
  removeAllListeners: (channel) => {
    if (!validChannels[channel]) {
      log.error("Invalid IPC channel for removeAllListeners:", channel);
      return;
    }

    ipcRenderer.removeAllListeners(channel);
  },
});

// Expose environment information
contextBridge.exposeInMainWorld("electronEnv", {
  platform: process.platform,
  arch: process.arch,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});

// Log successful preload
log.info("Preload script loaded successfully");

// Security: Remove access to Node.js globals
delete global.require;
delete global.exports;
delete global.module;
delete global.__dirname;
delete global.__filename;
delete global.process;
delete global.Buffer;

log.info("Node.js globals removed for security");
