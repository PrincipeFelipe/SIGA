import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { unidadesService } from '../../services';
import { Modal, Input } from '../common';

/**
 * UnitFormModal - Modal para crear y editar unidades
 */
const UnitFormModal = ({ isOpen, onClose, unit, parentUnit, onSuccess }) => {
  const isEditMode = Boolean(unit);

  const [submitting, setSubmitting] = useState(false);
  const [unidades, setUnidades] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    codigo_unidad: '',
    tipo_unidad: '',
    parent_id: '',
    ubicacion: '',
    descripcion: '',
    activo: true
  });

  const [errors, setErrors] = useState({});

  // Cargar lista de unidades para el selector
  useEffect(() => {
    if (isOpen) {
      cargarUnidades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cargar datos si es edición
  useEffect(() => {
    if (isOpen && unit) {
      setFormData({
        nombre: unit.nombre || '',
        codigo_unidad: unit.codigo_unidad || '',
        tipo_unidad: unit.tipo_unidad || '',
        parent_id: unit.parent_id || '',
        ubicacion: unit.ubicacion || '',
        descripcion: unit.descripcion || '',
        activo: unit.activo !== undefined ? unit.activo : true
      });
    } else if (isOpen && parentUnit) {
      // Si tiene padre, pre-seleccionar
      setFormData(prev => ({
        ...prev,
        parent_id: parentUnit.id
      }));
    }
  }, [isOpen, unit, parentUnit]);

  const cargarUnidades = async () => {
    try {
      const data = await unidadesService.getFlat();
      // Filtrar la unidad actual si estamos editando
      const unidadesFiltradas = unit
        ? data.filter(u => u.id !== unit.id)
        : data;
      setUnidades(unidadesFiltradas);
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

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.tipo_unidad) {
      nuevosErrores.tipo_unidad = 'El tipo de unidad es requerido';
    }

    // Validar que tipos no-Zona tengan parent_id
    if (formData.tipo_unidad && formData.tipo_unidad !== 'Zona' && !formData.parent_id) {
      nuevosErrores.parent_id = 'Debe seleccionar una unidad superior';
    }

    if (formData.codigo_unidad && formData.codigo_unidad.trim().length < 2) {
      nuevosErrores.codigo_unidad = 'El código debe tener al menos 2 caracteres';
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
        nombre: formData.nombre,
        tipo_unidad: formData.tipo_unidad,
        codigo_unidad: formData.codigo_unidad || null,
        parent_id: formData.parent_id || null,
        descripcion: formData.descripcion || null,
        activo: formData.activo
      };

      if (isEditMode) {
        await unidadesService.update(unit.id, dataToSend);
        toast.success('Unidad actualizada correctamente');
      } else {
        await unidadesService.create(dataToSend);
        toast.success('Unidad creada correctamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar unidad:', error);
      const mensaje = error.response?.data?.message || 'Error al guardar la unidad';
      toast.error(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Unidad' : 'Nueva Unidad'}
      size="lg"
    >
      {/* Información de unidad padre */}
      {parentUnit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800 text-sm">
            <strong>Sub-unidad de:</strong> {parentUnit.nombre}
            {parentUnit.codigo_unidad && ` (${parentUnit.codigo_unidad})`}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <Input
          label="Nombre de la Unidad *"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={errors.nombre}
          placeholder="Ej: Comandancia de Madrid"
        />

        {/* Código Unidad */}
        <Input
          label="Código de Unidad"
          name="codigo_unidad"
          value={formData.codigo_unidad}
          onChange={handleChange}
          error={errors.codigo_unidad}
          placeholder="Ej: CMD-MAD"
        />

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Unidad *
            </label>
            <select
              name="tipo_unidad"
              value={formData.tipo_unidad}
              onChange={handleChange}
              className={`input-field ${errors.tipo_unidad ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar tipo</option>
              <option value="Zona">Zona</option>
              <option value="Comandancia">Comandancia</option>
              <option value="Compañia">Compañía</option>
              <option value="Puesto">Puesto</option>
            </select>
            {errors.tipo_unidad && (
              <p className="text-red-500 text-xs mt-1">{errors.tipo_unidad}</p>
            )}
          </div>

          {/* Unidad Superior */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad Superior {formData.tipo_unidad !== 'Zona' && '*'}
            </label>
            <select
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className={`input-field ${errors.parent_id ? 'border-red-500' : ''}`}
              disabled={Boolean(parentUnit) || formData.tipo_unidad === 'Zona'}
            >
              <option value="">Sin unidad superior (raíz)</option>
              {unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre} {unidad.codigo_unidad ? `(${unidad.codigo_unidad})` : ''}
                </option>
              ))}
            </select>
            {errors.parent_id && (
              <p className="text-red-500 text-xs mt-1">{errors.parent_id}</p>
            )}
            {parentUnit && (
              <p className="text-xs text-gray-500 mt-1">
                Heredada de la navegación
              </p>
            )}
            {formData.tipo_unidad === 'Zona' && (
              <p className="text-xs text-gray-500 mt-1">
                Las Zonas no tienen unidad superior
              </p>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <Input
          label="Ubicación"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          placeholder="Ej: Calle Mayor 25, Madrid"
        />

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="input-field resize-none"
            placeholder="Descripción o notas adicionales..."
          />
        </div>

        {/* Estado Activo */}
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
            Unidad activa
          </label>
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
                {isEditMode ? 'Actualizar' : 'Crear'} Unidad
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UnitFormModal;
