// ============================================================================
// CONFIGURACIÓN DE BASE DE DATOS - POOL DE CONEXIONES MARIADB
// ============================================================================
// Pool de conexiones reutilizables para mejor rendimiento
// ============================================================================

const mariadb = require('mariadb');
require('dotenv').config();

// Crear pool de conexiones
const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'siga_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    connectionLimit: 10, // Número máximo de conexiones simultáneas
    acquireTimeout: 30000, // Timeout para obtener conexión (30 segundos)
    connectTimeout: 10000, // Timeout para conectar (10 segundos)
    timezone: 'UTC', // Usar UTC para evitar problemas con IANA timezone
    trace: process.env.NODE_ENV === 'development', // Debug en desarrollo
    multipleStatements: true, // Permitir múltiples queries en una llamada
    bigIntAsNumber: true // Convertir BigInt a Number automáticamente
});

/**
 * Obtener una conexión del pool
 * @returns {Promise<Connection>} Conexión de base de datos
 */
async function getConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Conexión a base de datos obtenida del pool');
        return conn;
    } catch (error) {
        console.error('❌ Error obteniendo conexión del pool:', error);
        throw error;
    }
}

/**
 * Ejecutar una query con el pool
 * @param {string} sql - Query SQL
 * @param {Array} params - Parámetros de la query
 * @returns {Promise<Array>} Resultados de la query
 */
async function query(sql, params = []) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ Error ejecutando query:', error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

/**
 * Ejecutar una transacción
 * @param {Function} callback - Función que recibe la conexión y ejecuta queries
 * @returns {Promise<any>} Resultado de la transacción
 */
async function transaction(callback) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();
        
        const result = await callback(conn);
        
        await conn.commit();
        return result;
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('❌ Error en transacción:', error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

/**
 * Verificar conexión a la base de datos
 * @returns {Promise<boolean>} True si la conexión es exitosa
 */
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        const result = await conn.query('SELECT 1 as test');
        conn.release();
        console.log('✅ Conexión a base de datos verificada correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error conectando a base de datos:', error.message);
        return false;
    }
}

/**
 * Cerrar el pool de conexiones
 */
async function closePool() {
    try {
        await pool.end();
        console.log('✅ Pool de conexiones cerrado');
    } catch (error) {
        console.error('❌ Error cerrando pool:', error);
    }
}

// Manejar cierre gracioso de la aplicación
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando aplicación...');
    await closePool();
    process.exit(0);
});

module.exports = {
    pool,
    getConnection,
    query,
    transaction,
    testConnection,
    closePool
};
