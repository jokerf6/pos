-- Permissions system for POS application
-- This replaces the role-based system with a more flexible permission-based system

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_permissions junction table
CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    granted_by INT,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_permission (user_id, permission_id)
);

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, category) VALUES
-- Sales permissions
('sales.create', 'إنشاء مبيعات', 'إمكانية إنشاء فواتير مبيعات جديدة', 'sales'),
('sales.view', 'عرض المبيعات', 'إمكانية عرض فواتير المبيعات', 'sales'),
('sales.edit', 'تعديل المبيعات', 'إمكانية تعديل فواتير المبيعات', 'sales'),
('sales.delete', 'حذف المبيعات', 'إمكانية حذف فواتير المبيعات', 'sales'),
('sales.refund', 'استرداد المبيعات', 'إمكانية عمل استرداد للمبيعات', 'sales'),

-- Inventory permissions
('inventory.view', 'عرض المخزون', 'إمكانية عرض المنتجات والمخزون', 'inventory'),
('inventory.create', 'إضافة منتجات', 'إمكانية إضافة منتجات جديدة', 'inventory'),
('inventory.edit', 'تعديل المنتجات', 'إمكانية تعديل بيانات المنتجات', 'inventory'),
('inventory.delete', 'حذف المنتجات', 'إمكانية حذف المنتجات', 'inventory'),
('inventory.adjust', 'تعديل المخزون', 'إمكانية تعديل كميات المخزون', 'inventory'),

-- Reports permissions
('reports.sales', 'تقارير المبيعات', 'إمكانية عرض تقارير المبيعات', 'reports'),
('reports.inventory', 'تقارير المخزون', 'إمكانية عرض تقارير المخزون', 'reports'),
('reports.financial', 'التقارير المالية', 'إمكانية عرض التقارير المالية', 'reports'),
('reports.export', 'تصدير التقارير', 'إمكانية تصدير التقارير', 'reports'),

-- User management permissions
('users.view', 'عرض المستخدمين', 'إمكانية عرض قائمة المستخدمين', 'users'),
('users.create', 'إضافة مستخدمين', 'إمكانية إضافة مستخدمين جدد', 'users'),
('users.edit', 'تعديل المستخدمين', 'إمكانية تعديل بيانات المستخدمين', 'users'),
('users.delete', 'حذف المستخدمين', 'إمكانية حذف المستخدمين', 'users'),
('users.permissions', 'إدارة الصلاحيات', 'إمكانية تعديل صلاحيات المستخدمين', 'users'),

-- System permissions
('system.settings', 'إعدادات النظام', 'إمكانية تعديل إعدادات النظام', 'system'),
('system.backup', 'النسخ الاحتياطي', 'إمكانية عمل نسخ احتياطية', 'system'),
('system.logs', 'عرض السجلات', 'إمكانية عرض سجلات النظام', 'system'),

-- Cash register permissions
('cashier.open', 'فتح الكاشير', 'إمكانية فتح جلسة الكاشير', 'cashier'),
('cashier.close', 'إغلاق الكاشير', 'إمكانية إغلاق جلسة الكاشير', 'cashier'),
('cashier.count', 'عد النقدية', 'إمكانية عد النقدية في الكاشير', 'cashier');

-- Add permissions column to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions_updated_at TIMESTAMP NULL;

-- Remove role column from users table (we'll keep it for backward compatibility but won't use it)
-- ALTER TABLE users DROP COLUMN role;

