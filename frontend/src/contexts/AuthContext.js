// ============================================================================
// CONTEXT DE AUTENTICACIÓN
// ============================================================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import menuService from '../services/menuService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [menu, setMenu] = useState([]);

    // Verificar autenticación al cargar la aplicación
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const result = await authService.me();
            if (result.success && result.user) {
                setUser(result.user);
                setIsAuthenticated(true);
                
                // Cargar menú dinámico basado en permisos
                const menuResult = await menuService.obtenerMenu();
                if (menuResult.success) {
                    setMenu(menuResult.menu);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setMenu([]);
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            setUser(null);
            setIsAuthenticated(false);
            setMenu([]);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const result = await authService.login(username, password);
            
            if (result.success) {
                // Después del login exitoso, obtener el usuario completo con permisos
                console.log('🔄 Login exitoso, obteniendo datos completos del usuario...');
                const meResult = await authService.me();
                
                if (meResult.success && meResult.user) {
                    console.log('✅ Usuario completo cargado con', meResult.user.permisos?.length || 0, 'permisos');
                    setUser(meResult.user);
                    setIsAuthenticated(true);
                    
                    // Cargar menú después de tener el usuario completo
                    console.log('🔄 Cargando menú...');
                    const menuResult = await menuService.obtenerMenu();
                    if (menuResult.success && menuResult.menu) {
                        console.log('✅ Menú cargado con', menuResult.menu.length, 'items');
                        setMenu(menuResult.menu);
                    } else {
                        console.error('❌ Error cargando menú:', menuResult.error || 'Sin datos');
                        setMenu([]);
                    }
                    
                    return { success: true, user: meResult.user };
                } else {
                    // Si falla obtener el usuario completo, usar los datos básicos
                    console.warn('⚠️  No se pudieron obtener datos completos, usando datos básicos');
                    setUser(result.user);
                    setIsAuthenticated(true);
                    return { success: true, user: result.user };
                }
            }
            
            return {
                success: false,
                message: result.message
            };
        } catch (error) {
            console.error('❌ Error en login:', error);
            return {
                success: false,
                message: 'Error al iniciar sesión'
            };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setMenu([]);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        return await authService.changePassword(currentPassword, newPassword);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        menu,
        login,
        logout,
        changePassword,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;
