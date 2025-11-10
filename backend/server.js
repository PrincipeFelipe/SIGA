// ============================================================================
// SERVIDOR PRINCIPAL - PLATAFORMA INTERNA DE GESTIÓN (PIG)
// ============================================================================
// Sistema de Control de Acceso Jerárquico con Roles y Permisos
// Backend: Node.js + Express + MariaDB
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Importar configuración
const { testConnection } = require('./config/database');

// Importar middlewares
const { authenticate, requirePasswordChange } = require('./middleware/auth');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// CONFIGURACIÓN DE MIDDLEWARES
// ============================================================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false // Desactivar para desarrollo, habilitar en producción
}));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true // Permitir cookies
}));

// Logging HTTP
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing
app.use(cookieParser());

// Rate limiting (protección contra fuerza bruta)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Límite alto en desarrollo
    message: 'Demasiadas solicitudes desde esta IP, intente de nuevo más tarde',
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting específico para login (más restrictivo)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Solo 5 intentos de login cada 15 minutos
    skipSuccessfulRequests: true, // No contar intentos exitosos
    message: 'Demasiados intentos de inicio de sesión, intente de nuevo en 15 minutos'
});

// Aplicar rate limiting global
app.use('/api/', limiter);

// ============================================================================
// RUTAS PÚBLICAS (Sin autenticación)
// ============================================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Ruta de autenticación (importar después de crear)
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', loginLimiter, authRoutes);

// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN GLOBAL
// ============================================================================
// Todas las rutas después de este punto requieren autenticación
// ============================================================================

app.use('/api', authenticate);
app.use('/api', requirePasswordChange);

// ============================================================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================================================

// Menú dinámico para sidebar
const menuRoutes = require('./routes/menu.routes');
app.use('/api/menu', menuRoutes);

// Dashboard principal
const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

// Gestión de usuarios
const usuariosRoutes = require('./routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);

// Gestión de unidades
const unidadesRoutes = require('./routes/unidades.routes');
app.use('/api/unidades', unidadesRoutes);

// Gestión de roles
const rolesRoutes = require('./routes/roles.routes');
app.use('/api/roles', rolesRoutes);

// Gestión de permisos
const permisosRoutes = require('./routes/permisos.routes');
app.use('/api/permisos', permisosRoutes);

// Asignación de roles y alcances
const rolesAlcanceRoutes = require('./routes/roles-alcance.routes');
app.use('/api/usuarios', rolesAlcanceRoutes);

// Gestión de tareas
const tareasRoutes = require('./routes/tareas.routes');
app.use('/api/tareas', tareasRoutes);

// Notificaciones
const notificacionesRoutes = require('./routes/notificaciones.routes');
app.use('/notificaciones', authenticate, notificacionesRoutes);

// Logs de auditoría
const logsRoutes = require('./routes/logs.routes');
app.use('/api/logs', logsRoutes);

// Aplicaciones (gestión de módulos del sidebar)
const aplicacionesRoutes = require('./routes/aplicaciones.routes');
app.use('/api/aplicaciones', aplicacionesRoutes);

// ============================================================================
// MANEJO DE ERRORES 404
// ============================================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path
    });
});

// ============================================================================
// MANEJO DE ERRORES GLOBAL
// ============================================================================

app.use((error, req, res, next) => {
    console.error('❌ Error no controlado:', error);
    
    // Error de validación de Joi
    if (error.isJoi) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    
    // Error de base de datos
    if (error.code && error.code.startsWith('ER_')) {
        return res.status(500).json({
            success: false,
            message: 'Error de base de datos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    
    // Error genérico
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

async function startServer() {
    try {
        // 1. Verificar conexión a base de datos
        console.log('🔌 Verificando conexión a base de datos...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            console.error('   Verifique que MariaDB esté corriendo y las credenciales sean correctas');
            process.exit(1);
        }
        
        // 2. Iniciar servidor Express
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log('║                                                            ║');
            console.log('║   🚀 SERVIDOR SIGA INICIADO CORRECTAMENTE                 ║');
            console.log('║                                                            ║');
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
            console.log(`  📍 URL: http://localhost:${PORT}`);
            console.log(`  🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  🗄️  Base de datos: ${process.env.DB_NAME}`);
            console.log('');
            console.log('  ✅ Health check: http://localhost:' + PORT + '/health');
            console.log('  🔐 Auth: http://localhost:' + PORT + '/api/auth/login');
            console.log('');
            console.log('  Presione Ctrl+C para detener el servidor');
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Iniciar el servidor
startServer();

// Manejo de cierre gracioso
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT recibido, cerrando servidor...');
    process.exit(0);
});

module.exports = app;
