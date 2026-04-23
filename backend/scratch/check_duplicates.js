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
    const res = await client.query(`
      SELECT matricula, COUNT(*) 
      FROM embarcaciones 
      GROUP BY matricula 
      HAVING COUNT(*) > 1
    `);
    console.log('Duplicates found:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkDuplicates();
