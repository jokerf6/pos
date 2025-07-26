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

  transactions: {
    create: (data: any) => Promise<any>;
    getAll: (data?: any) => Promise<any>;
    getById: (id: number) => Promise<any>;
    getByDateRange: (data: any) => Promise<any>;
  };

  settings: {
    get: () => Promise<any>;
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
