const { Client } = require('pg');

async function checkDuplicates() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'guarderia',
    password: '12781278',
    port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, nombre, matricula FROM embarcaciones ORDER BY id ASC;');
    console.log('--- Embarcaciones ---');
    console.table(res.rows);
    
    const dupes = await client.query('SELECT nombre, matricula, COUNT(*) FROM embarcaciones GROUP BY nombre, matricula HAVING COUNT(*) > 1;');
    console.log('--- Duplicates ---');
    console.table(dupes.rows);
    
    await client.end();
  } catch (err) {
    console.error('Error connecting to DB:', err);
  }
}

checkDuplicates();
