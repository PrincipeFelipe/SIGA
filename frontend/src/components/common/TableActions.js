// ============================================================================
// COMPONENTE DE ACCIONES CON PERMISOS
// ============================================================================
// Botones de acciones que se muestran/ocultan según permisos
// ============================================================================

import React from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

/**
 * Botón de acción individual
 */
const ActionButton = ({ onClick, icon: Icon, title, color = 'primary', disabled = false }) => {
    const colorClasses = {
        primary: 'text-primary hover:text-primary/80',
        danger: 'text-accent hover:text-accent/80',
        secondary: 'text-gray-600 hover:text-gray-800',
        info: 'text-blue-600 hover:text-blue-800',
        success: 'text-green-600 hover:text-green-800',
        warning: 'text-yellow-600 hover:text-yellow-800',
        purple: 'text-purple-600 hover:text-purple-800'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${colorClasses[color]} p-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            title={title}
        >
            <Icon size={18} />
        </button>
    );
};

/**
 * Contenedor de acciones de tabla
 * @param {Object} props
 * @param {Array} props.actions - Array de objetos { show, onClick, icon, title, color }
 * @param {boolean} props.showNoActions - Mostrar mensaje si no hay acciones
 */
export const TableActions = ({ actions, showNoActions = true }) => {
    const visibleActions = actions.filter(action => action.show !== false);

    if (visibleActions.length === 0 && showNoActions) {
        return <span className="text-gray-400 text-xs italic">Sin acciones disponibles</span>;
    }

    return (
        <div className="flex justify-end space-x-2">
            {visibleActions.map((action, index) => (
                <ActionButton
                    key={index}
                    onClick={action.onClick}
                    icon={action.icon}
                    title={action.title}
                    color={action.color || 'primary'}
                    disabled={action.disabled}
                />
            ))}
        </div>
    );
};

/**
 * Acciones estándar pre-configuradas
 */
export const StandardActions = {
    view: (onClick, show = true) => ({
        show,
        onClick,
        icon: FiEye,
        title: 'Ver detalles',
        color: 'info'
    }),
    
    edit: (onClick, show = true) => ({
        show,
        onClick,
        icon: FiEdit2,
        title: 'Editar',
        color: 'primary'
    }),
    
    delete: (onClick, show = true) => ({
        show,
        onClick,
        icon: FiTrash2,
        title: 'Eliminar',
        color: 'danger'
    })
};

export default TableActions;
