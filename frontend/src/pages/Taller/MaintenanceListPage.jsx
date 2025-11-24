import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import mantenimientosService from '../../services/mantenimientosService';
import vehiculosService from '../../services/vehiculosService';
import tiposMantenimientoService from '../../services/tiposMantenimientoService';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import MaintenanceFormModal from './MaintenanceFormModal';
import Swal from 'sweetalert2';

const MaintenanceListPage = () => {
  const { hasPermission } = usePermissions();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState(null);
  const [filtros, setFiltros] = useState({
    vehiculo_id: '',
    tipo_id: '',
    unidad_id: '',
    categoria: '',
    fecha_desde: '',
    fecha_hasta: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });

  const categorias = [
    { value: 'motor', label: 'Motor' },
    { value: 'frenos', label: 'Frenos' },
    { value: 'neumaticos', label: 'Neumáticos' },
    { value: 'fluidos', label: 'Fluidos' },
    { value: 'filtros', label: 'Filtros' },
    { value: 'electrico', label: 'Eléctrico' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    cargarDatos();
  }, [filtros.page]);

  useEffect(() => {
    cargarCatalogos();
  }, []);

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
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await mantenimientosService.obtenerMantenimientos(filtros);
      setMantenimientos(response.data || []);
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 1
      });
    } catch (error) {
      console.error('Error cargando mantenimientos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los mantenimientos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      page: 1 // Reset a la primera página al cambiar filtros
    }));
  };

  const aplicarFiltros = () => {
    cargarDatos();
  };

  const limpiarFiltros = () => {
    setFiltros({
      vehiculo_id: '',
      tipo_id: '',
      unidad_id: '',
      categoria: '',
      fecha_desde: '',
      fecha_hasta: '',
      page: 1,
      limit: 20
    });
    setTimeout(() => cargarDatos(), 100);
  };

  const handleCrear = () => {
    setSelectedMantenimiento(null);
    setIsModalOpen(true);
  };

  const handleEditar = (mantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setIsModalOpen(true);
  };

  const handleVer = async (id) => {
    try {
      const response = await mantenimientosService.obtenerMantenimiento(id);
      const mant = response.data;
      
      Swal.fire({
        title: '<strong>Detalle del Mantenimiento</strong>',
        html: `
          <div class="text-left space-y-2">
            <p><strong>Vehículo:</strong> ${mant.vehiculo_matricula}</p>
            <p><strong>Tipo:</strong> ${mant.tipo_mantenimiento}</p>
            <p><strong>Categoría:</strong> <span class="badge-${mant.categoria}">${mant.categoria}</span></p>
            <p><strong>Fecha:</strong> ${new Date(mant.fecha_realizado).toLocaleDateString('es-ES')}</p>
            <p><strong>Kilometraje:</strong> ${mant.kilometraje_realizado?.toLocaleString('es-ES')} km</p>
            ${mant.costo_realizado ? `<p><strong>Costo:</strong> ${mant.costo_realizado.toFixed(2)} €</p>` : ''}
            ${mant.numero_factura ? `<p><strong>Factura:</strong> ${mant.numero_factura}</p>` : ''}
            <hr class="my-3"/>
            <p><strong>Próximo Mantenimiento:</strong></p>
            ${mant.proximo_kilometraje ? `<p>• ${mant.proximo_kilometraje.toLocaleString('es-ES')} km</p>` : ''}
            ${mant.proxima_fecha ? `<p>• ${new Date(mant.proxima_fecha).toLocaleDateString('es-ES')}</p>` : ''}
            ${mant.observaciones ? `<hr class="my-3"/><p><strong>Observaciones:</strong><br/>${mant.observaciones}</p>` : ''}
            <hr class="my-3"/>
            <p class="text-sm text-gray-500">Realizado por: ${mant.usuario_nombre}</p>
            <p class="text-sm text-gray-500">Unidad: ${mant.unidad_nombre}</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        width: 600
      });
    } catch (error) {
      console.error('Error cargando detalle:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el detalle del mantenimiento'
      });
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await mantenimientosService.eliminarMantenimiento(id);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El mantenimiento ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        cargarDatos();
      } catch (error) {
        console.error('Error eliminando mantenimiento:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo eliminar el mantenimiento'
        });
      }
    }
  };

  const handleModalClose = (updated) => {
    setIsModalOpen(false);
    setSelectedMantenimiento(null);
    if (updated) {
      cargarDatos();
    }
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      motor: 'blue',
      frenos: 'red',
      neumaticos: 'purple',
      fluidos: 'cyan',
      filtros: 'yellow',
      electrico: 'orange',
      general: 'gray'
    };
    return colores[categoria] || 'gray';
  };

  const canCreate = hasPermission('maintenance:create');
  const canEdit = hasPermission('maintenance:edit');
  const canDelete = hasPermission('maintenance:delete');
  const canView = hasPermission('maintenance:view');

  if (loading && mantenimientos.length === 0) {
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
          <h1 className="text-3xl font-heading font-bold text-text">Mantenimientos</h1>
          <p className="text-gray-600 mt-1">Historial de mantenimientos realizados</p>
        </div>
        {canCreate && (
          <Button onClick={handleCrear} variant="primary">
            <span className="mr-2">+</span>
            Registrar Mantenimiento
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehículo
            </label>
            <select
              value={filtros.vehiculo_id}
              onChange={(e) => handleFiltroChange('vehiculo_id', e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.matricula} - {v.marca} {v.modelo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filtros.tipo_id}
              onChange={(e) => handleFiltroChange('tipo_id', e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {tiposMantenimiento.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              className="input-field"
            >
              <option value="">Todas</option>
              {categorias.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={aplicarFiltros} variant="primary" size="sm">
            Aplicar Filtros
          </Button>
          <Button onClick={limpiarFiltros} variant="secondary" size="sm">
            Limpiar
          </Button>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo / Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kilometraje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próximo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mantenimientos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No hay mantenimientos registrados
                  </td>
                </tr>
              ) : (
                mantenimientos.map((mant) => (
                  <tr key={mant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(mant.fecha_realizado).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {mant.vehiculo_matricula}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mant.vehiculo_marca} {mant.vehiculo_modelo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{mant.tipo_mantenimiento}</div>
                      <Badge variant={getCategoriaColor(mant.categoria)} size="sm">
                        {mant.categoria}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mant.kilometraje_realizado?.toLocaleString('es-ES')} km
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {mant.proximo_kilometraje && (
                        <div>{mant.proximo_kilometraje.toLocaleString('es-ES')} km</div>
                      )}
                      {mant.proxima_fecha && (
                        <div className="text-gray-500">
                          {new Date(mant.proxima_fecha).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mant.costo_realizado ? `${mant.costo_realizado.toFixed(2)} €` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {canView && (
                          <button
                            onClick={() => handleVer(mant.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalle"
                          >
                            👁️
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleEditar(mant)}
                            className="text-primary hover:text-primary/80"
                            title="Editar"
                          >
                            ✏️
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleEliminar(mant.id)}
                            className="text-accent hover:text-accent/80"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setFiltros(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                variant="secondary"
                size="sm"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setFiltros(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                variant="secondary"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <MaintenanceFormModal
          mantenimiento={selectedMantenimiento}
          onClose={handleModalClose}
        />
      )}
      </div>
    </Layout>
  );
};

export default MaintenanceListPage;
