const pg = require('pg');

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_gnKk6U7mePhX@ep-cool-bonus-b4dogngv.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const schema = 'inst_parcela_1';

async function run() {
  console.log('Creando esquema e instanciando tablas...');
  await pool.query('CREATE SCHEMA IF NOT EXISTS ' + schema);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.sectores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        responsable VARCHAR(100),
        area_total_ha NUMERIC(8,2)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.variedades (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        especie VARCHAR(100) NOT NULL,
        ciclo_dias INTEGER DEFAULT 120,
        rendimiento_estimado_ton_ha NUMERIC(6,2)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.parcelas (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        hectareas NUMERIC(8,2) NOT NULL,
        tipo_suelo VARCHAR(50) DEFAULT 'Franco Arcilloso',
        altitud_msnm INTEGER DEFAULT 1500,
        latitud NUMERIC(10,6),
        longitud NUMERIC(10,6),
        estado VARCHAR(30) DEFAULT 'EN_PRODUCCION'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.suelos (
        id SERIAL PRIMARY KEY,
        parcela_id INTEGER REFERENCES ${schema}.parcelas(id) ON DELETE CASCADE,
        materia_organica_pct NUMERIC(4,2),
        nitrogeno_ppm NUMERIC(6,2),
        fosforo_ppm NUMERIC(6,2),
        potasio_ppm NUMERIC(6,2),
        fecha_analisis DATE DEFAULT CURRENT_DATE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.bitacora (
        id BIGSERIAL PRIMARY KEY,
        parcela_id INTEGER REFERENCES ${schema}.parcelas(id),
        actividad VARCHAR(150) NOT NULL,
        observaciones TEXT,
        responsable VARCHAR(100),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.cultivos (
        id SERIAL PRIMARY KEY,
        parcela_id INTEGER REFERENCES ${schema}.parcelas(id) ON DELETE CASCADE,
        variedad_id INTEGER REFERENCES ${schema}.variedades(id),
        fecha_siembra DATE DEFAULT CURRENT_DATE,
        fecha_cosecha_estimada DATE,
        densidad_plantas_ha INTEGER,
        estado VARCHAR(30) DEFAULT 'VEGETATIVO'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.siembras (
        id SERIAL PRIMARY KEY,
        cultivo_id INTEGER REFERENCES ${schema}.cultivos(id) ON DELETE CASCADE,
        lote VARCHAR(50) NOT NULL,
        metodo_siembra VARCHAR(50) DEFAULT 'Directa Mecanizada',
        semilla_kg_ha NUMERIC(6,2),
        costo_estimado NUMERIC(10,2)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.cosechas (
        id SERIAL PRIMARY KEY,
        cultivo_id INTEGER REFERENCES ${schema}.cultivos(id),
        fecha_cosecha DATE DEFAULT CURRENT_DATE,
        rendimiento_total_ton NUMERIC(8,2) NOT NULL,
        calidad VARCHAR(20) DEFAULT 'PRIMERA',
        humedad_grano_pct NUMERIC(5,2)
    );
  `);

  console.log('✓ ESQUEMA Y 8 TABLAS APROVISIONADAS CON ÉXITO EN NEON');
  await pool.end();
}

run().catch(err => {
  console.error('Error:', err);
  pool.end();
});
