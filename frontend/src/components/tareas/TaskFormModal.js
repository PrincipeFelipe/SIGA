// ============================================================================
// MODAL DE FORMULARIO PARA TAREAS
// ============================================================================
import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Modal, Button, Input, Badge } from '../common';
import { tareasService } from '../../services';

const TaskFormModal = ({ isOpen, onClose, task, onSuccess, usuarios }) => {
  const isEditMode = !!task;
  
  const [formData, setFormData] = useState({
    titulo: '',
    numero_registro: '',
    descripcion: '',
    prioridad: 'media',
    asignado_a: '',
    es_241: false,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_limite: '',
    estado: 'pendiente',
    notas: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo || '',
        numero_registro: task.numero_registro || '',
        descripcion: task.descripcion || '',
        prioridad: task.prioridad || 'media',
        asignado_a: task.asignado_a_id || task.asignado_a || '',
        es_241: task.es_241 === 1 || task.es_241 === true,
        fecha_inicio: task.fecha_inicio ? task.fecha_inicio.split('T')[0] : new Date().toISOString().split('T')[0],
        fecha_limite: task.fecha_limite ? task.fecha_limite.split('T')[0] : '',
        estado: task.estado || 'pendiente',
        notas: task.notas || ''
      });
    }
    // eslint-disable-next-line
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si cambia es_241 a true, limpiamos fecha_limite
    if (name === 'es_241' && checked) {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        fecha_limite: '' // Se calculará automáticamente en el backend
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!formData.asignado_a) {
      newErrors.asignado_a = 'Debes asignar la tarea a un usuario';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    }

    // Solo requerir fecha_limite si NO es tarea 24.1
    if (!formData.es_241 && !formData.fecha_limite) {
      newErrors.fecha_limite = 'La fecha límite es obligatoria para tareas normales';
    }

    // Validar que fecha_limite sea posterior a fecha_inicio
    if (formData.fecha_inicio && formData.fecha_limite) {
      if (new Date(formData.fecha_limite) < new Date(formData.fecha_inicio)) {
        newErrors.fecha_limite = 'La fecha límite debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para enviar
      const dataToSend = { ...formData };
      
      // Si es tarea 24.1, NO enviar fecha_limite (el trigger la calculará)
      if (dataToSend.es_241) {
        delete dataToSend.fecha_limite;
      }

      if (isEditMode) {
        await tareasService.actualizar(task.id, dataToSend);
        toast.success('Tarea actualizada correctamente');
      } else {
        const result = await tareasService.crear(dataToSend);
        if (result.es_241_aplicado) {
          toast.success(result.message, { duration: 5000 });
        } else {
          toast.success('Tarea creada correctamente');
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      const errorMsg = error.response?.data?.message || 'Error al guardar la tarea';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <Input
          label="Título"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          error={errors.titulo}
          required
          placeholder="Título descriptivo de la tarea"
        />

        {/* Número de Registro */}
        <Input
          label="Número de Registro"
          name="numero_registro"
          value={formData.numero_registro}
          onChange={handleChange}
          placeholder="Ej: 000000000x00X0000000-X (opcional)"
          helperText="Formato alfanumérico para identificación única"
        />

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="3"
            className="input-field"
            placeholder="Descripción detallada de la tarea..."
          />
        </div>

        {/* Asignar a */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asignar a <span className="text-accent">*</span>
          </label>
          <select
            name="asignado_a"
            value={formData.asignado_a}
            onChange={handleChange}
            className={`input-field ${errors.asignado_a ? 'border-accent' : ''}`}
            required
          >
            <option value="">Selecciona un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre_completo} (@{usuario.username})
              </option>
            ))}
          </select>
          {errors.asignado_a && (
            <p className="text-xs text-accent mt-1">{errors.asignado_a}</p>
          )}
        </div>

        {/* Prioridad y Procedimiento 24.1 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              className="input-field"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div className="flex flex-col justify-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="es_241"
                checked={formData.es_241}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5"
              />
              <span className="text-sm font-medium text-gray-700">
                Procedimiento 24.1
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              Plazo automático de 90 días
            </p>
          </div>
        </div>

        {/* Aviso si es 24.1 */}
        {formData.es_241 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Procedimiento 24.1 activado
              </p>
              <p className="text-xs text-blue-700 mt-1">
                La fecha límite se calculará automáticamente como 90 días desde la fecha de inicio.
              </p>
            </div>
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha de inicio"
            name="fecha_inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={handleChange}
            error={errors.fecha_inicio}
            required
          />

          {/* Solo mostrar fecha_limite si NO es 24.1 */}
          {!formData.es_241 && (
            <Input
              label="Fecha límite"
              name="fecha_limite"
              type="date"
              value={formData.fecha_limite}
              onChange={handleChange}
              error={errors.fecha_limite}
              required={!formData.es_241}
            />
          )}
        </div>

        {/* Estado (solo en modo edición) */}
        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="input-field"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="en_revision">En Revisión</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            rows="2"
            className="input-field"
            placeholder="Notas adicionales..."
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditMode ? 'Actualizar' : 'Crear'} Tarea
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
