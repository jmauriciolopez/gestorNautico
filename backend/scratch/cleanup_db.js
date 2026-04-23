const { Client } = require('pg');

async function cleanupDuplicates() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'guarderia',
    password: '12781278',
    port: 5432,
  });

  try {
    await client.connect();
    
    // SQL para borrar duplicados manteniendo el ID más bajo
    const deleteQuery = `
      DELETE FROM embarcaciones
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY UPPER(TRIM(matricula)) ORDER BY id ASC) as row_num
          FROM embarcaciones
        ) t
        WHERE t.row_num > 1
      );
    `;

    const res = await client.query(deleteQuery);
    console.log(`--- Limpieza completada ---`);
    console.log(`Registros eliminados: ${res.rowCount}`);
    
    await client.end();
  } catch (err) {
    console.error('Error durante la limpieza:', err);
  }
}

cleanupDuplicates();
