import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiPlus, FiTrash2, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Modal, Button, Badge } from '../common';
import { usuarioRolesService, rolesService, unidadesService } from '../../services';

/**
 * UserRolesModal - Modal para gestionar roles y alcances de un usuario
 */
const UserRolesModal = ({ isOpen, onClose, usuario, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [nuevaAsignacion, setNuevaAsignacion] = useState({
    rol_id: '',
    unidad_alcance_id: ''
  });

  useEffect(() => {
    if (isOpen && usuario) {
      cargarDatos();
    }
    // eslint-disable-next-line
  }, [isOpen, usuario]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar en paralelo: roles, unidades y asignaciones actuales
      const [rolesData, unidadesData, asignacionesData] = await Promise.all([
        rolesService.listar(),
        unidadesService.getTree(),
        usuarioRolesService.listar(usuario.id)
      ]);

      setRoles(rolesData.filter(r => r.activo));
      
      // Aplanar árbol de unidades
      const aplanarUnidades = (unidades, resultado = []) => {
        unidades.forEach(unidad => {
          if (unidad.activo) {
            resultado.push({
              id: unidad.id,
              nombre: unidad.nombre,
              codigo_unidad: unidad.codigo_unidad,
              tipo_unidad: unidad.tipo_unidad
            });
            if (unidad.hijos && unidad.hijos.length > 0) {
              aplanarUnidades(unidad.hijos, resultado);
            }
          }
        });
        return resultado;
      };
      
      setUnidades(aplanarUnidades(unidadesData));
      setAsignaciones(asignacionesData.roles_alcance || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar roles y unidades');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAsignacion = async () => {
    if (!nuevaAsignacion.rol_id || !nuevaAsignacion.unidad_alcance_id) {
      toast.error('Debes seleccionar un rol y una unidad');
      return;
    }

    // Verificar duplicado
    const existe = asignaciones.some(
      a => a.rol_id === parseInt(nuevaAsignacion.rol_id) && 
           a.unidad_alcance_id === parseInt(nuevaAsignacion.unidad_alcance_id)
    );

    if (existe) {
      toast.error('Esta asignación ya existe');
      return;
    }

    try {
      const resultado = await usuarioRolesService.asignar(usuario.id, {
        rol_id: parseInt(nuevaAsignacion.rol_id),
        unidad_alcance_id: parseInt(nuevaAsignacion.unidad_alcance_id)
      });

      setAsignaciones([...asignaciones, resultado]);
      setNuevaAsignacion({ rol_id: '', unidad_alcance_id: '' });
      toast.success('Rol asignado correctamente');
    } catch (error) {
      console.error('Error al asignar rol:', error);
      toast.error(error.response?.data?.message || 'Error al asignar el rol');
    }
  };

  const handleEliminarAsignacion = async (asignacionId) => {
    try {
      await usuarioRolesService.revocar(usuario.id, asignacionId);
      setAsignaciones(asignaciones.filter(a => a.id !== asignacionId));
      toast.success('Rol revocado correctamente');
    } catch (error) {
      console.error('Error al revocar rol:', error);
      toast.error(error.response?.data?.message || 'Error al revocar el rol');
    }
  };

  const handleGuardar = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  if (!usuario) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FiShield className="text-primary" size={24} />
          <span>Gestionar Roles - {usuario.nombre_completo}</span>
        </div>
      }
      size="xl"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Info del usuario */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Usuario:</span>{' '}
                <span className="font-medium text-gray-900">{usuario.username}</span>
              </div>
              <div>
                <span className="text-gray-600">Unidad:</span>{' '}
                <span className="font-medium text-gray-900">{usuario.unidad_destino_nombre}</span>
              </div>
            </div>
          </div>

          {/* Formulario para agregar rol */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiPlus size={16} />
              Asignar Nuevo Rol
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  value={nuevaAsignacion.rol_id}
                  onChange={(e) => setNuevaAsignacion({ ...nuevaAsignacion, rol_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alcance (Unidad) *
                </label>
                <select
                  value={nuevaAsignacion.unidad_alcance_id}
                  onChange={(e) => setNuevaAsignacion({ ...nuevaAsignacion, unidad_alcance_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar unidad...</option>
                  {unidades.map(unidad => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.tipo_unidad} - {unidad.nombre} {unidad.codigo_unidad && `(${unidad.codigo_unidad})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                icon={<FiPlus size={16} />}
                onClick={handleAgregarAsignacion}
                disabled={!nuevaAsignacion.rol_id || !nuevaAsignacion.unidad_alcance_id}
              >
                Agregar Asignación
              </Button>
            </div>
          </div>

          {/* Lista de asignaciones actuales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Roles Asignados ({asignaciones.length})
            </h3>

            {asignaciones.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No hay roles asignados</p>
                <p className="text-sm text-gray-400 mt-1">
                  Agrega un rol y alcance desde el formulario superior
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {asignaciones.map(asignacion => (
                  <div
                    key={asignacion.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary" size="sm">
                          {asignacion.rol_nombre}
                        </Badge>
                        <span className="text-xs text-gray-500">en</span>
                        <Badge variant="info" size="sm">
                          {asignacion.tipo_unidad}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        {asignacion.unidad_nombre}
                        {asignacion.codigo_unidad && (
                          <span className="text-gray-500 ml-2">({asignacion.codigo_unidad})</span>
                        )}
                      </p>
                      {asignacion.rol_descripcion && (
                        <p className="text-xs text-gray-500 mt-1">{asignacion.rol_descripcion}</p>
                      )}
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={<FiTrash2 size={14} />}
                      onClick={() => handleEliminarAsignacion(asignacion.id)}
                      title="Revocar rol"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nota informativa */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>ℹ️ Nota:</strong> Los permisos otorgados por cada rol se aplicarán
              dentro del alcance (unidad) especificado y sus sub-unidades descendientes.
            </p>
          </div>
        </div>
      )}

      {/* Botones del modal */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-6">
        <Button
          variant="secondary"
          onClick={onClose}
          icon={<FiX size={18} />}
          disabled={loading}
        >
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={handleGuardar}
          icon={<FiSave size={18} />}
          disabled={loading}
        >
          Guardar
        </Button>
      </div>
    </Modal>
  );
};

export default UserRolesModal;
