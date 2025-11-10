// ============================================================================
// COMPONENTE HEADER - Cabecera de la aplicación
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiUser, FiLogOut, FiKey } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../common/Badge';
import NotificationBell from '../Notifications/NotificationBell';

const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);
    
    // Cerrar menús al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    
    return (
        <header className="sticky top-0 z-30 h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
            {/* Botón menú (móvil) */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <FiMenu size={24} className="text-text" />
            </button>
            
            {/* Título de la página */}
            <div className="flex-1 lg:ml-0 ml-4">
                <h2 className="text-xl font-heading font-semibold text-text">
                    Sistema de Gestión Administrativa
                </h2>
            </div>
            
            {/* Acciones del usuario */}
            <div className="flex items-center gap-4">
                {/* Notificaciones */}
                <NotificationBell />
                
                {/* Menú de usuario */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-semibold text-white">
                            {user?.nombre_completo?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-text">
                                {user?.nombre_completo || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {user?.username || ''}
                            </p>
                        </div>
                    </button>
                    
                    {/* Dropdown del usuario */}
                    {showUserMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 animate-slideIn">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="text-sm font-medium text-text truncate">
                                        {user?.nombre_completo}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user?.email || user?.username}
                                    </p>
                                    <Badge 
                                        variant={user?.activo ? 'success' : 'danger'}
                                        size="sm"
                                        className="mt-2"
                                    >
                                        {user?.activo ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>
                                
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate('/perfil');
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-text hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                    >
                                        <FiUser size={16} />
                                        Mi Perfil
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate('/cambiar-password');
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-text hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                    >
                                        <FiKey size={16} />
                                        Cambiar Contraseña
                                    </button>
                                </div>
                                
                                <div className="border-t border-gray-200 py-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                    >
                                        <FiLogOut size={16} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
