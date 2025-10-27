// ============================================================================
// COMPONENTE BADGE - Etiqueta/insignia reutilizable
// ============================================================================

import React from 'react';

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    rounded = true,
    className = '',
    ...props
}) => {
    const variantClasses = {
        default: 'bg-gray-200 text-gray-800',
        primary: 'bg-primary text-white',
        accent: 'bg-accent text-white',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };
    
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
    };
    
    const roundedClass = rounded ? 'rounded-full' : 'rounded';
    
    const classes = `
        inline-flex items-center justify-center
        font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClass}
        ${className}
    `.trim().replace(/\s+/g, ' ');
    
    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
};

export default Badge;
