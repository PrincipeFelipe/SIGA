import React from 'react';
import { Modal, Badge } from '../common';
import { FiMapPin, FiUsers, FiHash, FiLayers } from 'react-icons/fi';

/**
 * UnitDetailsModal - Modal para mostrar detalles completos de una unidad
 */
const UnitDetailsModal = ({ isOpen, onClose, unit }) => {
  if (!unit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de Unidad"
      size="lg"
    >
      <div className="space-y-6">
        {/* Cabecera con nombre y estado */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{unit.nombre}</h3>
              {unit.codigo_unidad && (
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <FiHash size={16} />
                  Código: {unit.codigo_unidad}
                </p>
              )}
            </div>
            <Badge variant={unit.activo ? 'success' : 'danger'}>
              {unit.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        {/* Información organizada en grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FiLayers size={16} />
              Tipo de Unidad
            </label>
            <p className="text-gray-800 font-medium">
              {unit.tipo || 'No especificado'}
            </p>
          </div>

          {/* Ubicación */}
          {unit.ubicacion && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FiMapPin size={16} />
                Ubicación
              </label>
              <p className="text-gray-800">{unit.ubicacion}</p>
            </div>
          )}

          {/* Unidad Superior */}
          {unit.unidad_superior_nombre && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Unidad Superior
              </label>
              <p className="text-gray-800">{unit.unidad_superior_nombre}</p>
            </div>
          )}

          {/* Personal asignado */}
          {unit.personal_count !== undefined && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FiUsers size={16} />
                Personal Asignado
              </label>
              <p className="text-gray-800 font-medium">
                {unit.personal_count} {unit.personal_count === 1 ? 'persona' : 'personas'}
              </p>
            </div>
          )}
        </div>

        {/* Descripción (si existe) */}
        {unit.descripcion && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Descripción
            </label>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {unit.descripcion}
            </p>
          </div>
        )}

        {/* Sub-unidades */}
        {unit.hijos && unit.hijos.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Sub-unidades ({unit.hijos.length})
            </label>
            <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
              <ul className="space-y-2">
                {unit.hijos.map((hijo) => (
                  <li key={hijo.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-gray-700">{hijo.nombre}</span>
                    {hijo.codigo_unidad && (
                      <Badge variant="info" size="sm">
                        {hijo.codigo_unidad}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t text-sm text-gray-500">
          {unit.createdAt && (
            <div>
              <span className="font-medium">Creado:</span>{' '}
              {new Date(unit.createdAt).toLocaleString('es-ES')}
            </div>
          )}
          {unit.updatedAt && (
            <div>
              <span className="font-medium">Actualizado:</span>{' '}
              {new Date(unit.updatedAt).toLocaleString('es-ES')}
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default UnitDetailsModal;
