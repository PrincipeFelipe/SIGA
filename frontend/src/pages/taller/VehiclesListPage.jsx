import React, { useState, useEffect, useCallback } from 'react';
import { obtenerVehiculos, eliminarVehiculo } from '../../services/vehiculosService';
import unidadesService from '../../services/unidadesService';
import { usePermissions } from '../../hooks/usePermissions';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import VehicleFormModal from './VehicleFormModal';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiFilter } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const VehiclesListPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    
    // Filtros
    const [filters, setFilters] = useState({
        search: '',
        unidad_id: '',
        tipo_vehiculo: '',
        estado: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const { hasPermission } = usePermissions();
    const canCreate = hasPermission('vehicles:create');
    const canEdit = hasPermission('vehicles:edit');
    const canDelete = hasPermission('vehicles:delete');
    const canView = hasPermission('vehicles:view');

    const loadVehicles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await obtenerVehiculos({
                ...filters,
                page: pagination.page,
                limit: 20
            });
            setVehicles(response.data);
            setPagination({
                page: response.page,
                totalPages: response.totalPages,
                total: response.total
            });
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page]);

    const loadUnits = useCallback(async () => {
        try {
            const response = await unidadesService.getTree();
            setUnits(response);
        } catch (error) {
            console.error('Error al cargar unidades:', error);
        }
    }, []);

    useEffect(() => {
        loadVehicles();
        loadUnits();
    }, [loadVehicles, loadUnits]);

    const handleCreate = () => {
        setSelectedVehicle(null);
        setIsReadOnly(false);
        setModalOpen(true);
    };

    const handleEdit = (vehicle) => {
        if (!canEdit) return;
        setSelectedVehicle(vehicle);
        setIsReadOnly(false);
        setModalOpen(true);
    };

    const handleView = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsReadOnly(true);
        setModalOpen(true);
    };

    const handleDelete = async (vehicle) => {
        if (!canDelete) return;
        
        const result = await Swal.fire({
            title: '¿Eliminar vehículo?',
            html: `¿Estás seguro de que deseas eliminar el vehículo <strong>${vehicle.matricula}</strong>?<br/><small class="text-gray-500">${vehicle.marca} ${vehicle.modelo}</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C8102E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            try {
                await eliminarVehiculo(vehicle.id);
                toast.success('Vehículo eliminado correctamente');
                loadVehicles();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al eliminar vehículo');
            }
        }
    };

    const handleModalClose = (shouldReload) => {
        setModalOpen(false);
        setSelectedVehicle(null);
        if (shouldReload) {
            loadVehicles();
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ search: '', unidad_id: '', tipo_vehiculo: '', estado: '' });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getTipoVehiculoBadge = (tipo) => {
        const tipos = {
            turismo: { variant: 'info', label: 'Turismo' },
            furgon: { variant: 'primary', label: 'Furgón' },
            camion: { variant: 'warning', label: 'Camión' },
            motocicleta: { variant: 'accent', label: 'Motocicleta' },
            otro: { variant: 'neutral', label: 'Otro' }
        };
        const config = tipos[tipo] || tipos.otro;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getEstadoBadge = (estado) => {
        const estados = {
            activo: { variant: 'success', label: 'Activo' },
            mantenimiento: { variant: 'warning', label: 'Mantenimiento' },
            inactivo: { variant: 'error', label: 'Inactivo' }
        };
        const config = estados[estado] || estados.activo;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (!canView) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card>
                    <p className="text-text">No tienes permisos para ver los vehículos</p>
                </Card>
            </div>
        );
    }

    return (
        <Layout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-text">Vehículos</h1>
                        <p className="text-gray-600 mt-1">Gestión del parque móvil</p>
                    </div>
                    {canCreate && (
                        <Button variant="primary" onClick={handleCreate}>
                            <FiPlus className="mr-2" />
                            Nuevo Vehículo
                        </Button>
                    )}
                </div>

            {/* Filtros */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por matrícula, marca o modelo..."
                            className="input-field pl-10 w-full"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <Button
                        variant={showFilters ? 'primary' : 'secondary'}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter className="mr-2" />
                        Filtros
                    </Button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unidad
                            </label>
                            <select
                                className="input-field"
                                value={filters.unidad_id}
                                onChange={(e) => handleFilterChange('unidad_id', e.target.value)}
                            >
                                <option value="">Todas las unidades</option>
                                {units.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.codigo_unidad} - {unit.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Vehículo
                            </label>
                            <select
                                className="input-field"
                                value={filters.tipo_vehiculo}
                                onChange={(e) => handleFilterChange('tipo_vehiculo', e.target.value)}
                            >
                                <option value="">Todos los tipos</option>
                                <option value="turismo">Turismo</option>
                                <option value="furgon">Furgón</option>
                                <option value="camion">Camión</option>
                                <option value="motocicleta">Motocicleta</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <select
                                className="input-field"
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="activo">Activo</option>
                                <option value="mantenimiento">Mantenimiento</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>

                        <div className="md:col-span-3 flex justify-end">
                            <Button variant="secondary" onClick={clearFilters}>
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Tabla */}
            <Card>
                {loading ? (
                    <Loading />
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No se encontraron vehículos</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Matrícula
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vehículo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono font-semibold text-primary">
                                                    {vehicle.matricula}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {vehicle.marca} {vehicle.modelo}
                                                    </div>
                                                    {vehicle.ano_fabricacion && (
                                                        <div className="text-sm text-gray-500">
                                                            Año {vehicle.ano_fabricacion}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getTipoVehiculoBadge(vehicle.tipo_vehiculo)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {vehicle.unidad_nombre}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {vehicle.codigo_unidad}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getEstadoBadge(vehicle.estado)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleView(vehicle)}
                                                    >
                                                        <FiEye />
                                                    </Button>
                                                    {canEdit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(vehicle)}
                                                        >
                                                            <FiEdit2 />
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(vehicle)}
                                                        >
                                                            <FiTrash2 />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-gray-700">
                                    Mostrando {vehicles.length} de {pagination.total} vehículos
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Anterior
                                    </Button>
                                    <div className="flex items-center px-4">
                                        Página {pagination.page} de {pagination.totalPages}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Modal */}
            {modalOpen && (
                <VehicleFormModal
                    vehicle={selectedVehicle}
                    isReadOnly={isReadOnly}
                    onClose={handleModalClose}
                />
            )}
            </div>
        </Layout>
    );
};

export default VehiclesListPage;
