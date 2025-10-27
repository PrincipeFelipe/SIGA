// ============================================================================
// COMPONENTE PROTECTEDROUTE - Rutas protegidas por autenticación
// ============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../../components/common';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <Loading fullScreen text="Verificando autenticación..." />;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
