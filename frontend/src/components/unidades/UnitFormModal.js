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
    tipo: '',
    unidad_superior_id: '',
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
        tipo: unit.tipo || '',
        unidad_superior_id: unit.unidad_superior_id || '',
        ubicacion: unit.ubicacion || '',
        descripcion: unit.descripcion || '',
        activo: unit.activo !== undefined ? unit.activo : true
      });
    } else if (isOpen && parentUnit) {
      // Si tiene padre, pre-seleccionar
      setFormData(prev => ({
        ...prev,
        unidad_superior_id: parentUnit.id
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
        ...formData,
        unidad_superior_id: formData.unidad_superior_id || null
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
              Tipo de Unidad
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Seleccionar tipo</option>
              <option value="Dirección General">Dirección General</option>
              <option value="Comandancia">Comandancia</option>
              <option value="Compañía">Compañía</option>
              <option value="Puesto">Puesto</option>
              <option value="Sección">Sección</option>
              <option value="Unidad Especial">Unidad Especial</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Unidad Superior */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad Superior
            </label>
            <select
              name="unidad_superior_id"
              value={formData.unidad_superior_id}
              onChange={handleChange}
              className="input-field"
              disabled={Boolean(parentUnit)}
            >
              <option value="">Sin unidad superior (raíz)</option>
              {unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre} {unidad.codigo_unidad ? `(${unidad.codigo_unidad})` : ''}
                </option>
              ))}
            </select>
            {parentUnit && (
              <p className="text-xs text-gray-500 mt-1">
                Heredada de la navegación
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
