// ============================================================================
// COMPONENTE CARD - Contenedor tipo tarjeta reutilizable
// ============================================================================

import React from 'react';

const Card = ({
    children,
    title,
    subtitle,
    footer,
    padding = true,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    ...props
}) => {
    return (
        <div 
            className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
            {...props}
        >
            {(title || subtitle) && (
                <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
                    {title && (
                        <h3 className="text-lg font-heading font-semibold text-text">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-600">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            
            <div className={`${padding ? 'p-6' : ''} ${bodyClassName}`}>
                {children}
            </div>
            
            {footer && (
                <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
