/**
 * seed-demo.js
 * Ejecutar desde la carpeta backend:
 *   node scripts/seed-demo.js
 *
 * Genera:
 *  - 1 ubicación / zona / rack con 30 espacios
 *  - 25 clientes
 *  - 30 embarcaciones distribuidas (algunos clientes tienen 2)
 *  - 1 caja abierta
 *  - Cargos mensuales de amarre desde hace 13 meses
 *  - 70% de cargos pagados (pago registrado), 30% del último mes sin pagar → morosidad
 *  - Facturas agrupadas por mes/cliente
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Cargar variables de entorno desde .env (manual si no hay dotenv)
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) return;
  const match = trimmedLine.match(/^([\w.-]+)\s*=\s*(.*)?$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    value = value.split('#')[0].trim(); // Quitar comentarios al final de la línea
    if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.substring(1, value.length - 1);
    env[key] = value.trim();
  }
});

const DB = {
  host: env.DATABASE_HOST || 'localhost',
  port: parseInt(env.DATABASE_PORT || '5432'),
  user: env.DATABASE_USERNAME || 'postgres',
  password: env.DATABASE_PASSWORD || '12781278',
  database: env.DATABASE_NAME || 'guarderia',
  ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// ─── helpers ────────────────────────────────────────────────────────────────

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function toDate(d) {
  return d.toISOString().split('T')[0];
}

// ─── datos ficticios ─────────────────────────────────────────────────────────

const NOMBRES = [
  'Carlos Méndez','Laura Sánchez','Roberto Díaz','Ana Fernández','Miguel Torres',
  'Sofía Ramírez','Diego López','Valentina Gómez','Andrés Martínez','Camila Ruiz',
  'Javier Herrera','Lucía Castro','Mateo Vargas','Isabella Morales','Sebastián Jiménez',
  'Gabriela Romero','Nicolás Flores','Martina Reyes','Emilio Ortega','Daniela Navarro',
  'Fernando Molina','Paula Guerrero','Tomás Medina','Natalia Suárez','Alejandro Peña',
];

const MARCAS = ['Tracker','Yamaha','Sea Ray','Boston Whaler','Grady-White','Bayliner','Chaparral'];
const TIPOS  = ['Lancha','Velero','Catamarán','Yate','Semirígido'];

const MONTO_AMARRE = 45000; // ARS por mes

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const db = new Client(DB);
  await db.connect();
  console.log('✅ Conectado a PostgreSQL');

  try {
    await db.query('BEGIN');

    // ── 1. Limpiar tablas en orden seguro ──────────────────────────────────
    const tables = [
      'pagos','cargos','facturas','movimientos','pedidos',
      'embarcaciones','espacios','racks','zonas','ubicaciones',
      'clientes','cajas',
    ];
    for (const t of tables) {
      await db.query(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE`);
    }
    console.log('🗑️  Tablas limpiadas');

    // ── 2. Infraestructura ─────────────────────────────────────────────────
    const { rows: [ub] } = await db.query(
      `INSERT INTO ubicaciones (nombre, descripcion, "guarderiaId") VALUES ($1,$2,$3) RETURNING id`,
      ['Puerto Demo','Sede de demostración', 1]
    );
    const { rows: [zona] } = await db.query(
      `INSERT INTO zonas (nombre, "ubicacionId", "guarderiaId") VALUES ($1,$2,$3) RETURNING id`,
      ['Guardería Demo', ub.id, 1]
    );
    const { rows: [rack] } = await db.query(
      `INSERT INTO racks (codigo, "zonaId", pisos, filas, columnas, alto, ancho, largo, "tarifaBase", "guarderiaId")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      ['MOD-DEMO', zona.id, 3, 5, 2, 3, 3, 12, 0, 1]
    );

    // 30 espacios (3 pisos × 5 filas × 2 columnas)
    const espacioIds = [];
    let num = 1;
    for (let p = 1; p <= 3; p++) {
      for (let f = 1; f <= 5; f++) {
        for (let c = 1; c <= 2; c++) {
          const { rows: [esp] } = await db.query(
            `INSERT INTO espacios (numero, "rackId", piso, fila, columna, ocupado, "guarderiaId")
             VALUES ($1,$2,$3,$4,$5,false,$6) RETURNING id`,
            [`CUNA-${String(num).padStart(2,'0')}`, rack.id, p, f, c, 1]
          );
          espacioIds.push(esp.id);
          num++;
        }
      }
    }
    console.log(`🏗️  Infraestructura: 1 rack, ${espacioIds.length} espacios`);

    // ── 3. Caja ────────────────────────────────────────────────────────────
    const { rows: [caja] } = await db.query(
      `INSERT INTO cajas ("saldoInicial", "saldoFinal", estado, "fechaApertura", "guarderiaId")
       VALUES ($1, 0, 'ABIERTA', NOW(), $2) RETURNING id`,
      [100000, 1]
    );

    // ── 4. Clientes ────────────────────────────────────────────────────────
    const clienteIds = [];
    for (let i = 0; i < 25; i++) {
      const nombre = NOMBRES[i];
      const { rows: [cl] } = await db.query(
        `INSERT INTO clientes (nombre, telefono, email, dni, activo, "diaFacturacion", descuento, "tipoCuota", "guarderiaId")
         VALUES ($1,$2,$3,$4,true,1,0,'NINGUNA',$5) RETURNING id`,
        [
          nombre,
          `11${rndInt(10000000,99999999)}`,
          `${nombre.toLowerCase().replace(/ /g,'.')}@demo.com`,
          `${rndInt(10000000,40000000)}`,
          1
        ]
      );
      clienteIds.push(cl.id);
    }
    console.log(`👥 ${clienteIds.length} clientes creados`);

    // ── 5. Embarcaciones (30 en 25 clientes, 5 clientes tienen 2) ──────────
    // Los primeros 5 clientes tendrán 2 embarcaciones
    const asignaciones = [
      ...clienteIds.slice(0,5).flatMap(id => [id, id]),  // 5×2 = 10
      ...clienteIds.slice(5),                             // 20×1 = 20
    ]; // total 30

    const embarcacionIds = [];
    const createdAt14MonthsAgo = toDate(addMonths(new Date(), -14));

    for (let i = 0; i < 30; i++) {
      const clienteId = asignaciones[i];
      const espacioId = espacioIds[i];
      const eslora = rndInt(6, 14);
      const manga  = rndInt(2, 4);

      const { rows: [emb] } = await db.query(
        `INSERT INTO embarcaciones
           (nombre, matricula, marca, modelo, eslora, manga, tipo, estado_operativo,
            "clienteId", "espacioId", "createdAt", "updatedAt", "guarderiaId")
         VALUES ($1,$2,$3,$4,$5,$6,$7,'EN_CUNA',$8,$9,$10,$10,$11) RETURNING id`,
        [
          `Embarcación ${i+1}`,
          `MAT-${String(i+1).padStart(3,'0')}`,
          rnd(MARCAS),
          `Modelo ${rndInt(100,999)}`,
          eslora, manga,
          rnd(TIPOS),
          clienteId,
          espacioId,
          createdAt14MonthsAgo,
          1
        ]
      );
      embarcacionIds.push(emb.id);

      // Marcar espacio como ocupado
      await db.query(`UPDATE espacios SET ocupado=true WHERE id=$1`, [espacioId]);
    }
    console.log(`⛵ 30 embarcaciones creadas y asignadas`);

    // ── 6. Cargos + Facturas + Pagos ───────────────────────────────────────
    // 13 meses hacia atrás (mes -13 hasta mes -1 = histórico, mes 0 = actual)
    // Estrategia de morosidad:
    //   - Meses -13 a -2: todos pagados (100%)
    //   - Mes -1 (último mes cerrado): 30% sin pagar → morosidad 30%

    const now = new Date();
    let facturaNum = 1;
    let totalCargos = 0, totalPagados = 0, totalImpagos = 0;

    for (let mesOffset = -13; mesOffset <= -1; mesOffset++) {
      const fechaEmision = addMonths(now, mesOffset);
      fechaEmision.setDate(1);
      const fechaVenc = new Date(fechaEmision);
      fechaVenc.setDate(15); // vence el 15 de cada mes
      const esUltimoMes = mesOffset === -1;

      // Agrupar por cliente: una factura por cliente por mes
      for (const clienteId of clienteIds) {
        // Embarcaciones de este cliente
        const embsCliente = asignaciones
          .map((cid, idx) => ({ cid, embId: embarcacionIds[idx] }))
          .filter(x => x.cid === clienteId);

        if (embsCliente.length === 0) continue;

        const montoTotal = embsCliente.length * MONTO_AMARRE;

        // Crear factura
        const { rows: [factura] } = await db.query(
          `INSERT INTO facturas (numero, "cliente_id", total, "fechaEmision", estado, "guarderiaId")
           VALUES ($1,$2,$3,$4,'PENDIENTE',$5) RETURNING id`,
          [
            `F-${String(facturaNum++).padStart(5,'0')}`,
            clienteId,
            montoTotal,
            toDate(fechaEmision),
            1
          ]
        );

        // Crear un cargo por embarcación
        const cargoIds = [];
        for (const { embId } of embsCliente) {
          const { rows: [cargo] } = await db.query(
            `INSERT INTO cargos
               (cliente_id, descripcion, monto, "fechaEmision", "fechaVencimiento",
                pagado, tipo, factura_id, "guarderiaId")
             VALUES ($1,$2,$3,$4,$5,false,'AMARRE',$6,$7) RETURNING id`,
            [
              clienteId,
              `Amarre mensual - Emb. ${embId}`,
              MONTO_AMARRE,
              toDate(fechaEmision),
              toDate(fechaVenc),
              factura.id,
              1
            ]
          );
          cargoIds.push(cargo.id);
          totalCargos++;
        }

        // Decidir si se paga
        // Último mes: los primeros 8 de 25 clientes NO pagan (~30% de morosidad por monto)
        // Resto de meses: todos pagan
        const idxCliente = clienteIds.indexOf(clienteId);
        const debePagar = esUltimoMes ? (idxCliente >= 8) : true;

        if (debePagar) {
          // Registrar pago por el total de la factura
          const fechaPago = new Date(fechaVenc);
          fechaPago.setDate(fechaPago.getDate() + rndInt(0, 5));

          await db.query(
            `INSERT INTO pagos
               (cliente_id, caja_id, monto, fecha, "metodoPago", comprobante, "guarderiaId")
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
              clienteId,
              caja.id,
              montoTotal,
              toDate(fechaPago),
              rnd(['EFECTIVO','TRANSFERENCIA','TARJETA']),
              `COMP-${String(facturaNum).padStart(5,'0')}`,
              1
            ]
          );

          // Marcar cargos como pagados y factura como pagada
          for (const cargoId of cargoIds) {
            await db.query(`UPDATE cargos SET pagado=true WHERE id=$1`, [cargoId]);
          }
          await db.query(`UPDATE facturas SET estado='PAGADA' WHERE id=$1`, [factura.id]);
          totalPagados += cargoIds.length;
        } else {
          totalImpagos += cargoIds.length;
        }
      }
    }

    await db.query('COMMIT');

    const morosidad = ((totalImpagos / (totalImpagos + totalPagados)) * 100).toFixed(1);
    console.log(`\n✅ Seed completado:`);
    console.log(`   📦 Cargos totales : ${totalCargos}`);
    console.log(`   ✅ Pagados         : ${totalPagados}`);
    console.log(`   ❌ Impagos         : ${totalImpagos}`);
    console.log(`   📊 Morosidad       : ~${morosidad}% (último mes)`);
    console.log(`   🗓️  Período         : ${toDate(addMonths(now,-13))} → ${toDate(addMonths(now,-1))}`);

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Error durante el seed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
