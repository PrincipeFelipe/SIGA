/**
 * Ejemplos de uso del servidor MCP
 * Este archivo muestra cómo interactuar con el servidor MCP desde código JavaScript
 */

// Ejemplo usando fetch (navegador o Node.js >= 18)
async function ejemploUsandoFetch() {
  const MCP_URL = 'http://localhost:4000';

  try {
    // 1. Verificar salud del servidor
    console.log('1. Verificando salud del servidor...');
    const healthResponse = await fetch(`${MCP_URL}/health`);
    const health = await healthResponse.json();
    console.log('Estado:', health);

    // 2. Listar tablas
    console.log('\n2. Listando tablas...');
    const tablesResponse = await fetch(`${MCP_URL}/tables`);
    const tables = await tablesResponse.json();
    console.log('Tablas:', tables);

    // 3. Ejecutar una consulta SELECT
    console.log('\n3. Ejecutando consulta SELECT...');
    const queryResponse = await fetch(`${MCP_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: 'SELECT DATABASE() as db_actual, VERSION() as version_mysql'
      })
    });
    const queryResult = await queryResponse.json();
    console.log('Resultado:', queryResult);

    // 4. Consulta con parámetros
    console.log('\n4. Consulta con parámetros preparados...');
    const paramQueryResponse = await fetch(`${MCP_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: 'SELECT ? as mensaje, ? as numero',
        params: ['Hola desde MCP', 42]
      })
    });
    const paramResult = await paramQueryResponse.json();
    console.log('Resultado:', paramResult);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejemplo usando cURL (para copiar y pegar en terminal)
const ejemplosCurl = `
# 1. Health Check
curl http://localhost:4000/health

# 2. Información del servidor
curl http://localhost:4000/

# 3. Listar tablas
curl http://localhost:4000/tables

# 4. Ver estructura de una tabla (reemplaza 'usuarios' con tu tabla)
curl http://localhost:4000/table/usuarios

# 5. Ejecutar una consulta simple
curl -X POST http://localhost:4000/query \\
  -H "Content-Type: application/json" \\
  -d '{"sql": "SELECT DATABASE()"}'

# 6. Consulta con parámetros
curl -X POST http://localhost:4000/query \\
  -H "Content-Type: application/json" \\
  -d '{"sql": "SELECT * FROM usuarios WHERE id = ?", "params": [1]}'

# 7. Crear una tabla de ejemplo
curl -X POST http://localhost:4000/query \\
  -H "Content-Type: application/json" \\
  -d '{"sql": "CREATE TABLE IF NOT EXISTS test_mcp (id INT PRIMARY KEY AUTO_INCREMENT, nombre VARCHAR(100), fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"}'

# 8. Insertar datos
curl -X POST http://localhost:4000/query \\
  -H "Content-Type: application/json" \\
  -d '{"sql": "INSERT INTO test_mcp (nombre) VALUES (?)", "params": ["Prueba MCP"]}'

# 9. Consultar datos insertados
curl -X POST http://localhost:4000/query \\
  -H "Content-Type: application/json" \\
  -d '{"sql": "SELECT * FROM test_mcp"}'
`;

// Ejemplo desde Python
const ejemploPython = `
import requests
import json

MCP_URL = "http://localhost:4000"

# 1. Health check
response = requests.get(f"{MCP_URL}/health")
print("Health:", response.json())

# 2. Listar tablas
response = requests.get(f"{MCP_URL}/tables")
print("Tablas:", response.json())

# 3. Ejecutar consulta
response = requests.post(
    f"{MCP_URL}/query",
    json={
        "sql": "SELECT * FROM usuarios LIMIT 5"
    }
)
print("Resultados:", response.json())

# 4. Consulta con parámetros
response = requests.post(
    f"{MCP_URL}/query",
    json={
        "sql": "SELECT * FROM usuarios WHERE email = ?",
        "params": ["usuario@ejemplo.com"]
    }
)
print("Usuario:", response.json())
`;

// Si ejecutas este archivo con Node.js
if (require.main === module) {
  console.log('='.repeat(60));
  console.log('📘 EJEMPLOS DE USO DEL SERVIDOR MCP');
  console.log('='.repeat(60));
  
  console.log('\n🔵 EJEMPLOS CON cURL (para terminal):');
  console.log(ejemplosCurl);
  
  console.log('\n🟢 EJEMPLO CON Python:');
  console.log(ejemploPython);
  
  console.log('\n🟡 Ejecutando ejemplos con fetch...\n');
  ejemploUsandoFetch();
}

module.exports = {
  ejemploUsandoFetch,
  ejemplosCurl,
  ejemploPython
};
