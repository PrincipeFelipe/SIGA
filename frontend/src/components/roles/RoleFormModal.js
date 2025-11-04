import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiEye, FiEdit, FiTrash2, FiPlus, FiCheck, FiShield } from 'react-icons/fi';
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
  const [busquedaPermiso, setBusquedaPermiso] = useState('');

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

  // Función para obtener icono según la acción
  const getIconoAccion = (accion) => {
    const accionLower = accion.toLowerCase();
    if (accionLower.includes('view') || accionLower.includes('ver')) return <FiEye className="w-4 h-4" />;
    if (accionLower.includes('edit') || accionLower.includes('editar')) return <FiEdit className="w-4 h-4" />;
    if (accionLower.includes('delete') || accionLower.includes('eliminar')) return <FiTrash2 className="w-4 h-4" />;
    if (accionLower.includes('create') || accionLower.includes('crear')) return <FiPlus className="w-4 h-4" />;
    if (accionLower.includes('assign') || accionLower.includes('manage')) return <FiShield className="w-4 h-4" />;
    return <FiCheck className="w-4 h-4" />;
  };

  // Función para obtener color según la acción
  const getColorAccion = (accion) => {
    const accionLower = accion.toLowerCase();
    if (accionLower.includes('view') || accionLower.includes('ver')) return 'text-blue-600 bg-blue-50';
    if (accionLower.includes('edit') || accionLower.includes('editar')) return 'text-yellow-600 bg-yellow-50';
    if (accionLower.includes('delete') || accionLower.includes('eliminar')) return 'text-red-600 bg-red-50';
    if (accionLower.includes('create') || accionLower.includes('crear')) return 'text-green-600 bg-green-50';
    if (accionLower.includes('assign') || accionLower.includes('manage')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Función para obtener nombre amigable del recurso
  const getNombreRecurso = (recurso) => {
    const nombres = {
      'users': 'Usuarios',
      'roles': 'Roles',
      'permissions': 'Permisos',
      'units': 'Unidades',
      'user_roles': 'Asignación de Roles',
      'logs': 'Logs de Auditoría',
      'notifications': 'Notificaciones',
      'apps': 'Aplicaciones',
      'modules': 'Módulos del Sistema'
    };
    return nombres[recurso] || recurso.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Función para obtener nombre de acción sin prefijo
  const getNombreAccion = (accion) => {
    const partes = accion.split(':');
    if (partes.length > 1) {
      const accionNombre = partes[1].replace('_', ' ');
      return accionNombre.charAt(0).toUpperCase() + accionNombre.slice(1);
    }
    return accion;
  };

  // Filtrar permisos por búsqueda
  const permisosFiltrados = () => {
    if (!busquedaPermiso.trim()) return permisosAgrupados;
    
    const resultado = {};
    Object.entries(permisosAgrupados).forEach(([recurso, permisos]) => {
      const permisosFiltro = permisos.filter(p => 
        p.accion.toLowerCase().includes(busquedaPermiso.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busquedaPermiso.toLowerCase()) ||
        getNombreRecurso(recurso).toLowerCase().includes(busquedaPermiso.toLowerCase())
      );
      if (permisosFiltro.length > 0) {
        resultado[recurso] = permisosFiltro;
      }
    });
    return resultado;
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

            {/* SECCIÓN DE PERMISOS MEJORADA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Permisos del Rol
                </label>
                <span className="text-sm text-gray-500">
                  {formData.permisos_ids.length} de {permisos.length} seleccionados
                </span>
              </div>

              {/* Barra de búsqueda */}
              <div className="mb-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar permisos..."
                    value={busquedaPermiso}
                    onChange={(e) => setBusquedaPermiso(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Leyenda de colores */}
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-700 mb-2">Tipos de Permisos:</div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <FiEye className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-600">Ver/Consultar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiPlus className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Crear</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiEdit className="w-3 h-3 text-yellow-600" />
                    <span className="text-yellow-600">Editar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiTrash2 className="w-3 h-3 text-red-600" />
                    <span className="text-red-600">Eliminar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiShield className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-600">Gestionar</span>
                  </div>
                </div>
              </div>

              {/* Lista de permisos agrupados */}
              <div className="border border-gray-300 rounded-lg max-h-[400px] overflow-y-auto">
                {Object.entries(permisosFiltrados()).length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FiSearch className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No se encontraron permisos</p>
                  </div>
                ) : (
                  Object.entries(permisosFiltrados()).map(([recurso, permisosRecurso]) => {
                    const permisosIds = permisosRecurso.map(p => p.id);
                    const todosMarcados = permisosIds.every(id => formData.permisos_ids.includes(id));
                    const algunosMarcados = permisosIds.some(id => formData.permisos_ids.includes(id));

                    return (
                      <div key={recurso} className="border-b border-gray-200 last:border-b-0">
                        {/* Encabezado del recurso */}
                        <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center sticky top-0 z-10">
                          <input
                            type="checkbox"
                            checked={todosMarcados}
                            ref={input => {
                              if (input) input.indeterminate = algunosMarcados && !todosMarcados;
                            }}
                            onChange={() => handleRecursoToggle(recurso)}
                            disabled={loading}
                            className="rounded border-white text-white focus:ring-white focus:ring-offset-primary h-5 w-5"
                          />
                          <span className="ml-3 font-semibold text-white text-base">
                            {getNombreRecurso(recurso)}
                          </span>
                          <span className="ml-auto text-xs text-white/90 bg-white/20 px-2 py-1 rounded">
                            {permisosIds.filter(id => formData.permisos_ids.includes(id)).length} / {permisosIds.length}
                          </span>
                        </div>

                        {/* Lista de permisos del recurso */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permisosRecurso.map(permiso => {
                            const isChecked = formData.permisos_ids.includes(permiso.id);
                            const colorClasses = getColorAccion(permiso.accion);
                            
                            return (
                              <label
                                key={permiso.id}
                                className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  isChecked 
                                    ? 'border-primary bg-primary/5 shadow-sm' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermisoToggle(permiso.id)}
                                  disabled={loading}
                                  className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary h-5 w-5 flex-shrink-0"
                                />
                                <div className="ml-3 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center justify-center p-1.5 rounded ${colorClasses}`}>
                                      {getIconoAccion(permiso.accion)}
                                    </span>
                                    <span className={`font-medium text-sm ${isChecked ? 'text-primary' : 'text-gray-900'}`}>
                                      {getNombreAccion(permiso.accion)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 leading-tight">
                                    {permiso.descripcion}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
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
