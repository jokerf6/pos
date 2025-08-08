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

  // Permissions channels
  "permissions:getAll": true,
  "permissions:getByCategory": true,
  "permissions:getUserPermissions": true,
  "permissions:updateUserPermissions": true,
  "permissions:grant": true,
  "permissions:revoke": true,
  "permissions:hasPermission": true,


  // Category channels
  "categories:create": true,
  "categories:getAll": true,
  "categories:getById": true,
  "categories:update": true,
  "categories:delete": true,
  "categories:search": true,

  // Product channels
  "products:getAll": true,
  "products:getById": true,
  "products:create": true,
  "products:update": true,
  "products:delete": true,
  "products:search": true,
  "products:getByBarcode": true,
  "products:generateBarCode": true,

  // Invoice channels
  "invoice:create": true,
  "invoice:before": true,
  "invoice:after": true,
  "invoice:getAll": true,
  "invoice:update": true,

  // Daily channels
  "daily:get": true,
  "daily:open": true,
  "daily:close": true,

  // Credit channels
  "credit:create": true,
  "credit:getAll": true,
  "credit:getByDaily": true,
  "credit:delete": true,

  // Transaction channels
  "transactions:create": true,
  "transactions:getAll": true,
  "transactions:getById": true,
  "transactions:getByDateRange": true,

  // Settings channels
  "settings:getByDomain": true,
  "settings:getByKey": true,
  "settings:getAll": true,
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
  },
  users: {
    create: (user) => safeInvoke("users:create", user),
    getAll: (data) => safeInvoke("users:getAll", data),
    getById: (id) => safeInvoke("users:getById", id),
    search: (data) => safeInvoke("users:search", data),
    update: (data) => safeInvoke("users:update", data),
    delete: (id) => safeInvoke("users:delete", id),
  },
  permissions: {
    getAll: () => safeInvoke("permissions:getAll"),
    getByCategory: () => safeInvoke("permissions:getByCategory"),
    getUserPermissions: (userId) => safeInvoke("permissions:getUserPermissions", userId),
    updateUserPermissions: (data) => safeInvoke("permissions:updateUserPermissions", data),
    grant: (data) => safeInvoke("permissions:grant", data),
    revoke: (data) => safeInvoke("permissions:revoke", data),
    hasPermission: (data) => safeInvoke("permissions:hasPermission", data),
  },
  settings: {
    getAll: () => safeInvoke("settings:getAll"),
    getByDomain: (key) => safeInvoke("settings:getByDomain", key),
    update: (data) => safeInvoke("settings:update", data),
    getByKey: (key) => safeInvoke("settings:getByKey", key),
  },
  categories: {
    create: (data) => safeInvoke("categories:create", data),
    getAll: (data) => safeInvoke("categories:getAll", data),
    getById: (id) => safeInvoke("categories:getById", id),
    search: (data) => safeInvoke("categories:search", data),
    update: (data) => safeInvoke("categories:update", data),
    delete: (id) => safeInvoke("categories:delete", id),
  },
  products: {
    getAll: (data) => safeInvoke("products:getAll",data),
    getById: (id) => safeInvoke("products:getById", id),
    create: (product) => safeInvoke("products:create", product),
    update: (id, product) => safeInvoke("products:update", id, product),
    delete: (id) => safeInvoke("products:delete", id),
    search: (query) => safeInvoke("products:search", query),
    getByBarcode: (data) => safeInvoke("products:getByBarcode", data),
    generateBarCode: () => safeInvoke("products:generateBarCode"),
  },
  invoice: {
    create: (data) => safeInvoke("invoice:create", data),
    after: (data) => safeInvoke("invoice:after", data),
    before: (data) => safeInvoke("invoice:before", data),
    getAll: (data) => safeInvoke("invoice:getAll", data),
    update: (data) => safeInvoke("invoice:update", data),
  },
  credit: {
    getAll: (data) => safeInvoke("credit:getAll",data),
    getByDaily: (data) => safeInvoke("credit:getByDaily",data),
    create: (data) => safeInvoke("credit:create", data),
    delete: (id) => safeInvoke("credit:delete", id),
  },
  daily: {
    get: () => safeInvoke("daily:get"),
    open: (data) => safeInvoke("daily:open", data),
    close: (data) => safeInvoke("daily:close", data),
  },
  transactions: {
    create: (transaction) => safeInvoke("transactions:create", transaction),
    getAll: (options) => safeInvoke("transactions:getAll", options),
    getById: (id) => safeInvoke("transactions:getById", id),
    getByDateRange: (start, end) =>
      safeInvoke("transactions:getByDateRange", start, end),
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
