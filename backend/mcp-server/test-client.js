/**
 * Cliente de prueba para el servidor MCP
 * Ejecuta varias pruebas para verificar el funcionamiento del servidor
 */

const http = require('http');

const MCP_URL = 'http://localhost:4000';

/**
 * Realiza una petición HTTP
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, MCP_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Ejecuta las pruebas
 */
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 PRUEBAS DEL SERVIDOR MCP MARIADB');
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  console.log('📋 Test 1: Health Check');
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200 && response.data.status === 'healthy') {
      console.log('✅ PASADO - Servidor saludable\n');
      passed++;
    } else {
      console.log('❌ FALLIDO - Servidor no saludable\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Test 2: Info del servidor
  console.log('📋 Test 2: Información del servidor');
  try {
    const response = await makeRequest('GET', '/');
    if (response.status === 200 && response.data.name) {
      console.log('✅ PASADO - Info obtenida correctamente\n');
      passed++;
    } else {
      console.log('❌ FALLIDO - No se pudo obtener info\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Test 3: Listar tablas
  console.log('📋 Test 3: Listar tablas');
  try {
    const response = await makeRequest('GET', '/tables');
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASADO - Tablas listadas correctamente');
      console.log(`   Tablas encontradas: ${response.data.data.length}\n`);
      passed++;
    } else {
      console.log('❌ FALLIDO - No se pudieron listar tablas\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Test 4: Consulta SQL simple
  console.log('📋 Test 4: Consulta SQL simple');
  try {
    const response = await makeRequest('POST', '/query', {
      sql: 'SELECT 1 as test'
    });
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASADO - Consulta ejecutada correctamente\n');
      passed++;
    } else {
      console.log('❌ FALLIDO - Error en consulta\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Test 5: Consulta inválida (debe fallar)
  console.log('📋 Test 5: Manejo de error en consulta');
  try {
    const response = await makeRequest('POST', '/query', {
      sql: 'SELECT * FROM tabla_inexistente'
    });
    if (response.status === 500 && !response.data.success) {
      console.log('✅ PASADO - Error manejado correctamente\n');
      passed++;
    } else {
      console.log('❌ FALLIDO - Error no manejado correctamente\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Resumen
  console.log('='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`✅ Pasadas: ${passed}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  console.log(`🎯 Éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar pruebas
console.log('\n⏳ Esperando 2 segundos para que el servidor esté listo...');
setTimeout(() => {
  runTests().catch(error => {
    console.error('\n❌ Error ejecutando pruebas:', error);
    process.exit(1);
  });
}, 2000);
