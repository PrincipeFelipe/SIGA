import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiShield } from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import { Card, Badge, Loading, Button } from '../../components/common';
import { RoleFormModal } from '../../components/roles';
import { rolesService } from '../../services';

const RolesListPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      const data = await rolesService.listar();
      setRoles(data || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      toast.error('Error al cargar la lista de roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setShowFormModal(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setShowFormModal(true);
  };

  const handleSaveSuccess = () => {
    setShowFormModal(false);
    setEditingRole(null);
    cargarRoles();
  };

  const handleEliminar = async (role) => {
    const result = await Swal.fire({
      title: '¿Eliminar rol?',
      html: `
        <p style="color: #374151; margin-bottom: 8px;">
          ¿Estás seguro de que deseas eliminar el rol <strong>${role.nombre}</strong>?
        </p>
        <p style="color: #6B7280; font-size: 14px;">Nivel jerárquico: ${role.nivel_jerarquico}</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: true,
      reverseButtons: false,
      focusConfirm: false,
      focusCancel: false
    });

    if (result.isConfirmed) {
      try {
        await rolesService.eliminar(role.id);
        toast.success('Rol eliminado correctamente');
        cargarRoles();
      } catch (error) {
        console.error('Error al eliminar rol:', error);
        toast.error(error.response?.data?.message || 'Error al eliminar rol');
      }
    }
  };

  if (loading && roles.length === 0) {
    return <Layout><Loading fullScreen /></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles y Permisos</h1>
            <p className="text-gray-500 mt-1">Gestión de roles del sistema</p>
          </div>
          <Button variant="primary" onClick={handleCreate} icon={<FiPlus />}>
            Nuevo Rol
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permisos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron roles
                    </td>
                  </tr>
                ) : (
                  roles.map(role => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <FiShield className="text-primary" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{role.nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {role.descripcion || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={role.nivel_jerarquico <= 3 ? 'primary' : 'secondary'}>
                          Nivel {role.nivel_jerarquico}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-500">
                          {role.permisos_count || 0} permisos
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(role)}
                            className="text-primary hover:text-primary/80 p-1"
                            title="Editar"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleEliminar(role)}
                            className="text-accent hover:text-accent/80 p-1"
                            title="Eliminar"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <Loading />
            </div>
          )}
        </Card>

        {showFormModal && (
          <RoleFormModal
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingRole(null);
            }}
            role={editingRole}
            onSuccess={handleSaveSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default RolesListPage;
