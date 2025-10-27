import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usuariosService, unidadesService } from '../../services';
import { Modal, Input } from '../common';

/**
 * UserFormModal - Modal para crear y editar usuarios
 */
const UserFormModal = ({ isOpen, onClose, user, onSuccess }) => {
  const isEditMode = Boolean(user);

  const [submitting, setSubmitting] = useState(false);
  const [unidades, setUnidades] = useState([]);

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
      const data = await unidadesService.getFlat();
      setUnidades(data);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      toast.error('Error al cargar la lista de unidades');
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
      title={isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <Input
          label="Nombre de Usuario *"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="Ej: jdoe"
          disabled={isEditMode} // No se puede cambiar en edición
        />

        {/* Nombre Completo */}
        <Input
          label="Nombre Completo *"
          name="nombre_completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          error={errors.nombre_completo}
          placeholder="Ej: Juan Pérez García"
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
        />

        {/* Unidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unidad de Destino *
          </label>
          <select
            name="unidad_destino_id"
            value={formData.unidad_destino_id}
            onChange={handleChange}
            className={`input-field ${errors.unidad_destino_id ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccionar unidad</option>
            {unidades.map((unidad) => (
              <option key={unidad.id} value={unidad.id}>
                {unidad.nombre} {unidad.codigo_unidad ? `(${unidad.codigo_unidad})` : ''}
              </option>
            ))}
          </select>
          {errors.unidad_destino_id && (
            <p className="text-red-500 text-sm mt-1">{errors.unidad_destino_id}</p>
          )}
        </div>

        {/* Password */}
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

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
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
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="require_password_change" className="ml-2 text-sm text-gray-700">
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
            disabled={submitting}
          >
            <FiX size={18} />
            Cancelar
          </button>
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
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
