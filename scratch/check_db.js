
const { createConnection } = require('typeorm');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function checkMovimientos() {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [path.join(__dirname, '../backend/src/**/**.entity.ts')],
    });

    const count = await connection.getRepository('movimientos').count();
    console.log(`Total movimientos: ${count}`);
    
    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMovimientos();
