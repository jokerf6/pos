import log from "electron-log";
import { getDatabase } from "../../database/connection.js";

/**
 * Get all available permissions
 */
async function getAllPermissions(event) {
  try {
    const db = getDatabase();
    
    const [permissions] = await db.execute(`
      SELECT id, name, display_name, description, category 
      FROM permissions 
      ORDER BY category, display_name
    `);

    return {
      success: true,
      permissions,
    };
  } catch (error) {
    log.error("Get permissions error:", error.message);
    throw error;
  }
}

/**
 * Get permissions by category
 */
async function getPermissionsByCategory(event) {
  try {
    const db = getDatabase();
    
    const [permissions] = await db.execute(`
      SELECT id, name, display_name, description, category 
      FROM permissions 
      ORDER BY category, display_name
    `);

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {});

    return {
      success: true,
      permissions: groupedPermissions,
    };
  } catch (error) {
    log.error("Get permissions by category error:", error.message);
    throw error;
  }
}

/**
 * Get user permissions
 */
async function getUserPermissions(event, { userId }) {
  try {
    const db = getDatabase();
    
    const [permissions] = await db.execute(`
      SELECT p.id, p.name, p.display_name, p.description, p.category,
             up.granted_at, up.granted_by
      FROM permissions p
      INNER JOIN user_permissions up ON p.id = up.permission_id
      WHERE up.user_id = ?
      ORDER BY p.category, p.display_name
    `, [userId]);

    return {
      success: true,
      permissions,
    };
  } catch (error) {
    log.error("Get user permissions error:", error.message);
    throw error;
  }
}

/**
 * Grant permission to user
 */
async function grantPermission(event, { userId, permissionId, grantedBy }) {
  try {
    const db = getDatabase();
    
    // Check if permission already exists
    const [existing] = await db.execute(`
      SELECT id FROM user_permissions 
      WHERE user_id = ? AND permission_id = ?
    `, [userId, permissionId]);

    if (existing.length > 0) {
      return {
        success: false,
        message: "المستخدم لديه هذه الصلاحية بالفعل",
      };
    }

    // Grant permission
    await db.execute(`
      INSERT INTO user_permissions (user_id, permission_id, granted_by)
      VALUES (?, ?, ?)
    `, [userId, permissionId, grantedBy]);

    // Update user permissions timestamp
  

    return {
      success: true,
      message: "تم منح الصلاحية بنجاح",
    };
  } catch (error) {
    log.error("Grant permission error:", error.message);
    throw error;
  }
}

/**
 * Revoke permission from user
 */
async function revokePermission(event, { userId, permissionId }) {
  try {
    const db = getDatabase();
    
    const [result] = await db.execute(`
      DELETE FROM user_permissions 
      WHERE user_id = ? AND permission_id = ?
    `, [userId, permissionId]);

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "الصلاحية غير موجودة للمستخدم",
      };
    }

    // Update user permissions timestamp


    return {
      success: true,
      message: "تم إلغاء الصلاحية بنجاح",
    };
  } catch (error) {
    log.error("Revoke permission error:", error.message);
    throw error;
  }
}

/**
 * Update user permissions (bulk update)
 */
async function updateUserPermissions(event, { userId, permissionIds, grantedBy }) {
  try {
    const db = getDatabase();
    
    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Remove all existing permissions for user
      await db.execute(`
        DELETE FROM user_permissions WHERE user_id = ?
      `, [userId]);

      // Add new permissions
      if (permissionIds && permissionIds.length > 0) {
        const values = permissionIds.map(permissionId => [userId, permissionId, grantedBy]);
        const placeholders = values.map(() => '(?, ?, ?)').join(', ');
        const flatValues = values.flat();

        await db.execute(`
          INSERT INTO user_permissions (user_id, permission_id, granted_by)
          VALUES ${placeholders}
        `, flatValues);
      }

   
      // Commit transaction
      await db.execute('COMMIT');

      return {
        success: true,
        message: "تم تحديث صلاحيات المستخدم بنجاح",
      };
    } catch (error) {
      // Rollback transaction
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    log.error("Update user permissions error:", error.message);
    throw error;
  }
}

/**
 * Check if user has specific permission
 */
async function hasPermission(event, { userId, permissionName }) {
  try {
    const db = getDatabase();
    
    const [result] = await db.execute(`
      SELECT COUNT(*) as count
      FROM user_permissions up
      INNER JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ? AND p.name = ?
    `, [userId, permissionName]);

    return {
      success: true,
      hasPermission: result[0].count > 0,
    };
  } catch (error) {
    log.error("Check permission error:", error.message);
    throw error;
  }
}

/**
 * Get users with specific permission
 */
async function getUsersWithPermission(event, { permissionName }) {
  try {
    const db = getDatabase();
    
    const [users] = await db.execute(`
      SELECT u.id, u.username, up.granted_at, up.granted_by
      FROM users u
      INNER JOIN user_permissions up ON u.id = up.user_id
      INNER JOIN permissions p ON up.permission_id = p.id
      WHERE p.name = ? AND u.active = 1
      ORDER BY u.username
    `, [permissionName]);

    return {
      success: true,
      users,
    };
  } catch (error) {
    log.error("Get users with permission error:", error.message);
    throw error;
  }
}

export {
  getAllPermissions,
  getPermissionsByCategory,
  getUserPermissions,
  grantPermission,
  revokePermission,
  updateUserPermissions,
  hasPermission,
  getUsersWithPermission,
};

