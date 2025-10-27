// ============================================================================
// COMPONENTE TABLE - Tabla reutilizable con paginación
// ============================================================================

import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button, Loading } from './index';

const Table = ({
    columns,
    data,
    loading = false,
    pagination = null,
    onPageChange = null,
    emptyMessage = 'No hay datos para mostrar',
    className = ''
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loading size="lg" text="Cargando datos..." />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        column.className || ''
                                    }`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            column.cellClassName || ''
                                        }`}
                                    >
                                        {column.render
                                            ? column.render(row, rowIndex)
                                            : row[column.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {pagination && onPageChange && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.pagina_actual - 1)}
                            disabled={pagination.pagina_actual === 1}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.pagina_actual + 1)}
                            disabled={pagination.pagina_actual === pagination.total_paginas}
                        >
                            Siguiente
                        </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando{' '}
                                <span className="font-medium">
                                    {(pagination.pagina_actual - 1) * pagination.registros_por_pagina + 1}
                                </span>{' '}
                                a{' '}
                                <span className="font-medium">
                                    {Math.min(
                                        pagination.pagina_actual * pagination.registros_por_pagina,
                                        pagination.total_registros
                                    )}
                                </span>{' '}
                                de{' '}
                                <span className="font-medium">{pagination.total_registros}</span>{' '}
                                resultados
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => onPageChange(pagination.pagina_actual - 1)}
                                    disabled={pagination.pagina_actual === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiChevronLeft size={20} />
                                </button>
                                
                                {[...Array(pagination.total_paginas)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    // Mostrar solo las páginas cercanas a la actual
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === pagination.total_paginas ||
                                        (pageNumber >= pagination.pagina_actual - 2 &&
                                            pageNumber <= pagination.pagina_actual + 2)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => onPageChange(pageNumber)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    pageNumber === pagination.pagina_actual
                                                        ? 'z-10 bg-primary border-primary text-white'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    } else if (
                                        pageNumber === pagination.pagina_actual - 3 ||
                                        pageNumber === pagination.pagina_actual + 3
                                    ) {
                                        return (
                                            <span
                                                key={pageNumber}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                                
                                <button
                                    onClick={() => onPageChange(pagination.pagina_actual + 1)}
                                    disabled={pagination.pagina_actual === pagination.total_paginas}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiChevronRight size={20} />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;
