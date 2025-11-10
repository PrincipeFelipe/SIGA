// ============================================================================
// COMPONENTE: NOTIFICATION BELL
// Campana de notificaciones con badge de contador y dropdown
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import notificacionesService from '../../services/notificacionesService';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Polling: Actualizar contador cada 30 segundos
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Click outside: Cerrar dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    /**
     * Obtener contador de notificaciones no leídas
     */
    const fetchUnreadCount = async () => {
        try {
            const result = await notificacionesService.contarNoLeidas();
            if (result.success) {
                setUnreadCount(result.data);
            }
        } catch (error) {
            console.error('Error al obtener contador:', error);
        }
    };

    /**
     * Obtener últimas notificaciones no leídas
     */
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const result = await notificacionesService.listar({ 
                leida: false, 
                limit: 5 
            });
            if (result.success) {
                setNotifications(result.data);
            }
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Toggle del dropdown
     */
    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    /**
     * Marcar notificación como leída y navegar
     */
    const handleNotificationClick = async (notification) => {
        try {
            // Marcar como leída
            await notificacionesService.marcarComoLeida(notification.id);
            
            // Actualizar contador
            fetchUnreadCount();
            
            // Cerrar dropdown
            setIsOpen(false);
            
            // Navegar a la URL de la notificación
            if (notification.url) {
                navigate(notification.url);
            }
        } catch (error) {
            console.error('Error al procesar notificación:', error);
        }
    };

    /**
     * Ver todas las notificaciones
     */
    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notificaciones');
    };

    /**
     * Obtener icono según tipo de notificación
     */
    const getIconByType = (tipo) => {
        switch (tipo) {
            case 'error':
                return '🔴';
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    /**
     * Formatear fecha relativa (hace X tiempo)
     */
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de campana */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors duration-200"
                aria-label="Notificaciones"
            >
                <FaBell className="text-xl" />
                
                {/* Badge de contador */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown de notificaciones */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">
                                Notificaciones
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-sm text-accent">
                                        ({unreadCount} nuevas)
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={handleViewAll}
                                className="text-sm text-primary hover:text-primary/80 font-medium"
                            >
                                Ver todas
                            </button>
                        </div>
                    </div>

                    {/* Lista de notificaciones */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FaBell className="text-4xl mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">No tienes notificaciones nuevas</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                    >
                                        <div className="flex items-start space-x-3">
                                            {/* Icono según tipo */}
                                            <span className="text-2xl flex-shrink-0 mt-1">
                                                {getIconByType(notification.tipo)}
                                            </span>

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {notification.titulo}
                                                </p>
                                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                    {notification.mensaje}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {getRelativeTime(notification.created_at)}
                                                </p>
                                            </div>

                                            {/* Indicador de no leída */}
                                            {!notification.leida && (
                                                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <button
                                onClick={handleViewAll}
                                className="w-full text-sm text-primary hover:text-primary/80 font-medium text-center"
                            >
                                Ver todas las notificaciones →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
