#!/usr/bin/env node

// ============================================================================
// GENERADOR DE HASHES DE CONTRASEÑAS PARA USUARIOS DE PRUEBA
// ============================================================================
// Genera los hashes bcrypt necesarios para actualizar el seed.sql
// ============================================================================

const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Password123!';

const usuarios = [
    'admin',
    'jefe.zona.centro',
    'jefe.cmd.madrid',
    'jefe.cmp.madrid.centro',
    'agente.sol',
    'agente.retiro',
    'jefe.cmd.toledo',
    'jefe.zona.norte'
];

console.log('🔐 Generando hashes de contraseñas...\n');
console.log(`   Contraseña por defecto: "${DEFAULT_PASSWORD}"`);
console.log(`   Rounds de bcrypt: ${BCRYPT_ROUNDS}\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function generarHashes() {
    for (const username of usuarios) {
        try {
            const hash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);
            console.log(`Usuario: ${username.padEnd(30)} Hash: ${hash}`);
        } catch (error) {
            console.error(`❌ Error generando hash para ${username}:`, error.message);
        }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Hashes generados correctamente\n');
    console.log('📝 Para actualizar el seed.sql:');
    console.log('   1. Copiar los hashes generados');
    console.log('   2. Reemplazar los valores de password_hash en database/seed.sql');
    console.log('   3. Ejecutar: npm run db:seed\n');
}

generarHashes().catch(console.error);
