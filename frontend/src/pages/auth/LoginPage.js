// ============================================================================
// PÁGINA DE LOGIN - Autenticación de usuarios
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiShield } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/common';

// Importar logo - Si no existe, se mostrará un placeholder
let logoSrc;
try {
    logoSrc = require('../../assets/images/logo.png');
} catch (error) {
    logoSrc = null;
}

// Componente para mostrar el logo o placeholder
const LogoImage = () => {
    if (logoSrc) {
        return (
            <img 
                src={logoSrc} 
                alt="Logo Comandancia" 
                className="w-32 h-32 object-contain"
            />
        );
    }
    
    // Placeholder si no existe el logo
    return (
        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-xl">
            <FiShield size={64} className="text-primary" />
        </div>
    );
};

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const result = await login(formData.username, formData.password);
            
            if (result.success) {
                // Si el usuario necesita cambiar contraseña
                if (result.user.require_password_change) {
                    navigate('/cambiar-password', { 
                        state: { forced: true } 
                    });
                } else {
                    navigate('/');
                }
            } else {
                setError(result.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo de la Comandancia */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-6">
                        <LogoImage />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">
                        Sistema de Gestión Administrativa
                    </h1>
                    <p className="text-white text-opacity-90">
                        Acceso seguro al sistema
                    </p>
                </div>
                
                {/* Formulario de Login */}
                <Card>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Input
                                label="Usuario"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Ingrese su usuario"
                                icon={<FiUser size={18} />}
                                required
                                autoComplete="username"
                                autoFocus
                            />
                            
                            <Input
                                label="Contraseña"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ingrese su contraseña"
                                icon={<FiLock size={18} />}
                                required
                                autoComplete="current-password"
                            />
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                            >
                                Iniciar Sesión
                            </Button>
                        </div>
                    </form>
                </Card>
                
                {/* Footer */}
                <div className="mt-6 text-center text-white text-sm text-opacity-80">
                    <p>© 2025 SIGA - Todos los derechos reservados</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
