// ============================================================================
// SERVICIO API BASE - Configuración de Axios
// ============================================================================

import axios from 'axios';
import Cookies from 'js-cookie';

// URL base del backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Importante: permite enviar cookies
});

// Interceptor de request - agregar headers personalizados si es necesario
api.interceptors.request.use(
    (config) => {
        // El token JWT está en la cookie HttpOnly, se envía automáticamente
        // No necesitamos agregarlo manualmente por seguridad
        
        // Agregar CSRF token si existe
        const csrfToken = Cookies.get('csrf_token');
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de response - manejo global de errores
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Manejo de errores comunes
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 401:
                    // No autenticado - redirigir a login
                    console.error('❌ No autenticado');
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                    break;
                    
                case 403:
                    // Sin permisos
                    console.error('❌ Sin permisos:', data.message);
                    break;
                    
                case 404:
                    // Recurso no encontrado
                    console.error('❌ Recurso no encontrado');
                    break;
                    
                case 429:
                    // Too many requests
                    console.error('❌ Demasiadas solicitudes, intente más tarde');
                    break;
                    
                case 500:
                case 502:
                case 503:
                    // Error del servidor
                    console.error('❌ Error del servidor');
                    break;
                    
                default:
                    console.error(`❌ Error ${status}:`, data.message);
            }
        } else if (error.request) {
            // La request se hizo pero no hubo respuesta
            console.error('❌ Sin respuesta del servidor');
        } else {
            // Error al configurar la request
            console.error('❌ Error en la solicitud:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;
