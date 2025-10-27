// ============================================================================
// COMPONENTE BUTTON - Botón reutilizable
// ============================================================================

import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
    icon = null,
    ...props
}) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
    
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-opacity-90 disabled:bg-opacity-50',
        secondary: 'bg-gray-200 text-text hover:bg-gray-300 disabled:bg-opacity-50',
        accent: 'bg-accent text-white hover:bg-opacity-90 disabled:bg-opacity-50',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:border-opacity-50 disabled:text-opacity-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-opacity-50',
        success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-opacity-50',
    };
    
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    const disabledClass = disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';
    
    const classes = `
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${disabledClass}
        ${className}
    `.trim().replace(/\s+/g, ' ');
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={classes}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                </>
            ) : (
                <>
                    {icon && <span>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
