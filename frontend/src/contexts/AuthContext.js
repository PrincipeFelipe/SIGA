// ============================================================================
// CONTEXT DE AUTENTICACIÓN
// ============================================================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const result = await authService.login(username, password);
            
            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            
            return {
                success: false,
                message: result.message
            };
        } catch (error) {
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
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        return await authService.changePassword(currentPassword, newPassword);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
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
