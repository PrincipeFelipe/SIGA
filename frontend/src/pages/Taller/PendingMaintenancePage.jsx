import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import mantenimientosService from '../../services/mantenimientosService';
import vehiculosService from '../../services/vehiculosService';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import MaintenanceFormModal from './MaintenanceFormModal';
import Swal from 'sweetalert2';

const PendingMaintenancePage = () => {
  const { hasPermission } = usePermissions();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [filtros, setFiltros] = useState({
    vehiculo_id: '',
    estado: '',
    prioridad: '',
    categoria: ''
  });
  const [estadisticas, setEstadisticas] = useState({
    vencidos: 0,
    proximos: 0,
    total: 0
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

  const prioridades = [
    { value: 'critico', label: 'Crítico' },
    { value: 'importante', label: 'Importante' },
    { value: 'normal', label: 'Normal' }
  ];

  const estados = [
    { value: 'vencido', label: 'Vencidos' },
    { value: 'proximo', label: 'Próximos a vencer' },
    { value: 'ok', label: 'Al día' }
  ];

  useEffect(() => {
    cargarDatos();
    cargarVehiculos();
  }, [filtros]);

  const cargarVehiculos = async () => {
    try {
      const response = await vehiculosService.obtenerVehiculos();
      setVehiculos(response.data || []);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await mantenimientosService.obtenerMantenimientosPendientes(filtros);
      const data = response.data || [];
      setMantenimientos(data);

      // Calcular estadísticas
      const stats = {
        vencidos: data.filter(m => m.estado === 'vencido').length,
        proximos: data.filter(m => m.estado === 'proximo').length,
        total: data.length
      };
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando mantenimientos pendientes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los mantenimientos pendientes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      vehiculo_id: '',
      estado: '',
      prioridad: '',
      categoria: ''
    });
  };

  const handleRegistrarMantenimiento = (vehiculoId) => {
    setSelectedVehiculo(vehiculoId);
    setIsModalOpen(true);
  };

  const handleModalClose = (updated) => {
    setIsModalOpen(false);
    setSelectedVehiculo(null);
    if (updated) {
      cargarDatos();
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      vencido: { variant: 'danger', label: '🔴 Vencido' },
      proximo: { variant: 'warning', label: '🟡 Próximo' },
      ok: { variant: 'success', label: '🟢 Al día' }
    };
    return config[estado] || config.ok;
  };

  const getPrioridadBadge = (prioridad) => {
    const config = {
      critico: { variant: 'danger', label: 'CRÍTICO' },
      importante: { variant: 'warning', label: 'Importante' },
      normal: { variant: 'info', label: 'Normal' }
    };
    return config[prioridad] || config.normal;
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

  const formatearDias = (dias) => {
    if (dias === null || dias === undefined) return '-';
    if (dias < 0) return `${Math.abs(dias)} días vencido`;
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    return `En ${dias} días`;
  };

  const formatearKm = (km) => {
    if (km === null || km === undefined) return '-';
    if (km < 0) return `${Math.abs(km).toLocaleString('es-ES')} km excedidos`;
    return `${km.toLocaleString('es-ES')} km restantes`;
  };

  const canCreate = hasPermission('maintenance:create');

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
        <div>
        <h1 className="text-3xl font-heading font-bold text-text">
          Mantenimientos Pendientes
        </h1>
        <p className="text-gray-600 mt-1">
          Alertas de mantenimientos próximos a vencer o vencidos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vencidos</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {estadisticas.vencidos}
              </p>
            </div>
            <div className="text-4xl">🔴</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {estadisticas.proximos}
              </p>
            </div>
            <div className="text-4xl">🟡</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alertas</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {estadisticas.total}
              </p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {estados.map(e => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={filtros.prioridad}
              onChange={(e) => handleFiltroChange('prioridad', e.target.value)}
              className="input-field"
            >
              <option value="">Todas</option>
              {prioridades.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
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
        </div>

        {(filtros.vehiculo_id || filtros.estado || filtros.prioridad || filtros.categoria) && (
          <div className="mt-4">
            <Button onClick={limpiarFiltros} variant="secondary" size="sm">
              Limpiar Filtros
            </Button>
          </div>
        )}
      </Card>

      {/* Lista de Mantenimientos Pendientes */}
      <Card>
        {mantenimientos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ¡Todos los mantenimientos al día!
            </h3>
            <p className="text-gray-500">
              No hay mantenimientos pendientes o próximos a vencer
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mantenimientos.map((mant) => {
              const estadoBadge = getEstadoBadge(mant.estado);
              const prioridadBadge = getPrioridadBadge(mant.prioridad);

              return (
                <div
                  key={mant.id}
                  className={`border-l-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow ${
                    mant.estado === 'vencido'
                      ? 'border-red-500'
                      : mant.estado === 'proximo'
                      ? 'border-yellow-500'
                      : 'border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {mant.vehiculo_matricula}
                        </h3>
                        <Badge variant={estadoBadge.variant} size="sm">
                          {estadoBadge.label}
                        </Badge>
                        <Badge variant={prioridadBadge.variant} size="sm">
                          {prioridadBadge.label}
                        </Badge>
                      </div>

                      {/* Información del vehículo */}
                      <p className="text-sm text-gray-600 mb-2">
                        {mant.vehiculo_marca} {mant.vehiculo_modelo} - {mant.unidad_nombre}
                      </p>

                      {/* Tipo de mantenimiento */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-900">
                          {mant.tipo_mantenimiento}
                        </span>
                        <Badge variant={getCategoriaColor(mant.categoria)} size="sm">
                          {mant.categoria}
                        </Badge>
                      </div>

                      {/* Último mantenimiento */}
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Último mantenimiento:</strong>
                        {mant.ultima_fecha && (
                          <span className="ml-2">
                            {new Date(mant.ultima_fecha).toLocaleDateString('es-ES')}
                          </span>
                        )}
                        {mant.ultimo_kilometraje && (
                          <span className="ml-2">
                            ({mant.ultimo_kilometraje.toLocaleString('es-ES')} km)
                          </span>
                        )}
                        {!mant.ultima_fecha && !mant.ultimo_kilometraje && (
                          <span className="ml-2 text-red-600">Nunca realizado</span>
                        )}
                      </div>

                      {/* Alertas */}
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {mant.estado_km !== 'ok' && (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">Por Kilometraje:</p>
                            <p className={`text-sm font-medium ${
                              mant.estado_km === 'vencido' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {formatearKm(mant.km_restantes)}
                            </p>
                            {mant.proximo_kilometraje && (
                              <p className="text-xs text-gray-500 mt-1">
                                Próximo: {mant.proximo_kilometraje.toLocaleString('es-ES')} km
                              </p>
                            )}
                          </div>
                        )}

                        {mant.estado_fecha !== 'ok' && (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">Por Fecha:</p>
                            <p className={`text-sm font-medium ${
                              mant.estado_fecha === 'vencido' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {formatearDias(mant.dias_restantes)}
                            </p>
                            {mant.proxima_fecha && (
                              <p className="text-xs text-gray-500 mt-1">
                                Próxima: {new Date(mant.proxima_fecha).toLocaleDateString('es-ES')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acción */}
                    {canCreate && (
                      <div className="ml-4">
                        <Button
                          onClick={() => handleRegistrarMantenimiento(mant.vehiculo_id)}
                          variant="primary"
                          size="sm"
                        >
                          Registrar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <MaintenanceFormModal
          mantenimiento={selectedVehiculo ? { vehiculo_id: selectedVehiculo } : null}
          onClose={handleModalClose}
        />
      )}
      </div>
    </Layout>
  );
};

export default PendingMaintenancePage;
