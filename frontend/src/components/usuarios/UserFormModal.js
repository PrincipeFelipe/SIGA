import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiX, FiChevronDown, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usuariosService, unidadesService } from '../../services';
import { Modal, Input } from '../common';

/**
 * UserFormModal - Modal para crear y editar usuarios
 * @param {boolean} readOnly - Si es true, el modal se abre en modo solo lectura
 */
const UserFormModal = ({ isOpen, onClose, user, onSuccess, readOnly = false }) => {
  const isEditMode = Boolean(user);

  const [submitting, setSubmitting] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [searchUnidad, setSearchUnidad] = useState('');
  const [showUnidadDropdown, setShowUnidadDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    nombre_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    unidad_destino_id: '',
    activo: true,
    require_password_change: false
  });

  const [errors, setErrors] = useState({});

  // Cargar unidades
  useEffect(() => {
    if (isOpen) {
      cargarUnidades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cargar datos si es edición
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        username: user.username || '',
        nombre_completo: user.nombre_completo || '',
        email: user.email || '',
        password: '', // No mostramos la contraseña
        confirmPassword: '',
        unidad_destino_id: user.unidad_destino_id || '',
        activo: user.activo !== undefined ? user.activo : true,
        require_password_change: user.require_password_change || false
      });
    } else if (isOpen) {
      // Resetear formulario en modo creación
      setFormData({
        username: '',
        nombre_completo: '',
        email: '',
        password: '',
        confirmPassword: '',
        unidad_destino_id: '',
        activo: true,
        require_password_change: false
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const cargarUnidades = async () => {
    try {
      // Obtener solo unidades activas
      const response = await unidadesService.getTree();
      // Filtrar unidades activas y aplanar el árbol
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
      const unidadesActivas = aplanarUnidades(response);
      setUnidades(unidadesActivas);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      toast.error('Error al cargar la lista de unidades');
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUnidadDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener unidad seleccionada actual
  const getSelectedUnidad = () => {
    if (!formData.unidad_destino_id) return null;
    return unidades.find(u => u.id === parseInt(formData.unidad_destino_id));
  };

  // Filtrar unidades según búsqueda
  const getFilteredUnidades = () => {
    return unidades.filter(unidad => 
      searchUnidad === '' || 
      unidad.nombre.toLowerCase().includes(searchUnidad.toLowerCase()) ||
      (unidad.codigo_unidad && unidad.codigo_unidad.toLowerCase().includes(searchUnidad.toLowerCase())) ||
      (unidad.tipo_unidad && unidad.tipo_unidad.toLowerCase().includes(searchUnidad.toLowerCase()))
    );
  };

  // Manejar selección de unidad
  const handleSelectUnidad = (unidadId) => {
    setFormData(prev => ({ ...prev, unidad_destino_id: unidadId }));
    setShowUnidadDropdown(false);
    setSearchUnidad('');
    if (errors.unidad_destino_id) {
      setErrors(prev => ({ ...prev, unidad_destino_id: '' }));
    }
  };

  // Abrir dropdown y enfocar búsqueda
  const handleOpenDropdown = () => {
    if (!readOnly) {
      setShowUnidadDropdown(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Username
    if (!formData.username.trim()) {
      nuevosErrores.username = 'El nombre de usuario es requerido';
    } else if (formData.username.trim().length < 3) {
      nuevosErrores.username = 'El usuario debe tener al menos 3 caracteres';
    }

    // Nombre completo
    if (!formData.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = 'El nombre completo es requerido';
    }

    // Email
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    // Unidad
    if (!formData.unidad_destino_id) {
      nuevosErrores.unidad_destino_id = 'Debe seleccionar una unidad';
    }

    // Password (solo en creación o si se proporciona en edición)
    if (!isEditMode) {
      // Modo creación: password es obligatorio
      if (!formData.password) {
        nuevosErrores.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else {
      // Modo edición: validar solo si se proporciona
      if (formData.password && formData.password.length < 8) {
        nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setSubmitting(true);

      const dataToSend = {
        username: formData.username,
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        unidad_destino_id: parseInt(formData.unidad_destino_id),
        activo: formData.activo,
        require_password_change: formData.require_password_change
      };

      // Incluir password solo si se proporciona
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      if (isEditMode) {
        await usuariosService.actualizar(user.id, dataToSend);
        toast.success('Usuario actualizado correctamente');
      } else {
        await usuariosService.crear(dataToSend);
        toast.success('Usuario creado correctamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const mensaje = error.response?.data?.message || 'Error al guardar el usuario';
      toast.error(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? 'Ver Detalle de Usuario' : (isEditMode ? 'Editar Usuario' : 'Nuevo Usuario')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mensaje informativo para modo lectura */}
        {readOnly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Modo solo lectura</p>
              <p className="text-xs text-blue-700 mt-1">
                Solo puedes visualizar la información de este usuario. No tienes permisos para editarlo.
              </p>
            </div>
          </div>
        )}

        {/* Username */}
        <Input
          label="Nombre de Usuario *"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="Ej: jdoe"
          disabled={isEditMode || readOnly} // No se puede cambiar en edición o lectura
        />

        {/* Nombre Completo */}
        <Input
          label="Nombre Completo *"
          name="nombre_completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          error={errors.nombre_completo}
          placeholder="Ej: Juan Pérez García"
          disabled={readOnly}
        />

        {/* Email */}
        <Input
          label="Email *"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="usuario@ejemplo.com"
          disabled={readOnly}
        />

        {/* Unidad de Destino - Select con búsqueda integrada */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unidad de Destino *
          </label>
          
          {/* Botón que muestra la unidad seleccionada */}
          <button
            type="button"
            onClick={handleOpenDropdown}
            disabled={readOnly}
            className={`w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent flex items-center justify-between ${
              errors.unidad_destino_id 
                ? 'border-red-500' 
                : 'border-gray-300'
            } ${
              readOnly 
                ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
                : 'bg-white hover:border-gray-400 cursor-pointer'
            }`}
          >
            <span className={getSelectedUnidad() ? 'text-gray-900' : 'text-gray-400'}>
              {getSelectedUnidad() 
                ? `${getSelectedUnidad().tipo_unidad} - ${getSelectedUnidad().nombre} ${getSelectedUnidad().codigo_unidad ? `(${getSelectedUnidad().codigo_unidad})` : ''}`
                : '-- Seleccionar unidad --'
              }
            </span>
            <FiChevronDown className={`ml-2 transition-transform ${showUnidadDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown con búsqueda */}
          {showUnidadDropdown && !readOnly && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Input de búsqueda dentro del dropdown */}
              <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar unidad..."
                    value={searchUnidad}
                    onChange={(e) => setSearchUnidad(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              {/* Lista de opciones */}
              <div className="max-h-64 overflow-y-auto">
                {getFilteredUnidades().length > 0 ? (
                  getFilteredUnidades().map((unidad) => (
                    <button
                      key={unidad.id}
                      type="button"
                      onClick={() => handleSelectUnidad(unidad.id)}
                      className={`w-full text-left px-4 py-2 hover:bg-primary hover:text-white transition-colors ${
                        formData.unidad_destino_id === unidad.id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-gray-900'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {unidad.tipo_unidad} - {unidad.nombre}
                        </span>
                        {unidad.codigo_unidad && (
                          <span className="text-xs text-gray-500">
                            Código: {unidad.codigo_unidad}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <FiSearch className="mx-auto mb-2 text-gray-300" size={32} />
                    <p>No se encontraron unidades</p>
                    {searchUnidad && (
                      <p className="text-xs mt-1">
                        Intenta con otro término de búsqueda
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Contador */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                {getFilteredUnidades().length} de {unidades.length} unidades
              </div>
            </div>
          )}
          
          {errors.unidad_destino_id && (
            <p className="text-red-500 text-sm mt-1">{errors.unidad_destino_id}</p>
          )}
        </div>

        {/* Password - Solo mostrar si NO es modo lectura */}
        {!readOnly && (
          <>
            <Input
              label={isEditMode ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Mínimo 8 caracteres"
            />

            {/* Confirm Password */}
            {formData.password && (
              <Input
                label="Confirmar Contraseña *"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Repetir contraseña"
              />
            )}
          </>
        )}

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={formData.activo}
              onChange={handleChange}
              disabled={readOnly}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="activo" className={`ml-2 text-sm ${readOnly ? 'text-gray-500' : 'text-gray-700'}`}>
              Usuario activo
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="require_password_change"
              id="require_password_change"
              checked={formData.require_password_change}
              onChange={handleChange}
              disabled={readOnly}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="require_password_change" className={`ml-2 text-sm ${readOnly ? 'text-gray-500' : 'text-gray-700'}`}>
              Requerir cambio de contraseña en el próximo login
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiX size={18} />
            {readOnly ? 'Cerrar' : 'Cancelar'}
          </button>
          
          {/* Botón de guardar solo si NO es modo lectura */}
          {!readOnly && (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  {isEditMode ? 'Actualizar' : 'Crear'} Usuario
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
