// ============================================================================
// PÁGINA DASHBOARD - Panel principal
// ============================================================================

import React, { useState, useEffect } from 'react';
import { FiUsers, FiLayers, FiCheckSquare, FiAlertCircle, FiTool } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Badge, Loading } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import dashboardService from '../../services/dashboardService';
import mantenimientosService from '../../services/mantenimientosService';
import { usePermissions } from '../../hooks/usePermissions';

const DashboardPage = () => {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState(null);
    const [mantenimientos, setMantenimientos] = useState(null);
    
    // Cargar estadísticas al montar el componente
    useEffect(() => {
        cargarEstadisticas();
        cargarMantenimientos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.obtenerEstadisticas();
            setEstadisticas(data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const cargarMantenimientos = async () => {
        try {
            if (hasPermission('maintenance:view')) {
                const response = await mantenimientosService.obtenerMantenimientosPendientes({
                    estado: 'vencido'
                });
                const vencidos = response.data || [];
                
                // Obtener próximos
                const responsePro = await mantenimientosService.obtenerMantenimientosPendientes({
                    estado: 'proximo'
                });
                const proximos = responsePro.data || [];
                
                setMantenimientos({
                    vencidos: vencidos.length,
                    proximos: proximos.length,
                    total: vencidos.length + proximos.length
                });
            }
        } catch (error) {
            console.error('Error al cargar mantenimientos:', error);
        }
    };
    
    if (loading) {
        return (
            <Layout>
                <Loading fullScreen />
            </Layout>
        );
    }
    
    return (
        <Layout>
            <div className="space-y-6">
                {/* Bienvenida */}
                <div>
                    <h1 className="text-3xl font-heading font-bold text-text mb-2">
                        ¡Bienvenido, {user?.nombre_completo}!
                    </h1>
                    <p className="text-gray-600">
                        Este es tu panel de control del Sistema de Gestión Administrativa
                    </p>
                </div>
                
                {/* Estadísticas según permisos */}
                <div className="space-y-6">
                    {/* TAREAS PROPIAS - Siempre visible si hay datos */}
                    {estadisticas && estadisticas.tareasPropias && (
                        <div>
                            <h2 className="text-xl font-heading font-bold text-text mb-4">
                                📋 Mis Tareas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <Card padding={false}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 rounded-lg bg-blue-100">
                                                <FiCheckSquare className="text-blue-600" size={24} />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-text mb-1">
                                            {estadisticas.tareasPropias.total}
                                        </h3>
                                        <p className="text-sm text-gray-600">Total</p>
                                    </div>
                                </Card>
                                
                                <Card padding={false}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 rounded-lg bg-yellow-100">
                                                <FiAlertCircle className="text-yellow-600" size={24} />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-text mb-1">
                                            {estadisticas.tareasPropias.pendientes}
                                        </h3>
                                        <p className="text-sm text-gray-600">Pendientes</p>
                                    </div>
                                </Card>
                                
                                <Card padding={false}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 rounded-lg bg-blue-100">
                                                <FiCheckSquare className="text-blue-600" size={24} />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-text mb-1">
                                            {estadisticas.tareasPropias.en_progreso}
                                        </h3>
                                        <p className="text-sm text-gray-600">En Progreso</p>
                                    </div>
                                </Card>
                                
                                <Card padding={false}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 rounded-lg bg-green-100">
                                                <FiCheckSquare className="text-green-600" size={24} />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-text mb-1">
                                            {estadisticas.tareasPropias.completadas}
                                        </h3>
                                        <p className="text-sm text-gray-600">Completadas</p>
                                    </div>
                                </Card>
                                
                                <Card padding={false}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 rounded-lg bg-red-100">
                                                <FiAlertCircle className="text-red-600" size={24} />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-text mb-1">
                                            {estadisticas.tareasPropias.vencidas}
                                        </h3>
                                        <p className="text-sm text-gray-600">Vencidas</p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                    
                    {/* ESTADÍSTICAS JERÁRQUICAS - Solo si tiene permisos */}
                    {(estadisticas?.usuarios || estadisticas?.unidades || estadisticas?.tareas) && (
                        <div>
                            <h2 className="text-xl font-heading font-bold text-text mb-4 flex items-center gap-2">
                                📊 Mi Ámbito de Gestión
                                <Badge variant="info" size="sm">Incluye unidades dependientes</Badge>
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Estadísticas de Usuarios */}
                                {estadisticas?.usuarios && (
                                    <Card title="👥 Usuarios" padding={false}>
                                        <div className="p-6 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total</span>
                                                <span className="text-2xl font-bold text-text">
                                                    {estadisticas.usuarios.total}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Activos</span>
                                                <Badge variant="success">
                                                    {estadisticas.usuarios.activos}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Inactivos</span>
                                                <Badge variant="danger">
                                                    {estadisticas.usuarios.inactivos}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                                
                                {/* Estadísticas de Unidades */}
                                {estadisticas?.unidades && (
                                    <Card title="🏢 Unidades" padding={false}>
                                        <div className="p-6 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total</span>
                                                <span className="text-2xl font-bold text-text">
                                                    {estadisticas.unidades.total}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {estadisticas.unidades.zonas > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Zonas</span>
                                                        <Badge variant="info" size="sm">
                                                            {estadisticas.unidades.zonas}
                                                        </Badge>
                                                    </div>
                                                )}
                                                {estadisticas.unidades.comandancias > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Comandancias</span>
                                                        <Badge variant="info" size="sm">
                                                            {estadisticas.unidades.comandancias}
                                                        </Badge>
                                                    </div>
                                                )}
                                                {estadisticas.unidades.companias > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Compañías</span>
                                                        <Badge variant="info" size="sm">
                                                            {estadisticas.unidades.companias}
                                                        </Badge>
                                                    </div>
                                                )}
                                                {estadisticas.unidades.puestos > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Puestos</span>
                                                        <Badge variant="info" size="sm">
                                                            {estadisticas.unidades.puestos}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                )}
                                
                                {/* Estadísticas de Tareas */}
                                {estadisticas?.tareas && (
                                    <Card title="📋 Tareas del Ámbito" padding={false}>
                                        <div className="p-6 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total</span>
                                                <span className="text-2xl font-bold text-text">
                                                    {estadisticas.tareas.total}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Pendientes</span>
                                                    <Badge variant="warning">
                                                        {estadisticas.tareas.pendientes}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">En Progreso</span>
                                                    <Badge variant="info">
                                                        {estadisticas.tareas.en_progreso}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Completadas</span>
                                                    <Badge variant="success">
                                                        {estadisticas.tareas.completadas}
                                                    </Badge>
                                                </div>
                                                {estadisticas.tareas.vencidas > 0 && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Vencidas</span>
                                                        <Badge variant="danger">
                                                            {estadisticas.tareas.vencidas}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Información del usuario */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Tu Información">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Usuario</p>
                                <p className="font-medium text-text">{user?.username}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Nombre Completo</p>
                                <p className="font-medium text-text">{user?.nombre_completo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium text-text">{user?.email || 'No especificado'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Unidad de Destino</p>
                                <p className="font-medium text-text">
                                    {user?.unidad_destino?.nombre || 'No especificada'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Estado</p>
                                <Badge variant={user?.activo ? 'success' : 'danger'}>
                                    {user?.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                    
                    <Card title="Accesos Rápidos">
                        <div className="space-y-2">
                            <a
                                href="/tareas"
                                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FiCheckSquare className="text-primary" size={20} />
                                    <div>
                                        <p className="font-medium text-text">Gestión de Tareas</p>
                                        <p className="text-sm text-gray-600">Ver y administrar tareas</p>
                                    </div>
                                </div>
                            </a>
                            
                            {estadisticas?.usuarios && (
                                <a
                                    href="/usuarios"
                                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiUsers className="text-primary" size={20} />
                                        <div>
                                            <p className="font-medium text-text">Gestión de Usuarios</p>
                                            <p className="text-sm text-gray-600">Ver y administrar usuarios</p>
                                        </div>
                                    </div>
                                </a>
                            )}
                            
                            {estadisticas?.unidades && (
                                <a
                                    href="/unidades"
                                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiLayers className="text-primary" size={20} />
                                        <div>
                                            <p className="font-medium text-text">Unidades Organizacionales</p>
                                            <p className="text-sm text-gray-600">Ver estructura jerárquica</p>
                                        </div>
                                    </div>
                                </a>
                            )}
                        </div>
                    </Card>
                </div>
                
                {/* Widget de Mantenimientos - Siempre visible si tiene permisos */}
                {mantenimientos && (
                    <div>
                        <h2 className="text-xl font-heading font-bold text-text mb-4">
                            🔧 Mantenimientos de Vehículos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card
                                padding={false}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => navigate('/taller/pendientes?estado=vencido')}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-lg bg-red-100">
                                            <FiAlertCircle className="text-red-600" size={24} />
                                        </div>
                                        {mantenimientos.vencidos > 0 && (
                                            <Badge variant="danger">
                                                ¡Urgente!
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-bold text-red-600 mb-1">
                                        {mantenimientos.vencidos}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Mantenimientos Vencidos
                                    </p>
                                </div>
                            </Card>
                            
                            <Card
                                padding={false}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => navigate('/taller/pendientes?estado=proximo')}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-lg bg-yellow-100">
                                            <FiTool className="text-yellow-600" size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-yellow-600 mb-1">
                                        {mantenimientos.proximos}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Próximos a Vencer
                                    </p>
                                </div>
                            </Card>
                            
                            <Card
                                padding={false}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => navigate('/taller/pendientes')}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-lg bg-blue-100">
                                            <FiCheckSquare className="text-blue-600" size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-blue-600 mb-1">
                                        {mantenimientos.total}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Total Alertas Activas
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DashboardPage;

