import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiSearch, FiKey } from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import { Card, Badge, Loading, Button, Input } from '../../components/common';
import { UserFormModal } from '../../components/usuarios';
import { usuariosService, unidadesService } from '../../services';

const UsersListPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filtros, setFiltros] = useState({
    buscar: '', unidad_id: '', incluir_descendientes: true,
    activo: '', pagina: 1, limite: 10
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { cargarUnidades(); }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => { cargarUsuarios(); }, filtros.buscar ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [filtros]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const params = {
        search: filtros.buscar || undefined,
        unidad_id: filtros.unidad_id || undefined,
        incluir_descendientes: filtros.incluir_descendientes,
        activo: filtros.activo === '' ? undefined : filtros.activo === 'true',
        page: filtros.pagina,
        limit: filtros.limite
      };
      const result = await usuariosService.listar(params);
      setUsuarios(result.data || []);
      setPagination(result.pagination || null);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar la lista de usuarios');
    } finally { setLoading(false); }
  };

  const cargarUnidades = async () => {
    try {
      const data = await unidadesService.getFlat();
      setUnidades(data || []);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      toast.error('Error al cargar la lista de unidades');
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ buscar: '', unidad_id: '', incluir_descendientes: true, activo: '', pagina: 1, limite: 10 });
  };

  const handlePageChange = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: nuevaPagina }));
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowFormModal(true);
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setShowFormModal(true);
  };

  const handleSaveSuccess = () => {
    setShowFormModal(false);
    setEditingUser(null);
    cargarUsuarios();
  };

  const handleEliminar = async (usuario) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      html: `¿Estás seguro de que deseas eliminar al usuario <strong>${usuario.username}</strong>?<br/><small class="text-gray-500">${usuario.nombre_completo}</small>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#C8102E', cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await usuariosService.eliminar(usuario.id);
        toast.success('Usuario eliminado correctamente');
        cargarUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        toast.error(error.response?.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  const handleResetPassword = async (usuario) => {
    const result = await Swal.fire({
      title: '¿Restablecer contraseña?',
      html: `Se generará una nueva contraseña aleatoria para <strong>${usuario.username}</strong>`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#004E2E', cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, restablecer', cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        const data = await usuariosService.resetearPassword(usuario.id);
        await Swal.fire({
          title: 'Contraseña restablecida',
          html: `<div class="text-left">
            <p class="mb-2">Nueva contraseña para <strong>${usuario.username}</strong>:</p>
            <div class="bg-gray-100 p-3 rounded border border-gray-300">
              <code class="text-lg font-mono text-primary">${data.nuevaPassword}</code>
            </div>
            <p class="mt-3 text-sm text-gray-600">⚠️ El usuario deberá cambiar su contraseña en el próximo inicio de sesión.</p>
          </div>`,
          icon: 'success', confirmButtonColor: '#004E2E', confirmButtonText: 'Entendido'
        });
        toast.success('Contraseña restablecida correctamente');
        cargarUsuarios();
      } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        toast.error(error.response?.data?.message || 'Error al restablecer contraseña');
      }
    }
  };

  const renderPaginacion = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { currentPage, totalPages } = pagination;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pageNumbers.push(i);
      } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
        pageNumbers.push('...');
      }
    }
    return (
      <div className="flex justify-center items-center space-x-1 mt-4">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
          Anterior
        </button>
        {pageNumbers.map((num, idx) => (
          num === '...' ? <span key={idx} className="px-2">...</span> : (
            <button key={idx} onClick={() => handlePageChange(num)}
              className={`px-3 py-1 rounded border ${currentPage === num ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-100'}`}>
              {num}
            </button>
          )
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
          Siguiente
        </button>
      </div>
    );
  };

  if (loading && usuarios.length === 0) {
    return <Layout><Loading fullScreen /></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500 mt-1">Gestión de usuarios del sistema</p>
          </div>
          <Button variant="primary" onClick={handleCreate} icon={<FiPlus />}>Nuevo Usuario</Button>
        </div>

        <Card title="Filtros">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input label="Buscar" placeholder="Nombre, usuario o email..." value={filtros.buscar}
                onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value, pagina: 1 })} icon={<FiSearch />} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select value={filtros.unidad_id}
                onChange={(e) => setFiltros({ ...filtros, unidad_id: e.target.value, pagina: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">Todas las unidades</option>
                {unidades.map(unidad => <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={filtros.activo}
                onChange={(e) => setFiltros({ ...filtros, activo: e.target.value, pagina: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center">
              <input type="checkbox" checked={filtros.incluir_descendientes}
                onChange={(e) => setFiltros({ ...filtros, incluir_descendientes: e.target.checked, pagina: 1 })}
                className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="ml-2 text-sm text-gray-700">Incluir usuarios de unidades descendientes</span>
            </label>
            <Button variant="secondary" onClick={handleLimpiarFiltros} icon={<FiRefreshCw />}>Limpiar Filtros</Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No se encontraron usuarios</td></tr>
                ) : usuarios.map(usuario => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{usuario.nombre_completo}</div>
                        <div className="text-sm text-gray-500">@{usuario.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{usuario.email}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usuario.unidad_destino?.nombre || '-'}</div>
                      <div className="text-xs text-gray-500">{usuario.unidad_destino?.codigo_unidad || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={usuario.activo ? 'success' : 'danger'}>{usuario.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEdit(usuario)} className="text-primary hover:text-primary/80 p-1" title="Editar">
                          <FiEdit2 size={18} />
                        </button>
                        <button onClick={() => handleResetPassword(usuario)} className="text-blue-600 hover:text-blue-800 p-1" title="Restablecer contraseña">
                          <FiKey size={18} />
                        </button>
                        <button onClick={() => handleEliminar(usuario)} className="text-accent hover:text-accent/80 p-1" title="Eliminar">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginacion()}
        </Card>

        {showFormModal && (
          <UserFormModal isOpen={showFormModal}
            onClose={() => { setShowFormModal(false); setEditingUser(null); }}
            user={editingUser} onSuccess={handleSaveSuccess} />
        )}
      </div>
    </Layout>
  );
};

export default UsersListPage;
