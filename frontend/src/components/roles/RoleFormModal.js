import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Input } from '../common';
import { rolesService, permisosService } from '../../services';

const RoleFormModal = ({ isOpen, onClose, role, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    nivel_jerarquico: 3,
    permisos_ids: []
  });
  const [permisos, setPermisos] = useState([]);
  const [permisosAgrupados, setPermisosAgrupados] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      cargarPermisos();
      if (role) {
        setFormData({
          nombre: role.nombre || '',
          descripcion: role.descripcion || '',
          nivel_jerarquico: role.nivel_jerarquico || 3,
          permisos_ids: []
        });
        cargarPermisosRol(role.id);
      } else {
        setFormData({ nombre: '', descripcion: '', nivel_jerarquico: 3, permisos_ids: [] });
      }
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, role]);

  const cargarPermisos = async () => {
    try {
      const data = await permisosService.porRecurso();
      setPermisosAgrupados(data);
      const todosPermisos = await permisosService.listar();
      setPermisos(todosPermisos);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      toast.error('Error al cargar la lista de permisos');
    }
  };

  const cargarPermisosRol = async (rolId) => {
    try {
      const permisosRol = await rolesService.obtenerPermisos(rolId);
      setFormData(prev => ({ ...prev, permisos_ids: permisosRol.map(p => p.id) }));
    } catch (error) {
      console.error('Error al cargar permisos del rol:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handlePermisoToggle = (permisoId) => {
    setFormData(prev => {
      const permisos = prev.permisos_ids.includes(permisoId)
        ? prev.permisos_ids.filter(id => id !== permisoId)
        : [...prev.permisos_ids, permisoId];
      return { ...prev, permisos_ids: permisos };
    });
  };

  const handleRecursoToggle = (recurso) => {
    const permisosRecurso = permisosAgrupados[recurso]?.map(p => p.id) || [];
    const todosMarcados = permisosRecurso.every(id => formData.permisos_ids.includes(id));
    
    setFormData(prev => {
      const permisos = todosMarcados
        ? prev.permisos_ids.filter(id => !permisosRecurso.includes(id))
        : [...new Set([...prev.permisos_ids, ...permisosRecurso])];
      return { ...prev, permisos_ids: permisos };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    if (formData.nivel_jerarquico < 1 || formData.nivel_jerarquico > 10) {
      newErrors.nivel_jerarquico = 'El nivel debe estar entre 1 y 10';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (role) {
        await rolesService.actualizar(role.id, formData);
        if (formData.permisos_ids.length > 0) {
          await rolesService.asignarPermisos(role.id, formData.permisos_ids);
        }
        toast.success('Rol actualizado correctamente');
      } else {
        const nuevoRol = await rolesService.crear(formData);
        if (formData.permisos_ids.length > 0) {
          await rolesService.asignarPermisos(nuevoRol.id, formData.permisos_ids);
        }
        toast.success('Rol creado correctamente');
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar rol:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-gray-900">
              {role ? 'Editar Rol' : 'Nuevo Rol'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Rol *"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={errors.nombre}
                placeholder="Ej: Administrador"
                disabled={loading}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel Jerárquico *
                </label>
                <input
                  type="number"
                  name="nivel_jerarquico"
                  min="1"
                  max="10"
                  value={formData.nivel_jerarquico}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.nivel_jerarquico && (
                  <p className="mt-1 text-sm text-red-600">{errors.nivel_jerarquico}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">1 = Mayor autoridad, 10 = Menor autoridad</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Descripción del rol..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permisos ({formData.permisos_ids.length} seleccionados)
              </label>
              <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                {Object.entries(permisosAgrupados).map(([recurso, permisos]) => {
                  const permisosRecurso = permisos.map(p => p.id);
                  const todosMarcados = permisosRecurso.every(id => formData.permisos_ids.includes(id));
                  const algunosMarcados = permisosRecurso.some(id => formData.permisos_ids.includes(id));

                  return (
                    <div key={recurso} className="border-b border-gray-200 last:border-b-0">
                      <div className="bg-gray-50 px-4 py-2 flex items-center">
                        <input
                          type="checkbox"
                          checked={todosMarcados}
                          ref={input => {
                            if (input) input.indeterminate = algunosMarcados && !todosMarcados;
                          }}
                          onChange={() => handleRecursoToggle(recurso)}
                          disabled={loading}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {recurso.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="px-4 py-2 grid grid-cols-2 gap-2">
                        {permisos.map(permiso => (
                          <label key={permiso.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permisos_ids.includes(permiso.id)}
                              onChange={() => handlePermisoToggle(permiso.id)}
                              disabled={loading}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {permiso.accion_nombre}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                {role ? 'Actualizar' : 'Crear'} Rol
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleFormModal;
