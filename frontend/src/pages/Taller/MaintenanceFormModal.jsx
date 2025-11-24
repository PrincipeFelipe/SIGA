import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import mantenimientosService from '../../services/mantenimientosService';
import vehiculosService from '../../services/vehiculosService';
import tiposMantenimientoService from '../../services/tiposMantenimientoService';
import Swal from 'sweetalert2';

const MaintenanceFormModal = ({ mantenimiento, onClose }) => {
  const isEdit = !!mantenimiento;
  const [loading, setLoading] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
  const [formData, setFormData] = useState({
    vehiculo_id: '',
    tipo_mantenimiento_id: '',
    fecha_realizado: new Date().toISOString().split('T')[0],
    kilometraje_realizado: '',
    costo_realizado: '',
    numero_factura: '',
    observaciones: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    cargarCatalogos();
    if (isEdit && mantenimiento) {
      setFormData({
        vehiculo_id: mantenimiento.vehiculo_id || '',
        tipo_mantenimiento_id: mantenimiento.tipo_mantenimiento_id || '',
        fecha_realizado: mantenimiento.fecha_realizado?.split('T')[0] || '',
        kilometraje_realizado: mantenimiento.kilometraje_realizado || '',
        costo_realizado: mantenimiento.costo_realizado || '',
        numero_factura: mantenimiento.numero_factura || '',
        observaciones: mantenimiento.observaciones || ''
      });
    }
  }, [isEdit, mantenimiento]);

  const cargarCatalogos = async () => {
    try {
      const [vehiculosRes, tiposRes] = await Promise.all([
        vehiculosService.obtenerVehiculos(),
        tiposMantenimientoService.obtenerTiposActivos()
      ]);
      setVehiculos(vehiculosRes.data || []);
      setTiposMantenimiento(tiposRes.data || []);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los catálogos'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.vehiculo_id) {
      newErrors.vehiculo_id = 'El vehículo es obligatorio';
    }
    if (!formData.tipo_mantenimiento_id) {
      newErrors.tipo_mantenimiento_id = 'El tipo de mantenimiento es obligatorio';
    }
    if (!formData.fecha_realizado) {
      newErrors.fecha_realizado = 'La fecha es obligatoria';
    }
    if (!formData.kilometraje_realizado || formData.kilometraje_realizado <= 0) {
      newErrors.kilometraje_realizado = 'El kilometraje debe ser mayor a 0';
    }
    if (formData.costo_realizado && formData.costo_realizado < 0) {
      newErrors.costo_realizado = 'El costo no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para enviar
      const datos = {
        ...formData,
        kilometraje_realizado: parseInt(formData.kilometraje_realizado),
        costo_realizado: formData.costo_realizado ? parseFloat(formData.costo_realizado) : null
      };

      if (isEdit) {
        await mantenimientosService.actualizarMantenimiento(mantenimiento.id, datos);
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El mantenimiento ha sido actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const response = await mantenimientosService.crearMantenimiento(datos);
        
        // Mostrar información del próximo mantenimiento
        if (response.data) {
          const { proximo_kilometraje, proxima_fecha } = response.data;
          let proximoInfo = '';
          
          if (proximo_kilometraje) {
            proximoInfo += `<p><strong>Próximo kilometraje:</strong> ${proximo_kilometraje.toLocaleString('es-ES')} km</p>`;
          }
          if (proxima_fecha) {
            proximoInfo += `<p><strong>Próxima fecha:</strong> ${new Date(proxima_fecha).toLocaleDateString('es-ES')}</p>`;
          }

          await Swal.fire({
            icon: 'success',
            title: 'Mantenimiento Registrado',
            html: `
              <p class="mb-4">El mantenimiento ha sido registrado correctamente</p>
              ${proximoInfo ? `<div class="bg-blue-50 p-4 rounded-lg text-left">${proximoInfo}</div>` : ''}
            `,
            confirmButtonText: 'Entendido'
          });
        }
      }

      onClose(true);
    } catch (error) {
      console.error('Error guardando mantenimiento:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo guardar el mantenimiento'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => onClose(false)}
      title={isEdit ? 'Editar Mantenimiento' : 'Registrar Mantenimiento'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehículo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehículo <span className="text-red-500">*</span>
          </label>
          <select
            name="vehiculo_id"
            value={formData.vehiculo_id}
            onChange={handleChange}
            className={`input-field ${errors.vehiculo_id ? 'border-red-500' : ''}`}
            disabled={isEdit}
          >
            <option value="">Selecciona un vehículo</option>
            {vehiculos.map(v => (
              <option key={v.id} value={v.id}>
                {v.matricula} - {v.marca} {v.modelo}
              </option>
            ))}
          </select>
          {errors.vehiculo_id && (
            <p className="text-red-500 text-sm mt-1">{errors.vehiculo_id}</p>
          )}
        </div>

        {/* Tipo de Mantenimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Mantenimiento <span className="text-red-500">*</span>
          </label>
          <select
            name="tipo_mantenimiento_id"
            value={formData.tipo_mantenimiento_id}
            onChange={handleChange}
            className={`input-field ${errors.tipo_mantenimiento_id ? 'border-red-500' : ''}`}
          >
            <option value="">Selecciona un tipo</option>
            {tiposMantenimiento.map(t => (
              <option key={t.id} value={t.id}>
                {t.nombre} ({t.categoria})
              </option>
            ))}
          </select>
          {errors.tipo_mantenimiento_id && (
            <p className="text-red-500 text-sm mt-1">{errors.tipo_mantenimiento_id}</p>
          )}
        </div>

        {/* Fecha y Kilometraje */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha Realizado"
            type="date"
            name="fecha_realizado"
            value={formData.fecha_realizado}
            onChange={handleChange}
            error={errors.fecha_realizado}
            required
          />
          <Input
            label="Kilometraje"
            type="number"
            name="kilometraje_realizado"
            value={formData.kilometraje_realizado}
            onChange={handleChange}
            error={errors.kilometraje_realizado}
            placeholder="Ej: 45000"
            required
          />
        </div>

        {/* Costo y Factura */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Costo (€)"
            type="number"
            step="0.01"
            name="costo_realizado"
            value={formData.costo_realizado}
            onChange={handleChange}
            error={errors.costo_realizado}
            placeholder="Ej: 150.50"
          />
          <Input
            label="Número de Factura"
            type="text"
            name="numero_factura"
            value={formData.numero_factura}
            onChange={handleChange}
            placeholder="Ej: F-2025-001"
          />
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="input-field"
            rows={3}
            placeholder="Detalles adicionales del mantenimiento..."
          />
        </div>

        {/* Información adicional para edición */}
        {isEdit && mantenimiento && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">
              Próximo Mantenimiento Calculado:
            </h4>
            {mantenimiento.proximo_kilometraje && (
              <p className="text-sm text-blue-800">
                • {mantenimiento.proximo_kilometraje.toLocaleString('es-ES')} km
              </p>
            )}
            {mantenimiento.proxima_fecha && (
              <p className="text-sm text-blue-800">
                • {new Date(mantenimiento.proxima_fecha).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Actualizar' : 'Registrar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MaintenanceFormModal;
