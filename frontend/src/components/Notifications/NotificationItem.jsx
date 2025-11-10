// ============================================================================
// COMPONENTE: NOTIFICATION ITEM
// Item individual de notificación con acciones
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import notificacionesService from '../../services/notificacionesService';

const NotificationItem = ({ notification, onUpdate, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * Obtener icono según tipo de notificación
     */
    const getIconConfig = (tipo) => {
        switch (tipo) {
            case 'error':
                return { icon: '🔴', color: 'bg-red-100 border-red-300', textColor: 'text-red-800' };
            case 'warning':
                return { icon: '⚠️', color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-800' };
            case 'success':
                return { icon: '✅', color: 'bg-green-100 border-green-300', textColor: 'text-green-800' };
            case 'info':
            default:
                return { icon: 'ℹ️', color: 'bg-blue-100 border-blue-300', textColor: 'text-blue-800' };
        }
    };

    /**
     * Formatear fecha
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Marcar notificación como leída
     */
    const handleMarkAsRead = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const result = await notificacionesService.marcarComoLeida(notification.id);
            if (result.success && onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Eliminar notificación
     */
    const handleDelete = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const result = await notificacionesService.eliminar(notification.id);
            if (result.success && onDelete) {
                onDelete(notification.id);
            }
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Navegar a la URL de la notificación
     */
    const handleNavigate = () => {
        if (notification.url) {
            // Si no está leída, marcarla como leída automáticamente
            if (!notification.leida) {
                notificacionesService.marcarComoLeida(notification.id);
                if (onUpdate) onUpdate();
            }
            navigate(notification.url);
        }
    };

    const iconConfig = getIconConfig(notification.tipo);

    return (
        <div
            onClick={handleNavigate}
            className={`
                border rounded-lg p-4 transition-all duration-200
                ${!notification.leida ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                ${notification.url ? 'cursor-pointer hover:shadow-md' : ''}
            `}
        >
            <div className="flex items-start space-x-3">
                {/* Icono */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${iconConfig.color}`}>
                    <span className="text-xl">{iconConfig.icon}</span>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    {/* Título */}
                    <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-semibold ${!notification.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.titulo}
                            {!notification.leida && (
                                <span className="ml-2 inline-block w-2 h-2 bg-accent rounded-full"></span>
                            )}
                        </h4>
                    </div>

                    {/* Mensaje */}
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                        {notification.mensaje}
                    </p>

                    {/* Footer: Fecha y acciones */}
                    <div className="flex items-center justify-between mt-3">
                        {/* Fecha */}
                        <span className="text-xs text-gray-400">
                            {formatDate(notification.created_at)}
                        </span>

                        {/* Acciones */}
                        <div className="flex items-center space-x-2">
                            {/* Marcar como leída */}
                            {!notification.leida && (
                                <button
                                    onClick={handleMarkAsRead}
                                    disabled={loading}
                                    className="text-primary hover:text-primary/80 p-1 rounded transition-colors duration-200"
                                    title="Marcar como leída"
                                >
                                    <FaCheck className="text-sm" />
                                </button>
                            )}

                            {/* Ver tarea */}
                            {notification.url && (
                                <button
                                    onClick={handleNavigate}
                                    className="text-gray-500 hover:text-primary p-1 rounded transition-colors duration-200"
                                    title="Ver detalle"
                                >
                                    <FaExternalLinkAlt className="text-sm" />
                                </button>
                            )}

                            {/* Eliminar */}
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="text-gray-400 hover:text-accent p-1 rounded transition-colors duration-200"
                                title="Eliminar notificación"
                            >
                                <FaTrash className="text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
