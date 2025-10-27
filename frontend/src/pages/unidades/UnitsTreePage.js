import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import { unidadesService } from '../../services';
import { TreeNode, UnitDetailsModal, UnitFormModal } from '../../components/unidades';
import { Loading } from '../../components/common';

/**
 * UnitsTreePage - Página principal del módulo de Unidades
 * Muestra el árbol jerárquico de unidades organizacionales
 */
const UnitsTreePage = () => {
  const [loading, setLoading] = useState(true);
  const [arbol, setArbol] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [parentUnit, setParentUnit] = useState(null);

  // Cargar árbol de unidades
  const cargarArbol = async () => {
    try {
      setLoading(true);
      const data = await unidadesService.getTree();
      setArbol(data);
    } catch (error) {
      console.error('Error al cargar árbol de unidades:', error);
      toast.error('Error al cargar el árbol de unidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarArbol();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ver detalles de una unidad
  const handleView = (unit) => {
    setSelectedUnit(unit);
    setShowDetailsModal(true);
  };

  // Editar unidad
  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setParentUnit(null);
    setShowFormModal(true);
  };

  // Confirmar eliminación con SweetAlert2
  const handleDelete = async (unit) => {
    const hasChildren = unit.hijos && unit.hijos.length > 0;
    
    const result = await Swal.fire({
      title: '¿Eliminar unidad?',
      html: `
        <p>¿Estás seguro de que deseas eliminar <strong>${unit.nombre}</strong>?</p>
        ${hasChildren ? `
          <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p class="text-yellow-800 text-sm">
              <strong>Advertencia:</strong> Esta unidad tiene ${unit.hijos.length} sub-unidad(es).
              No podrás eliminarla hasta que elimines o reasignes las sub-unidades.
            </p>
          </div>
        ` : ''}
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await unidadesService.delete(unit.id);
        toast.success('Unidad eliminada correctamente');
        cargarArbol();
      } catch (error) {
        console.error('Error al eliminar unidad:', error);
        const mensaje = error.response?.data?.message || 'Error al eliminar la unidad';
        toast.error(mensaje);
      }
    }
  };

  // Agregar unidad hija
  const handleAddChild = (unit) => {
    setEditingUnit(null);
    setParentUnit(unit);
    setShowFormModal(true);
  };

  // Crear unidad raíz
  const handleCreateRoot = () => {
    setEditingUnit(null);
    setParentUnit(null);
    setShowFormModal(true);
  };

  // Manejar guardado exitoso
  const handleSaveSuccess = () => {
    setShowFormModal(false);
    setEditingUnit(null);
    setParentUnit(null);
    cargarArbol();
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
      {/* Cabecera */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Unidades
          </h1>
          <div className="flex gap-3">
            <button
              onClick={cargarArbol}
              className="flex items-center gap-2 px-4 py-2 text-primary border border-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
            >
              <FiRefreshCw size={18} />
              Recargar
            </button>
            <button
              onClick={handleCreateRoot}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors"
            >
              <FiPlus size={18} />
              Nueva Unidad
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Visualiza y gestiona la estructura organizacional jerárquica de las unidades
        </p>
      </div>

      {/* Árbol de Unidades */}
      {arbol.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b bg-gray-50 px-4 py-3">
            <h2 className="font-semibold text-gray-700">
              Estructura Organizacional
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {arbol.map((nodo) => (
              <TreeNode
                key={nodo.id}
                node={nodo}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                level={0}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <FiAlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay unidades registradas
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando la primera unidad organizacional
          </p>
          <button
            onClick={handleCreateRoot}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors"
          >
            <FiPlus size={20} />
            Crear Primera Unidad
          </button>
        </div>
      )}

      {/* Modal de Detalles */}
      <UnitDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        unit={selectedUnit}
      />

      {/* Modal de Formulario */}
      {showFormModal && (
        <UnitFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingUnit(null);
            setParentUnit(null);
          }}
          unit={editingUnit}
          parentUnit={parentUnit}
          onSuccess={handleSaveSuccess}
        />
      )}
      </div>
    </Layout>
  );
};

export default UnitsTreePage;
