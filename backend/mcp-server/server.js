const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.MCP_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Pool de conexiones a MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'klandemo',
  database: process.env.DB_NAME,
  connectionLimit: 5
});

/**
 * Endpoint para ejecutar consultas SQL
 * POST /query
 * Body: { "sql": "SELECT * FROM tabla", "params": [] }
 */
app.post('/query', async (req, res) => {
  let conn;
  try {
    const { sql, params = [] } = req.body;

    if (!sql) {
      return res.status(400).json({
        error: 'Se requiere una consulta SQL en el campo "sql"'
      });
    }

    conn = await pool.getConnection();
    const result = await conn.query(sql, params);

    // Convertir BigInt a String para serialización JSON
    const serializedResult = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({
      success: true,
      data: serializedResult,
      rowCount: Array.isArray(result) ? result.length : (result.affectedRows ? Number(result.affectedRows) : 0)
    });

  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Endpoint para obtener información de tablas
 * GET /tables
 */
app.get('/tables', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const tables = await conn.query('SHOW TABLES');
    
    res.json({
      success: true,
      data: tables
    });

  } catch (error) {
    console.error('Error obteniendo tablas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Endpoint para obtener estructura de una tabla
 * GET /table/:tableName
 */
app.get('/table/:tableName', async (req, res) => {
  let conn;
  try {
    const { tableName } = req.params;
    
    conn = await pool.getConnection();
    const structure = await conn.query(`DESCRIBE ${tableName}`);
    
    res.json({
      success: true,
      table: tableName,
      structure: structure
    });

  } catch (error) {
    console.error('Error obteniendo estructura de tabla:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Endpoint de health check
 */
app.get('/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Ruta principal con información del servidor
app.get('/', (req, res) => {
  res.json({
    name: 'MariaDB MCP Server',
    version: '1.0.0',
    description: 'Servidor MCP para conexión con MariaDB del Sistema SIGA',
    endpoints: {
      health: 'GET /health',
      tables: 'GET /tables',
      tableStructure: 'GET /table/:tableName',
      query: 'POST /query'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔌 Servidor MCP MariaDB iniciado correctamente`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME || 'sin especificar'}`);
  console.log(`🔗 Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`👤 Usuario: ${process.env.DB_USER || 'root'}`);
  console.log(`${'='.repeat(60)}\n`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n⏹️  Cerrando servidor MCP...');
  await pool.end();
  console.log('✅ Conexiones cerradas correctamente');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Cerrando servidor MCP...');
  await pool.end();
  console.log('✅ Conexiones cerradas correctamente');
  process.exit(0);
});
