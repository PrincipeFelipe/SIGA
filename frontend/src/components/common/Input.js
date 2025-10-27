// ============================================================================
// COMPONENTE INPUT - Campo de entrada reutilizable
// ============================================================================

import React from 'react';

const Input = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder = '',
    required = false,
    disabled = false,
    error = '',
    helperText = '',
    icon = null,
    className = '',
    containerClassName = '',
    ...props
}) => {
    const inputClasses = `
        w-full px-4 py-2 border rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
        ${icon ? 'pl-10' : ''}
        ${className}
    `.trim().replace(/\s+/g, ' ');
    
    return (
        <div className={`mb-4 ${containerClassName}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-text mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={inputClasses}
                    {...props}
                />
            </div>
            
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default Input;
