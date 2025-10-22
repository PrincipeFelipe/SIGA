const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
require('dotenv').config();

const PORT = process.env.GITHUB_MCP_PORT || 4001;

/**
 * Verifica si el puerto está en uso y cierra el proceso si es necesario
 * @param {number} port - Puerto a verificar
 */
async function checkAndKillPort(port) {
  try {
    const { stdout } = await execPromise(`lsof -ti:${port}`);
    const pid = stdout.trim();
    
    if (pid) {
      console.log(`⚠️  Puerto ${port} ocupado por proceso ${pid}`);
      console.log(`🔄 Cerrando proceso...`);
      await execPromise(`kill -9 ${pid}`);
      console.log(`✅ Proceso ${pid} cerrado correctamente`);
      // Esperar un momento para que se libere el puerto
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  } catch (error) {
    // Si no hay proceso usando el puerto, lsof devuelve error (comportamiento esperado)
    if (error.code === 1) {
      console.log(`✅ Puerto ${port} disponible`);
    } else {
      console.error(`⚠️  Error al verificar puerto: ${error.message}`);
    }
  }
}

/**
 * Verifica que el token de GitHub esté configurado
 */
function checkGitHubToken() {
  console.log('\n🔑 Verificando token de GitHub...');
  
  if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'your_github_personal_access_token_here') {
    console.error('❌ ERROR: Token de GitHub no configurado');
    console.error('\n💡 Para configurar el token:');
    console.error('   1. Ve a GitHub > Settings > Developer settings > Personal access tokens');
    console.error('   2. Genera un nuevo token con permisos: repo, workflow');
    console.error('   3. Copia el token en el archivo .env como GITHUB_TOKEN');
    console.error('   4. Reinicia el servidor\n');
    return false;
  }
  
  console.log('✅ Token de GitHub configurado');
  return true;
}

/**
 * Inicia el servidor MCP GitHub con verificaciones previas
 */
async function startServer() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 INICIANDO SERVIDOR MCP GITHUB');
  console.log('='.repeat(60));
  
  try {
    // Verificar token de GitHub
    const tokenConfigured = checkGitHubToken();
    
    if (!tokenConfigured) {
      console.error('\n❌ No se puede iniciar el servidor sin token de GitHub');
      console.error('   El servidor funcionará en modo limitado (solo lectura pública)\n');
    }
    
    // Verificar y liberar puerto
    console.log(`\n🔍 Verificando puerto ${PORT}...`);
    await checkAndKillPort(PORT);
    
    console.log('\n🚀 Iniciando servidor MCP GitHub...\n');
    
    // Iniciar servidor
    const server = exec('node server.js', {
      cwd: __dirname
    });

    server.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    server.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    server.on('exit', (code) => {
      if (code !== 0) {
        console.error(`\n❌ Servidor MCP GitHub finalizado con código de error ${code}`);
      } else {
        console.log(`\n✅ Servidor MCP GitHub finalizado correctamente`);
      }
    });

  } catch (error) {
    console.error('\n❌ Error al iniciar servidor MCP GitHub:', error.message);
    process.exit(1);
  }
}

// Manejo de señales para cierre limpio
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Señal de interrupción recibida. Cerrando...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Señal de terminación recibida. Cerrando...');
  process.exit(0);
});

// Iniciar el proceso
startServer();
