// ============================================================================
// MODAL DE DETALLE DE TAREA
// ============================================================================
import React, { useState } from 'react';
import { FiX, FiUser, FiCalendar, FiClock, FiMessageSquare, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Modal, Badge, Button } from '../common';
import { tareasService } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';

const TaskDetailModal = ({ isOpen, onClose, task, onUpdate }) => {
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState('detalle');
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAgregarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    try {
      setLoading(true);
      await tareasService.agregarComentario(task.id, { comentario: nuevoComentario });
      toast.success('Comentario agregado correctamente');
      setNuevoComentario('');
      onUpdate();
      // Recargar tarea para actualizar comentarios
      const tareaActualizada = await tareasService.obtenerPorId(task.id);
      Object.assign(task, tareaActualizada);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      toast.error('Error al agregar el comentario');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaSolo = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{task.titulo}</h2>
            {task.es_241 && (
              <Badge variant="info">24.1</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Badge variant={getPrioridadBadge(task.prioridad).variant}>
              {getPrioridadBadge(task.prioridad).label}
            </Badge>
            <Badge variant={getEstadoBadge(task.estado).variant}>
              {getEstadoBadge(task.estado).label}
            </Badge>
            {task.dias_restantes !== undefined && task.estado !== 'completada' && task.estado !== 'cancelada' && (
              task.dias_restantes < 0 ? (
                <Badge variant="danger">Vencida ({Math.abs(task.dias_restantes)} días)</Badge>
              ) : task.dias_restantes === 0 ? (
                <Badge variant="warning">Vence hoy</Badge>
              ) : (
                <Badge variant="success">{task.dias_restantes} días restantes</Badge>
              )
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FiX size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('detalle')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'detalle'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiList className="inline mr-2" />
            Detalle
          </button>
          <button
            onClick={() => setActiveTab('comentarios')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'comentarios'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiMessageSquare className="inline mr-2" />
            Comentarios ({task.comentarios?.length || 0})
          </button>
          {can.viewTaskHistory && (
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'historial'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiClock className="inline mr-2" />
              Historial ({task.historial?.length || 0})
            </button>
          )}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="max-h-[60vh] overflow-y-auto">
        {/* Tab Detalle */}
        {activeTab === 'detalle' && (
          <div className="space-y-6">
            {task.numero_registro && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Número de Registro</h3>
                <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">{task.numero_registro}</p>
              </div>
            )}

            {task.descripcion && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{task.descripcion}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiUser className="mr-2" />
                  Asignaciones
                </h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-gray-500">Asignado a:</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {task.asignado_a_nombre} (@{task.asignado_a_username})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Asignado por:</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {task.asignado_por_nombre} (@{task.asignado_por_username})
                    </dd>
                  </div>
                  {task.unidad_nombre && (
                    <div>
                      <dt className="text-xs text-gray-500">Unidad:</dt>
                      <dd className="text-sm font-medium text-gray-900">{task.unidad_nombre}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiCalendar className="mr-2" />
                  Fechas
                </h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-gray-500">Fecha de inicio:</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatFechaSolo(task.fecha_inicio)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Fecha límite:</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatFechaSolo(task.fecha_limite)}
                      {task.es_241 && (
                        <span className="text-xs text-blue-600 ml-2">(90 días automático)</span>
                      )}
                    </dd>
                  </div>
                  {task.fecha_completada && (
                    <div>
                      <dt className="text-xs text-gray-500">Fecha de completado:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatFechaSolo(task.fecha_completada)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {task.notas && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notas</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {task.notas}
                </p>
              </div>
            )}

            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p>Creado el {formatFecha(task.creado_en)}</p>
              <p>Última actualización: {formatFecha(task.actualizado_en)}</p>
            </div>
          </div>
        )}

        {/* Tab Comentarios */}
        {activeTab === 'comentarios' && (
          <div className="space-y-4">
            {/* Formulario para nuevo comentario */}
            {can.commentTasks && (
              <form onSubmit={handleAgregarComentario} className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar comentario
                </label>
                <textarea
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  rows="3"
                  className="input-field mb-3"
                  placeholder="Escribe tu comentario..."
                  disabled={loading}
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" loading={loading}>
                    Agregar Comentario
                  </Button>
                </div>
              </form>
            )}

            {/* Lista de comentarios */}
            {task.comentarios && task.comentarios.length > 0 ? (
              <div className="space-y-3">
                {task.comentarios.map((comentario, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          {comentario.usuario_nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{comentario.usuario_nombre}</p>
                          <p className="text-xs text-gray-500">{formatFecha(comentario.creado_en)}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comentario.comentario}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiMessageSquare className="mx-auto mb-2" size={32} />
                <p>No hay comentarios aún</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Historial */}
        {activeTab === 'historial' && can.viewTaskHistory && (
          <div className="space-y-3">
            {task.historial && task.historial.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                {task.historial.map((cambio, index) => (
                  <div key={index} className="relative pl-10 pb-6">
                    <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-primary rounded-full border-2 border-white" />
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-900">{cambio.usuario_nombre}</span>
                        <span className="text-xs text-gray-500">{formatFecha(cambio.creado_en)}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{cambio.campo_modificado}:</span>
                        {' '}
                        {cambio.valor_anterior && (
                          <span className="text-red-600">{cambio.valor_anterior}</span>
                        )}
                        {cambio.valor_anterior && ' → '}
                        <span className="text-green-600">{cambio.valor_nuevo}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiClock className="mx-auto mb-2" size={32} />
                <p>No hay cambios registrados</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
