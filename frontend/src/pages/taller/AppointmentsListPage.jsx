import React, { useState, useEffect, useCallback } from 'react';
import { obtenerCitas, confirmarCita, cancelarCita, completarCita, eliminarCita } from '../../services/citasService';
import { obtenerTiposCitaActivos } from '../../services/tiposCitaService';
import { usePermissions } from '../../hooks/usePermissions';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import AppointmentFormModal from './AppointmentFormModal';
import { FiPlus, FiCheckCircle, FiXCircle, FiClock, FiFilter, FiCalendar, FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const AppointmentsListPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [appointmentTypes, setAppointmentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    
    // Filtros
    const [filters, setFilters] = useState({
        estado: '',
        tipo_cita_id: '',
        unidad_id: '',
        fecha_desde: '',
        fecha_hasta: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const { hasPermission } = usePermissions();
    const canCreate = hasPermission('appointments:create');
    const canEdit = hasPermission('appointments:edit');
    const canManage = hasPermission('appointments:manage');
    const canCancel = hasPermission('appointments:cancel');
    const canDelete = hasPermission('appointments:delete');
    const canView = hasPermission('appointments:view');

    // Debug: Verificar permisos cargados
    useEffect(() => {
        console.log('🔍 [AppointmentsListPage] Permisos verificados:', {
            canView,
            canCreate,
            canEdit,
            canManage,
            canCancel,
            canDelete
        });
    }, [canView, canCreate, canEdit, canManage, canCancel, canDelete]);

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await obtenerCitas({
                ...filters,
                page: pagination.page,
                limit: 20
            });
            setAppointments(response.data);
            setPagination({
                page: response.page,
                totalPages: response.totalPages,
                total: response.total
            });
        } catch (error) {
            console.error('Error al cargar citas:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page]);

    useEffect(() => {
        loadAppointments();
        loadAppointmentTypes();
    }, [loadAppointments]);

    const loadAppointmentTypes = async () => {
        try {
            const response = await obtenerTiposCitaActivos();
            setAppointmentTypes(response.data);
        } catch (error) {
            console.error('Error al cargar tipos de cita:', error);
        }
    };

    const handleCreate = () => {
        setModalOpen(true);
    };

    const handleEdit = (appointment) => {
        if (!canEdit) return;
        // TODO: Implementar edición de cita (abrir modal con datos precargados)
        toast.info('Funcionalidad de edición en desarrollo');
    };

    const handleView = (appointment) => {
        Swal.fire({
            title: 'Detalle de Cita',
            html: `
                <div class="text-left space-y-3">
                    <div class="border-b pb-2">
                        <p class="text-xs text-gray-500 uppercase">Vehículo</p>
                        <p class="font-semibold text-primary">${appointment.matricula}</p>
                        <p class="text-sm text-gray-600">${appointment.marca} ${appointment.modelo}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-xs text-gray-500 uppercase">Servicio</p>
                        <p class="font-semibold">${appointment.tipo_cita_nombre}</p>
                        <p class="text-sm text-gray-600">${appointment.duracion_minutos} minutos</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-xs text-gray-500 uppercase">Fecha y Hora</p>
                        <p class="font-semibold">${new Date(appointment.fecha_hora_inicio).toLocaleString('es-ES')}</p>
                        <p class="text-sm text-gray-600">Estado: ${appointment.estado}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-xs text-gray-500 uppercase">Solicitante</p>
                        <p class="font-semibold">${appointment.solicitante_nombre}</p>
                        <p class="text-sm text-gray-600">${appointment.unidad_nombre}</p>
                    </div>
                    ${appointment.notas ? `
                        <div class="border-b pb-2">
                            <p class="text-xs text-gray-500 uppercase">Notas</p>
                            <p class="text-sm text-gray-700">${appointment.notas}</p>
                        </div>
                    ` : ''}
                    ${appointment.diagnostico ? `
                        <div class="border-b pb-2">
                            <p class="text-xs text-gray-500 uppercase">Diagnóstico</p>
                            <p class="text-sm text-gray-700">${appointment.diagnostico}</p>
                        </div>
                    ` : ''}
                    ${appointment.trabajos_realizados ? `
                        <div class="border-b pb-2">
                            <p class="text-xs text-gray-500 uppercase">Trabajos Realizados</p>
                            <p class="text-sm text-gray-700">${appointment.trabajos_realizados}</p>
                        </div>
                    ` : ''}
                    ${appointment.motivo_cancelacion ? `
                        <div class="border-b pb-2">
                            <p class="text-xs text-gray-500 uppercase">Motivo de Cancelación</p>
                            <p class="text-sm text-red-700">${appointment.motivo_cancelacion}</p>
                        </div>
                    ` : ''}
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#004E2E',
            confirmButtonText: 'Cerrar',
            width: '600px'
        });
    };

    const handleConfirm = async (appointment) => {
        if (!canManage) return;
        
        const result = await Swal.fire({
            title: '¿Confirmar cita?',
            html: `¿Deseas confirmar la cita para el vehículo <strong>${appointment.matricula}</strong>?<br/><small class="text-gray-500">${appointment.tipo_cita_nombre} - ${new Date(appointment.fecha_hora_inicio).toLocaleString('es-ES')}</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#004E2E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            try {
                await confirmarCita(appointment.id);
                toast.success('Cita confirmada correctamente');
                loadAppointments();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al confirmar cita');
            }
        }
    };

    const handleComplete = async (appointment) => {
        if (!canManage) return;
        
        const { value: formValues } = await Swal.fire({
            title: 'Completar cita',
            html: `
                <div class="text-left space-y-4">
                    <p class="text-sm text-gray-600 mb-4">Vehículo: <strong>${appointment.matricula}</strong></p>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Diagnóstico (opcional)</label>
                        <textarea id="diagnostico" class="swal2-input w-full" rows="3" placeholder="Describe el diagnóstico..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Trabajos realizados (opcional)</label>
                        <textarea id="trabajos" class="swal2-input w-full" rows="3" placeholder="Describe los trabajos realizados..."></textarea>
                    </div>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#004E2E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Completar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    diagnostico: document.getElementById('diagnostico').value || null,
                    trabajos_realizados: document.getElementById('trabajos').value || null
                };
            }
        });
        
        if (formValues) {
            try {
                await completarCita(appointment.id, formValues);
                toast.success('Cita completada correctamente');
                loadAppointments();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al completar cita');
            }
        }
    };

    const handleCancel = async (appointment) => {
        if (!canCancel) return;
        
        const { value: motivo } = await Swal.fire({
            title: 'Cancelar cita',
            html: `
                <div class="text-left space-y-4">
                    <p class="text-sm text-gray-600 mb-4">Vehículo: <strong>${appointment.matricula}</strong></p>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Motivo de cancelación *</label>
                        <textarea id="motivo" class="swal2-input w-full" rows="3" placeholder="Indica el motivo de cancelación..."></textarea>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C8102E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Cancelar cita',
            cancelButtonText: 'Volver',
            preConfirm: () => {
                const motivoValue = document.getElementById('motivo').value;
                if (!motivoValue) {
                    Swal.showValidationMessage('Debes indicar el motivo de cancelación');
                }
                return motivoValue;
            }
        });
        
        if (motivo) {
            try {
                await cancelarCita(appointment.id, motivo);
                toast.success('Cita cancelada correctamente');
                loadAppointments();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al cancelar cita');
            }
        }
    };

    const handleDelete = async (appointment) => {
        if (!canDelete) return;
        
        const result = await Swal.fire({
            title: '¿Eliminar cita?',
            html: `
                <div class="text-left space-y-2">
                    <p class="text-sm text-gray-600">¿Estás seguro de que deseas eliminar esta cita?</p>
                    <div class="bg-gray-50 p-3 rounded mt-3">
                        <p class="text-sm"><strong>Vehículo:</strong> ${appointment.matricula}</p>
                        <p class="text-sm"><strong>Fecha:</strong> ${new Date(appointment.fecha_hora_inicio).toLocaleString('es-ES')}</p>
                        <p class="text-sm"><strong>Servicio:</strong> ${appointment.tipo_cita_nombre}</p>
                        <p class="text-sm"><strong>Estado:</strong> ${appointment.estado}</p>
                    </div>
                    <p class="text-xs text-red-600 mt-3">⚠️ Esta acción no se puede deshacer</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C8102E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            try {
                await eliminarCita(appointment.id);
                toast.success('Cita eliminada correctamente');
                loadAppointments();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al eliminar cita');
            }
        }
    };

    const handleModalClose = (shouldReload) => {
        setModalOpen(false);
        if (shouldReload) {
            loadAppointments();
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            estado: '',
            tipo_cita_id: '',
            unidad_id: '',
            fecha_desde: '',
            fecha_hasta: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getEstadoBadge = (estado) => {
        const estados = {
            pendiente: { variant: 'warning', label: 'Pendiente' },
            confirmada: { variant: 'info', label: 'Confirmada' },
            completada: { variant: 'success', label: 'Completada' },
            cancelada: { variant: 'error', label: 'Cancelada' }
        };
        const config = estados[estado] || estados.pendiente;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (!canView) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card>
                    <p className="text-text">No tienes permisos para ver las citas</p>
                </Card>
            </div>
        );
    }

    return (
        <Layout>
            <div className="p-6 space-y-6">
                {/* DEBUG: Banner de permisos (TEMPORAL) */}
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-2">🔍 DEBUG: Estado de Permisos</p>
                    <div className="grid grid-cols-6 gap-2 text-xs">
                        <div className={canView ? 'text-green-700' : 'text-red-700'}>
                            Ver: {canView ? '✅' : '❌'}
                        </div>
                        <div className={canCreate ? 'text-green-700' : 'text-red-700'}>
                            Crear: {canCreate ? '✅' : '❌'}
                        </div>
                        <div className={canEdit ? 'text-green-700' : 'text-red-700'}>
                            Editar: {canEdit ? '✅' : '❌'}
                        </div>
                        <div className={canManage ? 'text-green-700' : 'text-red-700'}>
                            Gestionar: {canManage ? '✅' : '❌'}
                        </div>
                        <div className={canCancel ? 'text-green-700' : 'text-red-700'}>
                            Cancelar: {canCancel ? '✅' : '❌'}
                        </div>
                        <div className={canDelete ? 'text-green-700' : 'text-red-700'}>
                            Eliminar: {canDelete ? '✅' : '❌'}
                        </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                        💡 Si alguno está en rojo, cierra sesión y vuelve a iniciar sesión
                    </p>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-text">Citas del Taller</h1>
                        <p className="text-gray-600 mt-1">Gestión de citas de mantenimiento</p>
                    </div>
                    {canCreate && (
                        <Button variant="primary" onClick={handleCreate}>
                            <FiPlus className="mr-2" />
                            Nueva Cita
                        </Button>
                    )}
                </div>

            {/* Filtros */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant={showFilters ? 'primary' : 'secondary'}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter className="mr-2" />
                        Filtros
                    </Button>
                    {Object.values(filters).some(v => v) && (
                        <span className="text-sm text-gray-600">
                            {Object.values(filters).filter(v => v).length} filtros activos
                        </span>
                    )}
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <select
                                className="input-field"
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="completada">Completada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Servicio
                            </label>
                            <select
                                className="input-field"
                                value={filters.tipo_cita_id}
                                onChange={(e) => handleFilterChange('tipo_cita_id', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {appointmentTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Desde
                            </label>
                            <input
                                type="date"
                                className="input-field"
                                value={filters.fecha_desde}
                                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hasta
                            </label>
                            <input
                                type="date"
                                className="input-field"
                                value={filters.fecha_hasta}
                                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                            />
                        </div>

                        <div className="lg:col-span-4 flex justify-end">
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
                ) : appointments.length === 0 ? (
                    <div className="text-center py-12">
                        <FiCalendar className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">No se encontraron citas</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Fecha/Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Vehículo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Servicio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Solicitante
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDateTime(appointment.fecha_hora_inicio)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {appointment.duracion_minutos} min
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono font-semibold text-primary">
                                                    {appointment.matricula}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {appointment.marca} {appointment.modelo}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded"
                                                        style={{ backgroundColor: appointment.tipo_cita_color }}
                                                    />
                                                    <span className="text-sm text-gray-900">
                                                        {appointment.tipo_cita_nombre}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {appointment.solicitante_nombre}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {appointment.unidad_nombre}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getEstadoBadge(appointment.estado)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end gap-2">
                                                    {/* Botón Ver Detalles - Siempre visible */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleView(appointment)}
                                                        title="Ver detalles"
                                                    >
                                                        <FiEye />
                                                    </Button>

                                                    {/* Botón Editar - Ahora visible para TODAS las citas */}
                                                    {canEdit && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleEdit(appointment)}
                                                            title="Editar"
                                                        >
                                                            <FiEdit2 />
                                                        </Button>
                                                    )}

                                                    {/* Botón Confirmar (solo estado pendiente) */}
                                                    {appointment.estado === 'pendiente' && canManage && (
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleConfirm(appointment)}
                                                            title="Confirmar"
                                                        >
                                                            <FiCheckCircle />
                                                        </Button>
                                                    )}

                                                    {/* Botón Completar (solo estado confirmada) */}
                                                    {appointment.estado === 'confirmada' && canManage && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleComplete(appointment)}
                                                            title="Completar"
                                                        >
                                                            <FiClock />
                                                        </Button>
                                                    )}

                                                    {/* Botón Cancelar (solo si no está cancelada o completada) */}
                                                    {appointment.estado !== 'cancelada' && 
                                                     appointment.estado !== 'completada' && 
                                                     canCancel && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCancel(appointment)}
                                                            title="Cancelar cita"
                                                        >
                                                            <FiXCircle />
                                                        </Button>
                                                    )}

                                                    {/* Botón Eliminar - Siempre visible si tiene permiso */}
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(appointment)}
                                                            title="Eliminar cita"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                    Mostrando {appointments.length} de {pagination.total} citas
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
                <AppointmentFormModal onClose={handleModalClose} />
            )}
            </div>
        </Layout>
    );
};

export default AppointmentsListPage;
