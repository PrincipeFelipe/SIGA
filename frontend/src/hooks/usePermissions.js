// ============================================================================
// HOOK DE PERMISOS - usePermissions
// ============================================================================
// Hook personalizado para verificar permisos del usuario autenticado
// ============================================================================

import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para verificar permisos del usuario
 * @returns {Object} Funciones y estado de permisos
 */
export const usePermissions = () => {
    const { user } = useAuth();
    
    /**
     * Verificar si el usuario tiene un permiso específico
     * @param {string} permission - Acción del permiso (ej: 'users:edit')
     * @returns {boolean} true si tiene el permiso
     */
    const hasPermission = (permission) => {
        if (!user || !user.permisos) return false;
        return user.permisos.includes(permission);
    };
    
    /**
     * Verificar si el usuario tiene al menos uno de los permisos
     * @param {Array<string>} permissions - Array de permisos
     * @returns {boolean} true si tiene al menos uno
     */
    const hasAnyPermission = (permissions) => {
        if (!user || !user.permisos) return false;
        return permissions.some(permission => user.permisos.includes(permission));
    };
    
    /**
     * Verificar si el usuario tiene todos los permisos
     * @param {Array<string>} permissions - Array de permisos
     * @returns {boolean} true si tiene todos
     */
    const hasAllPermissions = (permissions) => {
        if (!user || !user.permisos) return false;
        return permissions.every(permission => user.permisos.includes(permission));
    };
    
    /**
     * Obtener todos los permisos del usuario
     * @returns {Array<string>} Array de permisos
     */
    const getPermissions = () => {
        return user?.permisos || [];
    };
    
    /**
     * Permisos específicos para módulos comunes
     */
    const can = {
        // Usuarios
        viewUsers: hasPermission('users:view'),
        viewUserDetail: hasPermission('users:view_detail'),
        createUsers: hasPermission('users:create'),
        editUsers: hasPermission('users:edit'),
        deleteUsers: hasPermission('users:delete'),
        resetPassword: hasPermission('users:reset_password'),
        manageUserRoles: hasPermission('user_roles:assign'),
        
        // Unidades
        viewUnits: hasPermission('units:view'),
        createUnits: hasPermission('units:create'),
        editUnits: hasPermission('units:edit'),
        deleteUnits: hasPermission('units:delete'),
        
        // Roles
        viewRoles: hasPermission('roles:view'),
        createRoles: hasPermission('roles:create'),
        editRoles: hasPermission('roles:edit'),
        deleteRoles: hasPermission('roles:delete'),
        managePermissions: hasPermission('roles:assign_permissions'),
        
        // Logs
        viewLogs: hasPermission('logs:view'),
        deleteLogs: hasPermission('logs:delete'),
        exportLogs: hasPermission('logs:export'),
        
        // Notificaciones
        viewNotifications: hasPermission('notifications:view'),
        createNotifications: hasPermission('notifications:create'),
        
        // Módulos
        accessAdmin: hasPermission('module:admin'),
        accessDashboard: hasPermission('module:dashboard'),
        accessReports: hasPermission('module:reports'),
    };
    
    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getPermissions,
        can,
        permissions: user?.permisos || []
    };
};

export default usePermissions;
