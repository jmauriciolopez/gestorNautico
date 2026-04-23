const { Client } = require('pg');

async function checkEspacio() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'guarderia',
    password: '12781278',
    port: 5432,
  });

  try {
    await client.connect();
    
    console.log('--- Boat with espacioId = 14 ---');
    const res = await client.query('SELECT id, nombre, matricula, "espacioId" FROM embarcaciones WHERE "espacioId" = 14;');
    console.table(res.rows);
    
    console.log('--- All occupied spaces in embarcaciones table ---');
    const all = await client.query('SELECT id, nombre, matricula, "espacioId" FROM embarcaciones WHERE "espacioId" IS NOT NULL;');
    console.table(all.rows);

    await client.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkEspacio();
