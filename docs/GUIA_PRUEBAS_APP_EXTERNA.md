# Guía de Conexión y Pruebas Externas para Instancias AgroCloud (DBaaS)

Este documento detalla la arquitectura de conexión a las instancias de bases de datos de AgroCloud, cómo conectarse a ellas en entornos locales o desplegados en la nube (**Render** / AWS / VPS), el **diagrama de relaciones de datos con su orden estricto de inserción**, y proporciona el prompt exacto y el código listo para construir una **aplicación web externa de pruebas**.

---

## 1. Arquitectura de Conexión Multi-Tenant

AgroCloud gestiona bases de datos bajo el modelo **Schema-per-Instance**:
- **Clúster físico**: Un motor PostgreSQL único por entorno (en local corre en Docker; en producción correrá en Render/RDS/Supabase).
- **Aislamiento**: Cada instancia creada por un cliente se provisiona como un **esquema PostgreSQL independiente** (`inst_<nombre_instancia>_<hash>`).
- **Seguridad**: Las tablas de cada cliente residen dentro de su propio esquema, aislando completamente sus datos de otros clientes.

---

## 2. Parámetros de Conexión según el Entorno

### A. Entorno Local (Docker en tu PC)
- **Host**: `localhost` o `127.0.0.1`
- **Puerto**: `15432` *(puerto expuesto hacia Windows)*
- **Base de Datos**: `agrocloud_db`
- **Usuario**: `agrocloud_user`
- **Contraseña**: `agrocloud_secure_pass_2026`
- **Esquema (`search_path`)**: `inst_parcela_de_peces_8b16fd` *(o el de la instancia a probar)*

### B. Entorno en la Nube (Cuando la BD esté en Render)
Cuando despliegues PostgreSQL en Render:
- **Host**: `dpg-xxxxxxxxx-a.oregon-postgres.render.com` (External Database URL provista por Render)
- **Puerto**: `5432`
- **Base de Datos**: Nombre asignado en Render (ej. `agrocloud_db_prod`)
- **Usuario**: Usuario provisto por Render
- **Contraseña**: Contraseña provista por Render
- **Esquema (`search_path`)**: El nombre del esquema de la instancia (`inst_<nombre>_<hash>`)
- **SSL**: `require` (Obligatorio en conexiones externas de Render)

---

## 3. Explicación del Modelo de Datos y Orden de Inserción

Para la plantilla **"Cultivos y parcelas"** (la que tiene tu instancia), las 8 tablas tienen dependencias relacionales por llaves foráneas (`FOREIGN KEY`). Entender este orden es fundamental para que una aplicación externa inserte datos válidos sin errores de integridad referencial:

### Diagrama de Relaciones y Dependencias

```text
  [SECTORES] (Tabla Independiente)
  
  [PARCELAS] ──────────────────────────┬──────────────────────────┐
      ▲                                │                          │
      │                                ▼                          ▼
      │ FK (parcela_id)            [SUELOS]                   [BITACORA]
      │                         (Requiere Parcela)         (Requiere Parcela)
  [CULTIVOS] ◄── FK (variedad_id) ── [VARIEDADES]
      │
      ├────────────────────────┐
      ▼                        ▼
  [SIEMBRAS]               [COSECHAS]
(Requiere Cultivo)      (Requiere Cultivo)
```

---

### Orden de Inserción Obligatorio (Paso a Paso)

| Paso | Tabla | Tipo | Campos Requeridos | ¿Por qué en este orden? |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **`sectores`** | Independiente | `nombre` | No depende de nadie. Modela divisiones físicas generales de la finca. |
| **2** | **`variedades`** | Independiente | `nombre`, `especie` | Catálogo de semillas/cultivares (ej. Café Borbón, Maíz H-59). No tiene llaves foráneas. |
| **3** | **`parcelas`** | Independiente | `codigo`, `nombre`, `hectareas` | Representa el lote geográfico. Es la base para sembrar y registrar análisis. |
| **4** | **`suelos`** | Dependiente | `parcela_id` (FK), `materia_organica_pct`, `nitrogeno_ppm` | Análisis de laboratorio. **Requiere que exista primero una Parcela**. |
| **5** | **`bitacora`** | Dependiente | `parcela_id` (FK), `actividad`, `responsable` | Registro de actividades y tareas. **Requiere que exista primero una Parcela**. |
| **6** | **`cultivos`** | Intermedia / Clave | `parcela_id` (FK), `variedad_id` (FK), `fecha_siembra` | Representa la siembra activa. **Requiere que existan previamente la Parcela y la Variedad**. |
| **7** | **`siembras`** | Dependiente | `cultivo_id` (FK), `lote`, `semilla_kg_ha` | Detalle operativo de la siembra. **Requiere que exista el Cultivo**. |
| **8** | **`cosechas`** | Dependiente | `cultivo_id` (FK), `rendimiento_total_ton` | Registro de recolección y rendimiento final. **Requiere que exista el Cultivo**. |

---

### Ejemplos de Consultas SQL en el Orden Correcto

```sql
-- 1. Crear un sector (libre)
INSERT INTO sectores (nombre, responsable, area_total_ha)
VALUES ('Sector Norte', 'Ing. Carlos Mendoza', 45.0);

-- 2. Crear una variedad (libre)
INSERT INTO variedades (nombre, especie, ciclo_dias, rendimiento_estimado_ton_ha)
VALUES ('Café Geisha', 'Coffea arabica', 240, 2.5);

-- 3. Crear una parcela (libre)
INSERT INTO parcelas (codigo, nombre, hectareas, tipo_suelo, altitud_msnm, estado)
VALUES ('LOTE-01', 'Finca Los Pinos', 12.0, 'Franco Arenoso', 1450, 'EN_PRODUCCION');

-- 4. Registrar análisis de suelo (usa el ID de la parcela creada en el paso 3)
INSERT INTO suelos (parcela_id, materia_organica_pct, nitrogeno_ppm, fosforo_ppm, potasio_ppm)
VALUES (1, 3.8, 45.2, 18.5, 210.0);

-- 5. Registrar actividad en bitácora (usa el ID de la parcela creada en el paso 3)
INSERT INTO bitacora (parcela_id, actividad, observaciones, responsable)
VALUES (1, 'Calibración de Riego', 'Se ajustó caudal matutino.', 'Tec. Mario');

-- 6. Crear un cultivo (relaciona Parcela ID=1 y Variedad ID=1)
INSERT INTO cultivos (parcela_id, variedad_id, fecha_siembra, fecha_cosecha_estimada, estado)
VALUES (1, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '200 days', 'VEGETATIVO');

-- 7. Registrar siembra detallada (usa el ID del cultivo creado en el paso 6)
INSERT INTO siembras (cultivo_id, lote, metodo_siembra, semilla_kg_ha, costo_estimado)
VALUES (1, 'Lote A1', 'Directa', 25.0, 1500.00);

-- 8. Registrar cosecha (usa el ID del cultivo creado en el paso 6)
INSERT INTO cosechas (cultivo_id, rendimiento_total_ton, calidad, humedad_grano_pct)
VALUES (1, 14.8, 'PRIMERA', 12.5);
```

---

## 4. Prompt Maestro para Generar la Aplicación Web Externa de Pruebas

Copia y pega el siguiente prompt en tu asistente de IA (o en un nuevo proyecto) para crear la aplicación web externa:

```markdown
Necesito crear una aplicación web fullstack sencilla y moderna en React (Vite o Next.js) con un backend en Node.js (Express) para probar la conexión, visualización y manipulación de datos en una instancia de base de datos de AgroCloud (PostgreSQL en Docker local o Render).

### Contexto y Requisitos Técnicos:
1. **Conexión Dinámica a PostgreSQL:**
   - Debe permitir configurar en pantalla o vía .env: Host, Port (15432 local o 5432 Render), Database, User, Password, Schema (ej. inst_parcela_de_peces_8b16fd) y SSL (true/false).
   - El pool de conexión de `pg` debe inicializarse con: `options: -c search_path=${SCHEMA},public` para que todas las consultas SQL consulten directamente las tablas de la instancia sin necesidad de escribir el nombre del esquema en el query.

2. **Comprensión del Modelo de Datos (Plantilla Cultivos y Parcelas):**
   La base de datos tiene 8 tablas organizadas con el siguiente flujo de dependencia:
   - **Tablas maestras (sin llaves foráneas):** `sectores`, `variedades`, `parcelas`.
   - **Tablas hijas de Parcelas:** `suelos` (FK parcela_id), `bitacora` (FK parcela_id).
   - **Tabla central de producción:** `cultivos` (FK parcela_id y FK variedad_id).
   - **Tablas hijas de Cultivos:** `siembras` (FK cultivo_id), `cosechas` (FK cultivo_id).

3. **Funcionalidades de la App:**
   - **Dashboard de Estado:** Botón "Probar Conexión" que ejecute `SELECT current_schema(), version();` y muestre el esquema activo y estado de conexión.
   - **Visor de Tablas:** Desplegable con las 8 tablas, mostrando total de filas y la cuadrícula con los datos.
   - **Asistente de Inserción Guiado:** 
     - Un formulario por pasos o con selects dinámicos que respete las llaves foráneas:
       1. Permitir crear una Parcela o Variedad directamente.
       2. Al crear un Cultivo, permitir elegir la Parcela y la Variedad existentes mediante un dropdown.
       3. Al registrar una Siembra o Cosecha, permitir elegir un Cultivo existente.
   - **Limpieza / Reset:** Botón para truncar tablas si se desea volver a dejar la base en blanco.

4. **Diseño:**
   - UI profesional con Tailwind CSS y modo oscuro o neutro.
   - Sin emojis en botones ni títulos (usar iconos SVG).

Entrégame el backend en Express (`server.js`) con las rutas REST para tablas, datos e inserciones, y el frontend principal listo para correr.
```

---

## 5. Código de Prueba Rápida en Node.js (Flujo Relacional Completo)

Puedes probar este flujo relacional de inmediato ejecutando este script en Node.js (`test-flow.js`):

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 15432,
  database: process.env.DB_NAME || 'agrocloud_db',
  user: process.env.DB_USER || 'agrocloud_user',
  password: process.env.DB_PASSWORD || 'agrocloud_secure_pass_2026',
  options: `-c search_path=${process.env.DB_SCHEMA || 'inst_parcela_de_peces_8b16fd'},public`,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function main() {
  console.log("=== INICIANDO PRUEBA RELACIONAL DBaaS ===");
  try {
    // 1. Crear Parcela (Maestra)
    const parc = await pool.query(`
      INSERT INTO parcelas (codigo, nombre, hectareas, tipo_suelo)
      VALUES ($1, $2, $3, $4) RETURNING id, codigo, nombre;
    `, ['P-01', 'Finca Demostración', 20.0, 'Franco Arenoso']);
    const parcelaId = parc.rows[0].id;
    console.log(`[1] Parcela creada: ${parc.rows[0].nombre} (ID: ${parcelaId})`);

    // 2. Crear Variedad (Maestra)
    const varRes = await pool.query(`
      INSERT INTO variedades (nombre, especie, ciclo_dias)
      VALUES ($1, $2, $3) RETURNING id, nombre;
    `, ['Geisha Especial', 'Coffea arabica', 240]);
    const variedadId = varRes.rows[0].id;
    console.log(`[2] Variedad creada: ${varRes.rows[0].nombre} (ID: ${variedadId})`);

    // 3. Crear Cultivo (Relaciona Parcela + Variedad)
    const cultRes = await pool.query(`
      INSERT INTO cultivos (parcela_id, variedad_id, estado)
      VALUES ($1, $2, 'VEGETATIVO') RETURNING id;
    `, [parcelaId, variedadId]);
    const cultivoId = cultRes.rows[0].id;
    console.log(`[3] Cultivo creado (ID: ${cultivoId}) vinculando Parcela ${parcelaId} y Variedad ${variedadId}`);

    // 4. Crear Siembra (Hija de Cultivo)
    const siembRes = await pool.query(`
      INSERT INTO siembras (cultivo_id, lote, semilla_kg_ha)
      VALUES ($1, 'Lote Central', 30.0) RETURNING id, lote;
    `, [cultivoId]);
    console.log(`[4] Siembra registrada: ${siembRes.rows[0].lote} (ID: ${siembRes.rows[0].id})`);

    console.log("\n Flujo relacional completado con integridad referencial perfecta.");
  } catch (err) {
    console.error(" Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
```

---

## 6. Verificación en AgroCloud

Abre tu navegador en [http://localhost:5173/](http://localhost:5173/) ➔ **Instancias** ➔ **Ver Tablas**:
1. Podrás seleccionar cada una de las tablas del desplegable lateral (`parcelas`, `variedades`, `cultivos`, `siembras`).
2. Comprobarás que los datos insertados desde la aplicación externa se leen y renderizan automáticamente en la plataforma.
