// ============================================================================
// PÁGINA DE CAMBIO DE CONTRASEÑA
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/common';
import Layout from '../../components/layout/Layout';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { changePassword } = useAuth();
    
    const forced = location.state?.forced || false;
    
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrors({
            ...errors,
            [e.target.name]: '',
        });
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }
        
        if (!formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es requerida';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Debe confirmar la nueva contraseña';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setErrors({});
        setSuccessMessage('');
        
        try {
            const result = await changePassword(
                formData.currentPassword,
                formData.newPassword
            );
            
            if (result.success) {
                setSuccessMessage('Contraseña cambiada exitosamente');
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setErrors({ 
                    currentPassword: result.message || 'Error al cambiar contraseña' 
                });
            }
        } catch (err) {
            setErrors({ 
                currentPassword: 'Error al conectar con el servidor' 
            });
        } finally {
            setLoading(false);
        }
    };
    
    const content = (
        <div className="max-w-2xl mx-auto">
            <Card 
                title="Cambiar Contraseña"
                subtitle={forced 
                    ? "Por seguridad, debes cambiar tu contraseña antes de continuar" 
                    : "Actualiza tu contraseña de acceso"
                }
            >
                {forced && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                        ⚠️ Es obligatorio cambiar tu contraseña antes de continuar
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Contraseña Actual"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Ingrese su contraseña actual"
                        icon={<FiLock size={18} />}
                        error={errors.currentPassword}
                        required
                        autoFocus
                    />
                    
                    <Input
                        label="Nueva Contraseña"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Ingrese su nueva contraseña"
                        icon={<FiLock size={18} />}
                        error={errors.newPassword}
                        helperText="Mínimo 8 caracteres"
                        required
                    />
                    
                    <Input
                        label="Confirmar Nueva Contraseña"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirme su nueva contraseña"
                        icon={<FiLock size={18} />}
                        error={errors.confirmPassword}
                        required
                    />
                    
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            ✓ {successMessage}
                        </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            disabled={loading}
                        >
                            Cambiar Contraseña
                        </Button>
                        
                        {!forced && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/')}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
    
    // Si es forzado, usar layout completo; si no, mostrar solo el formulario
    if (forced) {
        return <Layout>{content}</Layout>;
    }
    
    return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
            {content}
        </div>
    );
};

export default ChangePasswordPage;
