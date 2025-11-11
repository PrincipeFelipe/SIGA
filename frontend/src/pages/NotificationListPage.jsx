// ============================================================================
// PÁGINA: NOTIFICATION LIST
// Vista completa de notificaciones con paginación y filtros
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { FaBell, FaCheckDouble, FaFilter } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import NotificationItem from '../components/Notifications/NotificationItem';
import notificacionesService from '../services/notificacionesService';

const NotificationListPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread'
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [stats, setStats] = useState({ no_leidas: 0 });

    /**
     * Obtener listado de notificaciones
     */
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit
            };

            if (filter === 'unread') {
                params.leida = false;
            }

            const result = await notificacionesService.listar(params);
            
            if (result.success) {
                setNotifications(result.data);
                setPagination(result.pagination);
                setStats(result.stats || { no_leidas: 0 });
            }
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, pagination.page, pagination.limit]);

    // Cargar notificaciones al montar y cuando cambien filtros/página
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    /**
     * Marcar todas las notificaciones como leídas
     */
    const handleMarkAllAsRead = async () => {
        try {
            const result = await notificacionesService.marcarTodasComoLeidas();
            if (result.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };

    /**
     * Cambiar filtro
     */
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    /**
     * Eliminar notificación
     */
    const handleDelete = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setStats(prev => ({ ...prev, no_leidas: Math.max(0, prev.no_leidas - 1) }));
    };

    /**
     * Cambiar de página
     */
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Mostrar loading mientras carga
    if (loading && notifications.length === 0) {
        return (
            <Layout>
                <Loading fullScreen />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Notificaciones
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Gestiona tus notificaciones y alertas del sistema
                        </p>
                    </div>

                    {/* Botón marcar todas como leídas */}
                    {stats.no_leidas > 0 && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            variant="secondary"
                            icon={<FaCheckDouble />}
                        >
                            Marcar todas como leídas ({stats.no_leidas})
                        </Button>
                    )}
                </div>

            {/* Filtros */}
            <Card>
                <div className="flex items-center space-x-4">
                    <FaFilter className="text-gray-400" />
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                filter === 'all'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Todas
                            <span className="ml-2 text-sm opacity-75">
                                ({pagination.total})
                            </span>
                        </button>
                        <button
                            onClick={() => handleFilterChange('unread')}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                filter === 'unread'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            No leídas
                            <span className="ml-2 text-sm opacity-75">
                                ({stats.no_leidas})
                            </span>
                        </button>
                    </div>
                </div>
            </Card>

            {/* Lista de notificaciones */}
            {loading ? (
                <Loading />
            ) : notifications.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {filter === 'unread' 
                                ? 'No tienes notificaciones sin leer' 
                                : 'No tienes notificaciones'}
                        </h3>
                        <p className="text-gray-500">
                            {filter === 'unread'
                                ? 'Todas tus notificaciones han sido leídas'
                                : 'Las notificaciones aparecerán aquí'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onUpdate={fetchNotifications}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

                {/* Paginación */}
                {pagination.pages > 1 && (
                    <Card>
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Página {pagination.page} de {pagination.pages}
                                <span className="ml-2 text-gray-400">
                                    ({pagination.total} notificaciones en total)
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    variant="secondary"
                                    size="sm"
                                >
                                    ← Anterior
                                </Button>
                                <Button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    variant="secondary"
                                    size="sm"
                                >
                                    Siguiente →
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default NotificationListPage;
