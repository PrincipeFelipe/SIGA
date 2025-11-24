import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import tiposMantenimientoService from '../../services/tiposMantenimientoService';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Swal from 'sweetalert2';

const MaintenanceTypesPage = () => {
  const { hasPermission } = usePermissions();
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'general',
    prioridad: 'normal',
    frecuencia_km: '',
    frecuencia_meses: '',
    margen_km_aviso: '1000',
    margen_dias_aviso: '30',
    costo_estimado: '',
    activo: true
  });
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const categorias = [
    { value: 'motor', label: 'Motor', icon: '🔧' },
    { value: 'frenos', label: 'Frenos', icon: '🛑' },
    { value: 'neumaticos', label: 'Neumáticos', icon: '🚗' },
    { value: 'fluidos', label: 'Fluidos', icon: '💧' },
    { value: 'filtros', label: 'Filtros', icon: '🔩' },
    { value: 'electrico', label: 'Eléctrico', icon: '⚡' },
    { value: 'general', label: 'General', icon: '📋' }
  ];

  const prioridades = [
    { value: 'critico', label: 'Crítico', color: 'danger' },
    { value: 'importante', label: 'Importante', color: 'warning' },
    { value: 'normal', label: 'Normal', color: 'info' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await tiposMantenimientoService.obtenerTiposMantenimiento();
      setTipos(response.data || []);
    } catch (error) {
      console.error('Error cargando tipos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los tipos de mantenimiento'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = () => {
    setSelectedTipo(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: 'general',
      prioridad: 'normal',
      frecuencia_km: '',
      frecuencia_meses: '',
      margen_km_aviso: '1000',
      margen_dias_aviso: '30',
      costo_estimado: '',
      activo: true
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEditar = (tipo) => {
    setSelectedTipo(tipo);
    setFormData({
      nombre: tipo.nombre || '',
      descripcion: tipo.descripcion || '',
      categoria: tipo.categoria || 'general',
      prioridad: tipo.prioridad || 'normal',
      frecuencia_km: tipo.frecuencia_km || '',
      frecuencia_meses: tipo.frecuencia_meses || '',
      margen_km_aviso: tipo.margen_km_aviso || '1000',
      margen_dias_aviso: tipo.margen_dias_aviso || '30',
      costo_estimado: tipo.costo_estimado || '',
      activo: tipo.activo !== undefined ? tipo.activo : true
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.nombre || formData.nombre.trim() === '') {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    // Al menos una frecuencia debe estar definida
    if (!formData.frecuencia_km && !formData.frecuencia_meses) {
      newErrors.frecuencia = 'Debe definir al menos una frecuencia (km o meses)';
    }

    if (formData.frecuencia_km && formData.frecuencia_km <= 0) {
      newErrors.frecuencia_km = 'La frecuencia en km debe ser mayor a 0';
    }

    if (formData.frecuencia_meses && formData.frecuencia_meses <= 0) {
      newErrors.frecuencia_meses = 'La frecuencia en meses debe ser mayor a 0';
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
      setFormLoading(true);

      const datos = {
        ...formData,
        frecuencia_km: formData.frecuencia_km ? parseInt(formData.frecuencia_km) : null,
        frecuencia_meses: formData.frecuencia_meses ? parseInt(formData.frecuencia_meses) : null,
        margen_km_aviso: formData.margen_km_aviso ? parseInt(formData.margen_km_aviso) : null,
        margen_dias_aviso: formData.margen_dias_aviso ? parseInt(formData.margen_dias_aviso) : null,
        costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : null
      };

      if (selectedTipo) {
        await tiposMantenimientoService.actualizarTipoMantenimiento(selectedTipo.id, datos);
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El tipo de mantenimiento ha sido actualizado',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await tiposMantenimientoService.crearTipoMantenimiento(datos);
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'El tipo de mantenimiento ha sido creado',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setIsModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando tipo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo guardar el tipo de mantenimiento'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActivo = async (tipo) => {
    try {
      await tiposMantenimientoService.actualizarTipoMantenimiento(tipo.id, {
        ...tipo,
        activo: !tipo.activo
      });
      Swal.fire({
        icon: 'success',
        title: tipo.activo ? 'Desactivado' : 'Activado',
        timer: 1500,
        showConfirmButton: false
      });
      cargarDatos();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado'
      });
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás eliminar si hay mantenimientos asociados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await tiposMantenimientoService.eliminarTipoMantenimiento(id);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El tipo de mantenimiento ha sido eliminado',
          timer: 2000,
          showConfirmButton: false
        });
        cargarDatos();
      } catch (error) {
        console.error('Error eliminando tipo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo eliminar el tipo de mantenimiento'
        });
      }
    }
  };

  const getCategoriaIcon = (categoria) => {
    const cat = categorias.find(c => c.value === categoria);
    return cat ? cat.icon : '📋';
  };

  const canCreate = hasPermission('maintenance_types:create');
  const canEdit = hasPermission('maintenance_types:edit');
  const canDelete = hasPermission('maintenance_types:delete');

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">
            Tipos de Mantenimiento
          </h1>
          <p className="text-gray-600 mt-1">
            Configuración de mantenimientos y frecuencias
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCrear} variant="primary">
            <span className="mr-2">+</span>
            Nuevo Tipo
          </Button>
        )}
      </div>

      {/* Grid de Tipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tipos.map((tipo) => {
          const prioridad = prioridades.find(p => p.value === tipo.prioridad);
          
          return (
            <Card key={tipo.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoriaIcon(tipo.categoria)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tipo.nombre}</h3>
                    <p className="text-xs text-gray-500">{tipo.categoria}</p>
                  </div>
                </div>
                <Badge variant={tipo.activo ? 'success' : 'secondary'} size="sm">
                  {tipo.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {tipo.descripcion && (
                <p className="text-sm text-gray-600 mb-3">{tipo.descripcion}</p>
              )}

              <div className="space-y-2 mb-3">
                {tipo.frecuencia_km && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Frecuencia KM:</span>
                    <span className="font-medium">
                      {tipo.frecuencia_km.toLocaleString('es-ES')} km
                    </span>
                  </div>
                )}
                {tipo.frecuencia_meses && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Frecuencia Tiempo:</span>
                    <span className="font-medium">{tipo.frecuencia_meses} meses</span>
                  </div>
                )}
                {tipo.costo_estimado && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Costo Estimado:</span>
                    <span className="font-medium">{parseFloat(tipo.costo_estimado).toFixed(2)} €</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <Badge variant={prioridad?.color || 'info'} size="sm">
                  {prioridad?.label || tipo.prioridad}
                </Badge>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                {canEdit && (
                  <>
                    <Button
                      onClick={() => handleEditar(tipo)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      onClick={() => handleToggleActivo(tipo)}
                      variant={tipo.activo ? 'secondary' : 'primary'}
                      size="sm"
                    >
                      {tipo.activo ? '🚫' : '✅'}
                    </Button>
                  </>
                )}
                {canDelete && (
                  <Button
                    onClick={() => handleEliminar(tipo.id)}
                    variant="danger"
                    size="sm"
                  >
                    🗑️
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {tipos.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay tipos de mantenimiento
            </h3>
            <p className="text-gray-500 mb-4">
              Crea el primer tipo de mantenimiento para comenzar
            </p>
            {canCreate && (
              <Button onClick={handleCrear} variant="primary">
                Crear Tipo de Mantenimiento
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Modal de Formulario */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={selectedTipo ? 'Editar Tipo de Mantenimiento' : 'Nuevo Tipo de Mantenimiento'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
              required
              placeholder="Ej: Cambio de aceite"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="input-field"
                rows={2}
                placeholder="Descripción opcional del mantenimiento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="input-field"
                >
                  {categorias.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  className="input-field"
                >
                  {prioridades.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errors.frecuencia && (
              <p className="text-red-500 text-sm">{errors.frecuencia}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Frecuencia (KM)"
                type="number"
                name="frecuencia_km"
                value={formData.frecuencia_km}
                onChange={handleChange}
                error={errors.frecuencia_km}
                placeholder="Ej: 15000"
              />
              <Input
                label="Frecuencia (Meses)"
                type="number"
                name="frecuencia_meses"
                value={formData.frecuencia_meses}
                onChange={handleChange}
                error={errors.frecuencia_meses}
                placeholder="Ej: 12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Margen Aviso (KM)"
                type="number"
                name="margen_km_aviso"
                value={formData.margen_km_aviso}
                onChange={handleChange}
                placeholder="Ej: 1000"
              />
              <Input
                label="Margen Aviso (Días)"
                type="number"
                name="margen_dias_aviso"
                value={formData.margen_dias_aviso}
                onChange={handleChange}
                placeholder="Ej: 30"
              />
            </div>

            <Input
              label="Costo Estimado (€)"
              type="number"
              step="0.01"
              name="costo_estimado"
              value={formData.costo_estimado}
              onChange={handleChange}
              placeholder="Ej: 75.50"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                Tipo activo
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={formLoading}>
                {selectedTipo ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </div>
    </Layout>
  );
};

export default MaintenanceTypesPage;
