// Type definitions for Electron API exposed through preload script

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: User;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  barcode?: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface ElectronAPI {
  ping: () => Promise<string>;

  auth: {
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    logout: () => Promise<{ success: boolean }>;
    checkAuth: () => Promise<LoginResponse>;
  };

  users: {
    create: (user: any) => Promise<any>;
    getAll: (data?: any) => Promise<any>;
    getById: (id: number) => Promise<any>;
    search: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };

  permissions: {
    getAll: () => Promise<any>;
    getByCategory: () => Promise<any>;
    getUserPermissions: (data: { userId: number }) => Promise<any>;
    updateUserPermissions: (data: { userId: number; permissionIds: number[]; grantedBy: number }) => Promise<any>;
    grant: (data: { userId: number; permissionId: number; grantedBy: number }) => Promise<any>;
    revoke: (data: { userId: number; permissionId: number }) => Promise<any>;
    hasPermission: (data: { userId: number; permissionName: string }) => Promise<any>;
  };


  categories: {
    create: (data: any) => Promise<any>;
    getAll: (data?: any) => Promise<any>;
    getById: (id: number) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    search: (data: any) => Promise<any>;
  };

  products: {
    getAll: (data?: any) => Promise<any>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    search: (data: any) => Promise<any>;
    getByBarcode: (barcode: string) => Promise<any>;
    generateBarCode: (data: any) => Promise<any>;
  };

  invoice: {
    create: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    before: (data: any) => Promise<any>;
    after: (data: any) => Promise<any>;
  };

  daily: {
    get: () => Promise<any>;
    open: (data: number) => Promise<any>;
    close: (data: number) => Promise<any>;
  };

  credit: {
    getAll: (data) => Promise<any>;
    getByDaily: (data) => Promise<any>;
    create: (data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };

  transactions: {
    create: (data: any) => Promise<any>;
    getAll: (data?: any) => Promise<any>;
    getById: (id: number) => Promise<any>;
    getByDateRange: (data: any) => Promise<any>;
    getProductTransactions: (productId: number) => Promise<any>;
  };

  settings: {
    get: () => Promise<any>;
    getByKey: (key: string) => Promise<any>;
    getByDomain: (domain: string) => Promise<any>;
    update: (data: any) => Promise<any>;
  };

  system: {
    getVersion: () => Promise<string>;
    restart: () => Promise<void>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };
}
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
