#!/usr/bin/env node

// ============================================================================
// SCRIPT GENERADOR DE RUTAS Y CONTROLADORES
// ============================================================================
// Genera automáticamente los archivos faltantes para completar el backend
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('🚀 Generando controladores y rutas restantes...\n');

// ============================================================================
// CONTROLADORES Y RUTAS A GENERAR
// ============================================================================

const archivos = {
    // Usuarios
    'controllers/usuarios.controller.js': require('./templates/usuarios.controller.template'),
    'routes/usuarios.routes.js': require('./templates/usuarios.routes.template'),
    
    // Unidades
    'controllers/unidades.controller.js': require('./templates/unidades.controller.template'),
    'routes/unidades.routes.js': require('./templates/unidades.routes.template'),
    
    // Roles
    'controllers/roles.controller.js': require('./templates/roles.controller.template'),
    'routes/roles.routes.js': require('./templates/roles.routes.template'),
    
    // Permisos
    'controllers/permisos.controller.js': require('./templates/permisos.controller.template'),
    'routes/permisos.routes.js': require('./templates/permisos.routes.template'),
    
    // Roles-Alcance
    'controllers/roles-alcance.controller.js': require('./templates/roles-alcance.controller.template'),
    'routes/roles-alcance.routes.js': require('./templates/roles-alcance.routes.template'),
    
    // Notificaciones
    'controllers/notificaciones.controller.js': require('./templates/notificaciones.controller.template'),
    'routes/notificaciones.routes.js': require('./templates/notificaciones.routes.template'),
    
    // Logs
    'controllers/logs.controller.js': require('./templates/logs.controller.template'),
    'routes/logs.routes.js': require('./templates/logs.routes.template'),
    
    // Aplicaciones
    'controllers/aplicaciones.controller.js': require('./templates/aplicaciones.controller.template'),
    'routes/aplicaciones.routes.js': require('./templates/aplicaciones.routes.template')
};

// ============================================================================
// GENERAR ARCHIVOS
// ============================================================================

let generados = 0;
let errores = 0;

for (const [rutaRelativa, contenido] of Object.entries(archivos)) {
    const rutaCompleta = path.join(__dirname, '..', rutaRelativa);
    const directorio = path.dirname(rutaCompleta);
    
    try {
        // Crear directorio si no existe
        if (!fs.existsSync(directorio)) {
            fs.mkdirSync(directorio, { recursive: true });
        }
        
        // Generar archivo solo si no existe
        if (!fs.existsSync(rutaCompleta)) {
            fs.writeFileSync(rutaCompleta, contenido, 'utf8');
            console.log(`✅ Generado: ${rutaRelativa}`);
            generados++;
        } else {
            console.log(`⏭️  Ya existe: ${rutaRelativa}`);
        }
    } catch (error) {
        console.error(`❌ Error generando ${rutaRelativa}:`, error.message);
        errores++;
    }
}

// ============================================================================
// RESUMEN
// ============================================================================

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║           GENERACIÓN COMPLETADA                    ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n  ✅ Archivos generados: ${generados}`);
console.log(`  ⏭️  Archivos existentes: ${Object.keys(archivos).length - generados - errores}`);
console.log(`  ❌ Errores: ${errores}\n`);

if (errores === 0) {
    console.log('✨ Backend completo y listo para usar!\n');
    console.log('Próximos pasos:');
    console.log('  1. Copiar .env.example a .env y configurar');
    console.log('  2. npm install');
    console.log('  3. npm run db:reset (inicializar base de datos)');
    console.log('  4. npm run dev (iniciar servidor)\n');
}

process.exit(errores > 0 ? 1 : 0);
