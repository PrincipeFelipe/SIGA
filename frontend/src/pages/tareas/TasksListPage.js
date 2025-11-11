// ============================================================================
// PÁGINA DE LISTADO DE TAREAS
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiRefreshCw, FiSearch, FiCalendar, FiAlertCircle, FiCheckCircle, FiClock, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import { Card, Badge, Loading, Button, Input } from '../../components/common';
import { TaskFormModal, TaskDetailModal } from '../../components/tareas';
import { tareasService, usuariosService } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';

const TasksListPage = () => {
  const { can } = usePermissions();
  const { id } = useParams(); // Capturar ID de tarea desde la URL
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsJerarquicas, setStatsJerarquicas] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filtros, setFiltros] = useState({
    search: '',
    estado: '',
    prioridad: '',
    es_241: '',
    asignado_a: '',
    vencidas: false,
    mis_tareas: false,
    page: 1,
    limit: 10
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    cargarUsuarios();
    cargarEstadisticas();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarTareas();
    }, filtros.search ? 500 : 0);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [filtros]);

  // Cargar tarea automáticamente si viene un ID en la URL
  useEffect(() => {
    if (id) {
      cargarTareaDesdeURL(id);
    }
    // eslint-disable-next-line
  }, [id]);

  /**
   * Cargar detalle de tarea desde URL
   */
  const cargarTareaDesdeURL = async (tareaId) => {
    try {
      const tareaCompleta = await tareasService.obtenerPorId(tareaId);
      setSelectedTask(tareaCompleta);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error al cargar tarea desde URL:', error);
      toast.error('No se pudo cargar la tarea solicitada');
      // Redirigir a la lista de tareas sin el ID
      navigate('/tareas', { replace: true });
    }
  };

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const result = await tareasService.listar(filtros);
      console.log('📋 Tareas recibidas:', result.data);
      console.log('🔍 Tareas con 24.1:', result.data?.filter(t => t.es_241));
      console.log('🔍 Detalle de es_241:', result.data?.map(t => ({ id: t.id, titulo: t.titulo, es_241: t.es_241, es_241_truthy: !!t.es_241 })));
      setTareas(result.data || []);
      setPagination(result.pagination || null);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error('Error al cargar el listado de tareas');
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const result = await usuariosService.listar({ limit: 1000 });
      setUsuarios(result.data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      // Estadísticas propias
      const result = await tareasService.obtenerEstadisticas(false);
      setStats(result);
      
      // Estadísticas jerárquicas (todas las tareas accesibles)
      // Solo si el usuario tiene permisos para verlas
      if (can.viewAllTasks || can.viewTasks) {
        try {
          const resultJerarquicas = await tareasService.obtenerEstadisticas(true);
          setStatsJerarquicas(resultJerarquicas);
        } catch (error) {
          // Si no tiene permisos, simplemente no mostramos las estadísticas jerárquicas
          console.log('No tiene permisos para ver estadísticas jerárquicas');
        }
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      search: '',
      estado: '',
      prioridad: '',
      es_241: '',
      asignado_a: '',
      vencidas: false,
      mis_tareas: false,
      page: 1,
      limit: 10
    });
  };

  const handlePageChange = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  const handleCreate = () => {
    setEditingTask(null);
    setShowFormModal(true);
  };

  const handleEdit = (tarea) => {
    setEditingTask(tarea);
    setShowFormModal(true);
  };

  const handleViewDetail = async (tarea) => {
    try {
      const tareaCompleta = await tareasService.obtenerPorId(tarea.id);
      setSelectedTask(tareaCompleta);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error al cargar detalle de tarea:', error);
      toast.error('Error al cargar el detalle de la tarea');
    }
  };

  const handleSaveSuccess = () => {
    setShowFormModal(false);
    setEditingTask(null);
    cargarTareas();
    cargarEstadisticas();
  };

  const handleEliminar = async (tarea) => {
    if (window.confirm(`¿Estás seguro de eliminar la tarea "${tarea.titulo}"?`)) {
      try {
        await tareasService.eliminar(tarea.id);
        toast.success('Tarea eliminada correctamente');
        cargarTareas();
        cargarEstadisticas();
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        toast.error(error.response?.data?.message || 'Error al eliminar tarea');
      }
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { variant: 'secondary', label: 'Pendiente' },
      en_progreso: { variant: 'info', label: 'En Progreso' },
      en_revision: { variant: 'warning', label: 'En Revisión' },
      completada: { variant: 'success', label: 'Completada' },
      cancelada: { variant: 'danger', label: 'Cancelada' }
    };
    return estados[estado] || { variant: 'secondary', label: estado };
  };

  const getPrioridadBadge = (prioridad) => {
    const prioridades = {
      baja: { variant: 'secondary', label: 'Baja' },
      media: { variant: 'info', label: 'Media' },
      alta: { variant: 'warning', label: 'Alta' },
      urgente: { variant: 'danger', label: 'Urgente' }
    };
    return prioridades[prioridad] || { variant: 'secondary', label: prioridad };
  };

  const getDiasRestantesBadge = (diasRestantes, estado) => {
    if (estado === 'completada' || estado === 'cancelada') {
      return null;
    }

    if (diasRestantes < 0) {
      return <Badge variant="danger">Vencida ({Math.abs(diasRestantes)} días)</Badge>;
    } else if (diasRestantes === 0) {
      return <Badge variant="warning">Vence hoy</Badge>;
    } else if (diasRestantes <= 3) {
      return <Badge variant="warning">{diasRestantes} días</Badge>;
    } else if (diasRestantes <= 7) {
      return <Badge variant="info">{diasRestantes} días</Badge>;
    } else {
      return <Badge variant="success">{diasRestantes} días</Badge>;
    }
  };

  const renderPaginacion = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages } = pagination;
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pageNumbers.push(i);
      } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
        pageNumbers.push('...');
      }
    }

    return (
      <div className="flex justify-center items-center space-x-1 mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Anterior
        </button>

        {pageNumbers.map((num, idx) => (
          num === '...' ? (
            <span key={idx} className="px-2">...</span>
          ) : (
            <button
              key={idx}
              onClick={() => handlePageChange(num)}
              className={`px-3 py-1 rounded border ${
                page === num
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {num}
            </button>
          )
        ))}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Siguiente
        </button>
      </div>
    );
  };

  if (loading && tareas.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
            <p className="text-gray-500 mt-1">Gestión de tareas del equipo</p>
          </div>
          {can.createTasks && (
            <Button variant="primary" onClick={handleCreate} icon={<FiPlus />}>
              Nueva Tarea
            </Button>
          )}
        </div>

        {/* Estadísticas Propias */}
        {stats && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Mis Tareas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total || 0}</p>
                  </div>
                  <FiClock className="text-blue-600" size={32} />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">En Progreso</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.en_progreso || 0}</p>
                  </div>
                  <FiAlertCircle className="text-yellow-600" size={32} />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Completadas</p>
                    <p className="text-2xl font-bold text-green-900">{stats.completadas || 0}</p>
                  </div>
                  <FiCheckCircle className="text-green-600" size={32} />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Vencidas</p>
                    <p className="text-2xl font-bold text-red-900">{stats.vencidas || 0}</p>
                  </div>
                  <FiCalendar className="text-red-600" size={32} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Estadísticas Jerárquicas (si tiene permisos) */}
        {statsJerarquicas && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span>Tareas de mi Ámbito</span>
              <Badge variant="info" size="sm">Incluye unidades dependientes</Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{statsJerarquicas.total || 0}</p>
                  </div>
                  <FiClock className="text-blue-600" size={32} />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">En Progreso</p>
                    <p className="text-2xl font-bold text-yellow-900">{statsJerarquicas.en_progreso || 0}</p>
                  </div>
                  <FiAlertCircle className="text-yellow-600" size={32} />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Completadas</p>
                    <p className="text-2xl font-bold text-green-900">{statsJerarquicas.completadas || 0}</p>
                  </div>
                  <FiCheckCircle className="text-green-600" size={32} />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Vencidas</p>
                    <p className="text-2xl font-bold text-red-900">{statsJerarquicas.vencidas || 0}</p>
                  </div>
                  <FiCalendar className="text-red-600" size={32} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Filtros */}
        <Card title="Filtros">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Buscar"
                placeholder="Título o descripción..."
                value={filtros.search}
                onChange={(e) => setFiltros({ ...filtros, search: e.target.value, page: 1 })}
                icon={<FiSearch />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value, page: 1 })}
                className="input-field"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="en_revision">En Revisión</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={filtros.prioridad}
                onChange={(e) => setFiltros({ ...filtros, prioridad: e.target.value, page: 1 })}
                className="input-field"
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
              <select
                value={filtros.asignado_a}
                onChange={(e) => setFiltros({ ...filtros, asignado_a: e.target.value, page: 1 })}
                className="input-field"
              >
                <option value="">Todos</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filtros.es_241}
                onChange={(e) => setFiltros({ ...filtros, es_241: e.target.value, page: 1 })}
                className="input-field"
              >
                <option value="">Todas</option>
                <option value="true">Procedimiento 24.1 (90 días)</option>
                <option value="false">Tarea normal</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filtros.mis_tareas}
                  onChange={(e) => setFiltros({ ...filtros, mis_tareas: e.target.checked, page: 1 })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Solo mis tareas</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filtros.vencidas}
                  onChange={(e) => setFiltros({ ...filtros, vencidas: e.target.checked, page: 1 })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Solo vencidas</span>
              </label>
            </div>

            <Button variant="secondary" onClick={handleLimpiarFiltros} icon={<FiRefreshCw />}>
              Limpiar Filtros
            </Button>
          </div>
        </Card>

        {/* Tabla de tareas */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plazo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tareas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron tareas
                    </td>
                  </tr>
                ) : (
                  tareas.map(tarea => (
                    <tr key={tarea.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetail(tarea)}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {tarea.titulo}
                            {tarea.es_241 === 1 && (
                              <Badge variant="info" size="sm">24.1</Badge>
                            )}
                          </div>
                          {tarea.descripcion && (
                            <div className="text-xs text-gray-500 truncate max-w-md">
                              {tarea.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tarea.asignado_a_nombre}</div>
                        <div className="text-xs text-gray-500">@{tarea.asignado_a_username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getPrioridadBadge(tarea.prioridad).variant}>
                          {getPrioridadBadge(tarea.prioridad).label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getEstadoBadge(tarea.estado).variant}>
                          {getEstadoBadge(tarea.estado).label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          {new Date(tarea.fecha_limite).toLocaleDateString()}
                        </div>
                        {getDiasRestantesBadge(tarea.dias_restantes, tarea.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end space-x-2">
                          {can.editTasks && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(tarea); }}
                              className="text-primary hover:text-primary/80 p-1"
                              title="Editar"
                            >
                              <FiEdit2 size={18} />
                            </button>
                          )}
                          {can.deleteTasks && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEliminar(tarea); }}
                              className="text-accent hover:text-accent/80 p-1"
                              title="Eliminar"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderPaginacion()}
        </Card>

        {/* Modales */}
        {showFormModal && (
          <TaskFormModal
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingTask(null);
            }}
            task={editingTask}
            onSuccess={handleSaveSuccess}
            usuarios={usuarios}
          />
        )}

        {showDetailModal && selectedTask && (
          <TaskDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedTask(null);
              // Si venimos desde una URL con ID, limpiarla
              if (id) {
                navigate('/tareas', { replace: true });
              }
            }}
            task={selectedTask}
            onUpdate={() => {
              cargarTareas();
              cargarEstadisticas();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default TasksListPage;
