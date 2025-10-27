// ============================================================================
// PÁGINA DASHBOARD - Panel principal
// ============================================================================

import React from 'react';
import { FiUsers, FiLayers, FiShield, FiActivity } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { Card, Badge } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();
    
    const stats = [
        {
            title: 'Usuarios',
            value: '248',
            change: '+12%',
            icon: FiUsers,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Unidades',
            value: '30',
            change: '+5%',
            icon: FiLayers,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Roles',
            value: '12',
            change: '0%',
            icon: FiShield,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Actividad Hoy',
            value: '1,234',
            change: '+28%',
            icon: FiActivity,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];
    
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
                
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title} padding={false}>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                            <Icon className={`${stat.color}`} size={24} />
                                        </div>
                                        <Badge 
                                            variant={stat.change.startsWith('+') ? 'success' : 'default'}
                                            size="sm"
                                        >
                                            {stat.change}
                                        </Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold text-text mb-1">
                                        {stat.value}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {stat.title}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
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
                            
                            <a
                                href="/roles"
                                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FiShield className="text-primary" size={20} />
                                    <div>
                                        <p className="font-medium text-text">Roles y Permisos</p>
                                        <p className="text-sm text-gray-600">Administrar control de acceso</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;
