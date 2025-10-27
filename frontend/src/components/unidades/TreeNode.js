import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import { Badge } from '../common';

/**
 * TreeNode - Componente recursivo para representar un nodo del árbol de unidades
 * @param {Object} node - Nodo de la unidad con hijos
 * @param {Function} onEdit - Callback para editar unidad
 * @param {Function} onDelete - Callback para eliminar unidad
 * @param {Function} onAddChild - Callback para agregar unidad hija
 * @param {Function} onView - Callback para ver detalles
 * @param {number} level - Nivel de profundidad en el árbol (para indentación)
 */
const TreeNode = ({ node, onEdit, onDelete, onAddChild, onView, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expandir primeros 2 niveles

  const hasChildren = node.hijos && node.hijos.length > 0;
  const indentation = level * 24; // 24px por nivel de profundidad

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  // Determinar icono de tipo según nivel
  const getTipoLabel = () => {
    if (node.tipo) return node.tipo;
    
    // Inferir tipo por nivel si no está definido
    switch (level) {
      case 0:
        return 'Dirección General';
      case 1:
        return 'Comandancia';
      case 2:
        return 'Compañía';
      case 3:
        return 'Puesto';
      default:
        return 'Unidad';
    }
  };

  return (
    <div>
      {/* Nodo actual */}
      <div
        className="flex items-center py-2 px-3 hover:bg-gray-50 border-b border-gray-100 transition-colors group"
        style={{ paddingLeft: `${16 + indentation}px` }}
      >
        {/* Botón expandir/colapsar */}
        <button
          onClick={toggleExpand}
          className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <FiChevronDown size={16} className="text-gray-600" />
            ) : (
              <FiChevronRight size={16} className="text-gray-600" />
            )
          ) : (
            <span className="inline-block w-4" />
          )}
        </button>

        {/* Información de la unidad */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 truncate">
                {node.nombre}
              </span>
              {node.codigo_unidad && (
                <Badge variant="info" size="sm">
                  {node.codigo_unidad}
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {getTipoLabel()}
              {node.ubicacion && ` • ${node.ubicacion}`}
            </div>
          </div>

          {/* Contador de hijos */}
          {hasChildren && (
            <Badge variant="secondary" size="sm">
              {node.hijos.length} {node.hijos.length === 1 ? 'sub-unidad' : 'sub-unidades'}
            </Badge>
          )}

          {/* Badge de estado activo */}
          <Badge variant={node.activo ? 'success' : 'danger'} size="sm">
            {node.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* Acciones (visible en hover) */}
        <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(node)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalles"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => onAddChild(node)}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Agregar sub-unidad"
          >
            <FiPlus size={16} />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
            title="Editar"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Eliminar"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Hijos (renderizado recursivo) */}
      {hasChildren && isExpanded && (
        <div>
          {node.hijos.map((hijo) => (
            <TreeNode
              key={hijo.id}
              node={hijo}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onView={onView}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
