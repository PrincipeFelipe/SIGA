const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
require('dotenv').config();

const PORT = process.env.MCP_PORT || 4000;

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
 * Verifica la conexión a la base de datos antes de iniciar el servidor
 */
async function checkDatabaseConnection() {
  const mariadb = require('mariadb');
  
  console.log('\n📊 Verificando conexión a MariaDB...');
  
  try {
    const conn = await mariadb.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'klandemo',
      database: process.env.DB_NAME
    });
    
    await conn.query('SELECT 1');
    await conn.end();
    
    console.log('✅ Conexión a base de datos exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a base de datos:');
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Código: ${error.code}`);
    console.error('\n💡 Verifica:');
    console.error('   - MariaDB está ejecutándose');
    console.error('   - Las credenciales en .env son correctas');
    console.error('   - La base de datos existe');
    return false;
  }
}

/**
 * Inicia el servidor MCP con verificaciones previas
 */
async function startServer() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 INICIANDO SERVIDOR MCP MARIADB');
  console.log('='.repeat(60));
  
  try {
    // Verificar archivo .env
    if (!process.env.DB_NAME) {
      console.warn('\n⚠️  ADVERTENCIA: DB_NAME no está configurado en .env');
      console.warn('   El servidor podría no funcionar correctamente\n');
    }
    
    // Verificar y liberar puerto
    console.log(`\n🔍 Verificando puerto ${PORT}...`);
    await checkAndKillPort(PORT);
    
    // Verificar conexión a base de datos
    const dbConnected = await checkDatabaseConnection();
    
    if (!dbConnected) {
      console.error('\n❌ No se puede iniciar el servidor sin conexión a la base de datos');
      process.exit(1);
    }
    
    console.log('\n🚀 Iniciando servidor MCP...\n');
    
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
        console.error(`\n❌ Servidor MCP finalizado con código de error ${code}`);
      } else {
        console.log(`\n✅ Servidor MCP finalizado correctamente`);
      }
    });

  } catch (error) {
    console.error('\n❌ Error al iniciar servidor MCP:', error.message);
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
