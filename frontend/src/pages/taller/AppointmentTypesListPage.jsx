import React, { useState, useEffect, useCallback } from 'react';
import { obtenerTiposCita, eliminarTipoCita } from '../../services/tiposCitaService';
import { usePermissions } from '../../hooks/usePermissions';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import AppointmentTypeFormModal from './AppointmentTypeFormModal';
import { FiPlus, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const AppointmentTypesListPage = () => {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [showInactive, setShowInactive] = useState(false);

    const { hasPermission } = usePermissions();
    const canCreate = hasPermission('appointment_types:create');
    const canEdit = hasPermission('appointment_types:edit');
    const canDelete = hasPermission('appointment_types:delete');
    const canView = hasPermission('appointment_types:view');

    const loadTypes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await obtenerTiposCita(showInactive ? null : true);
            setTypes(response.data);
        } catch (error) {
            console.error('Error al cargar tipos de cita:', error);
        } finally {
            setLoading(false);
        }
    }, [showInactive]);

    useEffect(() => {
        loadTypes();
    }, [loadTypes]);

    const handleCreate = () => {
        setSelectedType(null);
        setModalOpen(true);
    };

    const handleEdit = (type) => {
        if (!canEdit) return;
        setSelectedType(type);
        setModalOpen(true);
    };

    const handleDelete = async (type) => {
        if (!canDelete) return;
        
        const result = await Swal.fire({
            title: '¿Eliminar tipo de cita?',
            html: `¿Estás seguro de que deseas eliminar el tipo de cita <strong>${type.nombre}</strong>?<br/><small class="text-gray-500">Duración: ${type.duracion_minutos} minutos</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C8102E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            try {
                await eliminarTipoCita(type.id);
                toast.success('Tipo de cita eliminado correctamente');
                loadTypes();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al eliminar tipo de cita');
            }
        }
    };

    const handleModalClose = (shouldReload) => {
        setModalOpen(false);
        setSelectedType(null);
        if (shouldReload) {
            loadTypes();
        }
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    if (!canView) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card>
                    <p className="text-text">No tienes permisos para ver los tipos de cita</p>
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
                        <h1 className="text-3xl font-heading font-bold text-text">Tipos de Cita</h1>
                        <p className="text-gray-600 mt-1">Gestión de servicios del taller</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowInactive(!showInactive)}
                        >
                            {showInactive ? 'Solo Activos' : 'Mostrar Todos'}
                        </Button>
                        {canCreate && (
                            <Button variant="primary" onClick={handleCreate}>
                                <FiPlus className="mr-2" />
                                Nuevo Tipo
                            </Button>
                        )}
                    </div>
                </div>

            {/* Grid de Tipos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full">
                        <Loading />
                    </div>
                ) : types.length === 0 ? (
                    <div className="col-span-full">
                        <Card>
                            <div className="text-center py-12">
                                <p className="text-gray-500">No se encontraron tipos de cita</p>
                            </div>
                        </Card>
                    </div>
                ) : (
                    types.map((type) => (
                        <Card key={type.id} className="hover:shadow-lg transition-shadow">
                            {/* Color Badge */}
                            <div 
                                className="w-full h-2 rounded-t-lg mb-4"
                                style={{ backgroundColor: type.color }}
                            />

                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {type.nombre}
                                    </h3>
                                    {type.descripcion && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {type.descripcion}
                                        </p>
                                    )}
                                </div>
                                <Badge variant={type.activo ? 'success' : 'neutral'}>
                                    {type.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>

                            {/* Duración */}
                            <div className="flex items-center gap-2 text-gray-700 mb-4">
                                <FiClock className="text-primary" />
                                <span className="font-medium">
                                    {formatDuration(type.duracion_minutos)}
                                </span>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-2 pt-3 border-t">
                                {canEdit && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleEdit(type)}
                                        className="flex-1"
                                    >
                                        <FiEdit2 className="mr-2" />
                                        Editar
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(type)}
                                    >
                                        <FiTrash2 />
                                    </Button>
                                )}
                            </div>

                            {/* Metadata */}
                            {type.creador_nombre && (
                                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                                    Creado por {type.creador_nombre}
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <AppointmentTypeFormModal
                    appointmentType={selectedType}
                    onClose={handleModalClose}
                />
            )}
            </div>
        </Layout>
    );
};

export default AppointmentTypesListPage;
