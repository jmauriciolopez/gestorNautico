const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.substring(1, value.length - 1);
    env[key] = value;
  }
});

const DB = {
  host: env.DATABASE_HOST || 'localhost',
  port: parseInt(env.DATABASE_PORT || '5432'),
  user: env.DATABASE_USERNAME || 'postgres',
  password: env.DATABASE_PASSWORD || '12781278',
  database: env.DATABASE_NAME || 'guarderia',
};

async function main() {
  const client = new Client(DB);
  
  try {
    console.log(`🔌 Conectando a la base de datos ${DB.database}...`);
    await client.connect();
    
    console.log('🗑️  Eliminando esquema public...');
    await client.query('DROP SCHEMA public CASCADE');
    
    console.log('🏗️  Recreando esquema public...');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    
    console.log('✅ Base de datos reseteada desde cero.');
    console.log('💡 Reinicia el servidor backend para que TypeORM recree las tablas.');
  } catch (err) {
    console.error('❌ Error durante el reset de la base de datos:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
