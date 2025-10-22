/**
 * Cliente de prueba para el servidor MCP GitHub
 * Ejecuta varias pruebas para verificar el funcionamiento del servidor
 */

const http = require('http');

const MCP_URL = 'http://localhost:4001';

/**
 * Realiza una petición HTTP
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, MCP_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
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
  console.log('🧪 PRUEBAS DEL SERVIDOR MCP GITHUB');
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  console.log('📋 Test 1: Health Check');
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200 && response.data.status === 'healthy') {
      console.log('✅ PASADO - Servidor saludable');
      console.log(`   Usuario GitHub: ${response.data.user}\n`);
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
      console.log('✅ PASADO - Info obtenida correctamente');
      console.log(`   Repositorio: ${response.data.repository}\n`);
      passed++;
    } else {
      console.log('❌ FALLIDO - No se pudo obtener info\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Test 3: Información del repositorio
  console.log('📋 Test 3: Información del repositorio');
  try {
    const response = await makeRequest('GET', '/repo');
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASADO - Info del repositorio obtenida');
      console.log(`   Nombre: ${response.data.data.full_name}`);
      console.log(`   Rama principal: ${response.data.data.default_branch}`);
      console.log(`   Issues abiertos: ${response.data.data.open_issues}\n`);
      passed++;
    } else {
      console.log('❌ FALLIDO - No se pudo obtener info del repo\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Test 4: Listar ramas
  console.log('📋 Test 4: Listar ramas');
  try {
    const response = await makeRequest('GET', '/branches');
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASADO - Ramas listadas correctamente');
      console.log(`   Total de ramas: ${response.data.count}`);
      if (response.data.count > 0) {
        console.log(`   Primera rama: ${response.data.data[0].name}\n`);
      }
      passed++;
    } else {
      console.log('❌ FALLIDO - No se pudieron listar ramas\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Test 5: Listar commits
  console.log('📋 Test 5: Listar commits recientes');
  try {
    const response = await makeRequest('GET', '/commits?limit=5');
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASADO - Commits listados correctamente');
      console.log(`   Total de commits: ${response.data.count}`);
      if (response.data.count > 0) {
        console.log(`   Último commit: ${response.data.data[0].message.split('\n')[0]}\n`);
      }
      passed++;
    } else {
      console.log('❌ FALLIDO - No se pudieron listar commits\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FALLIDO - Error: ${error.message}\n`);
    failed++;
  }

  // Test 6: Listar issues
  console.log('📋 Test 6: Listar issues');
  try {
    const response = await makeRequest('GET', '/issues?limit=5');
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASADO - Issues listados correctamente');
      console.log(`   Total de issues: ${response.data.count}\n`);
      passed++;
    } else {
      console.log('❌ FALLIDO - No se pudieron listar issues\n');
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
