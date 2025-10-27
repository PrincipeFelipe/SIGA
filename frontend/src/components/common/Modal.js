// ============================================================================
// COMPONENTE MODAL - Diálogo modal reutilizable
// ============================================================================

import React, { useEffect } from 'react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = '',
}) => {
    // Bloquear scroll cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    
    // Cerrar con tecla ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;
    
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full mx-4',
    };
    
    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };
    
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn"
            onClick={handleOverlayClick}
        >
            <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} animate-slideIn ${className}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-heading font-semibold text-text">
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                
                {/* Body */}
                <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {children}
                </div>
                
                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
