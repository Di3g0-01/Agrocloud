package com.agrocloud.backend.instance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class InstanceSchemaProvisioningService {

    private static final Logger log = LoggerFactory.getLogger(InstanceSchemaProvisioningService.class);

    private final JdbcTemplate jdbcTemplate;

    public InstanceSchemaProvisioningService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Sanitiza el nombre para que sea un identificador SQL seguro.
     */
    public String sanitizeSchemaName(String name) {
        String clean = name.toLowerCase().replaceAll("[^a-z0-9_]", "_");
        if (clean.length() > 40) {
            clean = clean.substring(0, 40);
        }
        return "inst_" + clean;
    }

    /**
     * Crea el esquema para la instancia y ejecuta el DDL y datos de prueba según la plantilla.
     */
    public void provisionSchema(String schemaName, String templateName) {
        log.info("Aprovisionando esquema DBaaS: {} con plantilla: {}", schemaName, templateName);
        try {
            // 1. Crear esquema
            jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS " + schemaName);

            // 2. Ejecutar DDL y DML según la plantilla seleccionada
            List<String> statements = getStatementsForTemplate(schemaName, templateName);
            for (String sql : statements) {
                jdbcTemplate.execute(sql);
            }
            log.info("Aprovisionamiento exitoso para el esquema {}", schemaName);
        } catch (Exception e) {
            log.error("Error al aprovisionar esquema {}: {}", schemaName, e.getMessage(), e);
            throw new RuntimeException("Fallo al aprovisionar las tablas de la instancia en PostgreSQL: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina el esquema y todas sus tablas al eliminar la instancia.
     */
    public void dropSchema(String schemaName) {
        if (schemaName != null && schemaName.startsWith("inst_")) {
            log.info("Eliminando esquema DBaaS y sus tablas: {}", schemaName);
            try {
                jdbcTemplate.execute("DROP SCHEMA IF EXISTS " + schemaName + " CASCADE");
            } catch (Exception e) {
                log.warn("No se pudo eliminar el esquema {}: {}", schemaName, e.getMessage());
            }
        }
    }

    /**
     * Lista todas las tablas creadas dentro del esquema de la instancia junto con el conteo de filas.
     */
    public List<Map<String, Object>> getTablesInSchema(String schemaName) {
        String sql = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? 
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """;
        List<String> tableNames = jdbcTemplate.queryForList(sql, String.class, schemaName);
        List<Map<String, Object>> result = new ArrayList<>();

        for (String tName : tableNames) {
            Long count = 0L;
            try {
                count = jdbcTemplate.queryForObject("SELECT count(*) FROM " + schemaName + "." + tName, Long.class);
            } catch (Exception ignored) {}

            result.add(Map.of(
                "nombre", tName,
                "esquema", schemaName,
                "totalFilas", count != null ? count : 0L
            ));
        }
        return result;
    }

    /**
     * Calcula el tamaño real en disco (en GB) ocupado por un esquema específico.
     */
    public double calculateSchemaStorageGb(String schemaName) {
        if (schemaName == null || !schemaName.startsWith("inst_")) {
            return 0.05;
        }
        try {
            String sql = """
                SELECT COALESCE(SUM(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))), 0)
                FROM pg_tables
                WHERE schemaname = ?
            """;
            Long bytes = jdbcTemplate.queryForObject(sql, Long.class, schemaName);
            if (bytes == null || bytes <= 0L) {
                return 0.05;
            }
            // Retorna los GB con un máximo de 4 decimales exactos
            double gb = (double) bytes / (1024.0 * 1024.0 * 1024.0);
            double clamped = Math.max(0.0001, gb);
            return java.math.BigDecimal.valueOf(clamped)
                    .setScale(4, java.math.RoundingMode.HALF_UP)
                    .doubleValue();
        } catch (Exception e) {
            log.warn("No se pudo calcular el tamaño del esquema {}: {}", schemaName, e.getMessage());
            return 0.05;
        }
    }

    /**
     * Crea una nueva tabla definida por el usuario dentro del esquema de la instancia.
     */
    public void createCustomTable(String schemaName, String tableName, List<com.agrocloud.backend.instance.dto.CreateCustomTableRequest.ColumnDefinition> columns) {
        if (!tableName.matches("^[a-zA-Z][a-zA-Z0-9_]{1,40}$")) {
            throw new IllegalArgumentException("Nombre de tabla no válido");
        }
        if (columns == null || columns.isEmpty()) {
            throw new IllegalArgumentException("Debes definir al menos una columna");
        }

        StringBuilder sql = new StringBuilder();
        sql.append("CREATE TABLE ").append(schemaName).append(".").append(tableName).append(" (");

        boolean hasId = false;
        List<String> colDefs = new ArrayList<>();

        for (var col : columns) {
            if (!col.name().matches("^[a-zA-Z][a-zA-Z0-9_]{0,40}$")) {
                throw new IllegalArgumentException("Nombre de columna no válido: " + col.name());
            }
            String colType = col.type().toUpperCase();
            if (!colType.matches("^(VARCHAR|TEXT|INTEGER|BIGINT|NUMERIC|BOOLEAN|DATE|TIMESTAMP|SERIAL|BIGSERIAL)$")) {
                throw new IllegalArgumentException("Tipo no permitido: " + colType);
            }

            StringBuilder def = new StringBuilder(col.name()).append(" ");
            if ("VARCHAR".equals(colType)) {
                int len = (col.length() != null && col.length() > 0 && col.length() <= 1000) ? col.length() : 100;
                def.append("VARCHAR(").append(len).append(")");
            } else if ("NUMERIC".equals(colType)) {
                def.append("NUMERIC(12,2)");
            } else {
                def.append(colType);
            }

            if (Boolean.TRUE.equals(col.primaryKey())) {
                def.append(" PRIMARY KEY");
                hasId = true;
            } else if (Boolean.FALSE.equals(col.nullable())) {
                def.append(" NOT NULL");
            }

            if (col.defaultValue() != null && !col.defaultValue().isBlank()) {
                String safeVal = col.defaultValue().replaceAll("[';]", "");
                def.append(" DEFAULT '").append(safeVal).append("'");
            }
            colDefs.add(def.toString());
        }

        // Si el usuario no definió llave primaria, creamos un id SERIAL PRIMARY KEY por convención
        if (!hasId) {
            sql.append("id SERIAL PRIMARY KEY, ");
        }

        sql.append(String.join(", ", colDefs));
        sql.append(");");

        log.info("Creando tabla personalizada en esquema {}: {}", schemaName, sql);
        jdbcTemplate.execute(sql.toString());
    }

    /**
     * Consulta las filas de una tabla dentro del esquema de la instancia.
     */
    public List<Map<String, Object>> getTableRows(String schemaName, String tableName, int limit) {
        // Validación de nombres de identificadores para evitar SQL injection
        if (!tableName.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("Nombre de tabla no válido");
        }
        int safeLimit = Math.min(Math.max(limit, 1), 200);
        String sql = "SELECT * FROM " + schemaName + "." + tableName + " ORDER BY 1 DESC LIMIT " + safeLimit;
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Obtiene los metadatos de las columnas de una tabla (nombre, tipo, nullable).
     */
    public List<Map<String, Object>> getTableColumns(String schemaName, String tableName) {
        if (!tableName.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("Nombre de tabla no válido");
        }
        String sql = """
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = ? AND table_name = ?
            ORDER BY ordinal_position;
        """;
        return jdbcTemplate.queryForList(sql, schemaName, tableName);
    }

    /**
     * Inserta un nuevo registro en una tabla dentro del esquema de la instancia.
     */
    public Map<String, Object> insertTableRow(String schemaName, String tableName, Map<String, Object> data) {
        if (!tableName.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("Nombre de tabla no válido");
        }
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("No se proporcionaron datos para insertar");
        }

        List<String> colNames = new ArrayList<>();
        List<String> placeholders = new ArrayList<>();
        List<Object> values = new ArrayList<>();

        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String col = entry.getKey();
            if (!col.matches("^[a-zA-Z0-9_]+$") || "id".equalsIgnoreCase(col)) {
                continue; // Evita alterar id serial automático o nombres maliciosos
            }
            colNames.add(col);
            placeholders.add("?");
            values.add(entry.getValue());
        }

        if (colNames.isEmpty()) {
            throw new IllegalArgumentException("No hay columnas válidas para insertar");
        }

        String sql = "INSERT INTO " + schemaName + "." + tableName + " (" +
                String.join(", ", colNames) + ") VALUES (" +
                String.join(", ", placeholders) + ") RETURNING *";

        log.info("Insertando fila en {}.{}: {}", schemaName, tableName, sql);
        return jdbcTemplate.queryForMap(sql, values.toArray());
    }

    private List<String> getStatementsForTemplate(String schema, String templateName) {
        List<String> stmts = new ArrayList<>();
        String t = templateName != null ? templateName.toLowerCase() : "";

        if (t.contains("riego") || t.contains("fertiliz")) {
            // Plantilla: Monitoreo de riego y fertilización
            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.sensores (
                    id SERIAL PRIMARY KEY,
                    codigo VARCHAR(50) NOT NULL UNIQUE,
                    tipo VARCHAR(50) NOT NULL,
                    ubicacion VARCHAR(100) NOT NULL,
                    bateria_porcentaje NUMERIC(5,2) DEFAULT 100.0,
                    estado VARCHAR(20) DEFAULT 'OPERATIVO',
                    instalado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.lecturas (
                    id BIGSERIAL PRIMARY KEY,
                    sensor_id INTEGER REFERENCES %s.sensores(id) ON DELETE CASCADE,
                    humedad_suelo_pct NUMERIC(5,2),
                    temperatura_celsius NUMERIC(5,2),
                    ph_suelo NUMERIC(4,2),
                    conductividad_ec NUMERIC(5,2),
                    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """.formatted(schema, schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.valvulas (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(100) NOT NULL,
                    sector VARCHAR(100) NOT NULL,
                    estado VARCHAR(20) DEFAULT 'CERRADA',
                    caudal_lpm NUMERIC(8,2) DEFAULT 0.0
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.programas_riego (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(100) NOT NULL,
                    dias_semana VARCHAR(50) NOT NULL,
                    hora_inicio TIME NOT NULL,
                    duracion_minutos INTEGER NOT NULL,
                    activo BOOLEAN DEFAULT TRUE
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.fertilizantes (
                    id SERIAL PRIMARY KEY,
                    nombre_comercial VARCHAR(100) NOT NULL,
                    composicion_npk VARCHAR(50),
                    stock_kg NUMERIC(10,2) DEFAULT 0.0
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.aplicaciones (
                    id SERIAL PRIMARY KEY,
                    fertilizante_id INTEGER REFERENCES %s.fertilizantes(id),
                    sector VARCHAR(100) NOT NULL,
                    dosis_kg NUMERIC(8,2) NOT NULL,
                    fecha_aplicacion DATE DEFAULT CURRENT_DATE
                );
            """.formatted(schema, schema));



        } else if (t.contains("plaga") || t.contains("fitosanitario")) {
            // Plantilla: Control de plagas y fitosanitario
            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.plagas (
                    id SERIAL PRIMARY KEY,
                    nombre_comun VARCHAR(100) NOT NULL,
                    nombre_cientifico VARCHAR(100),
                    nivel_amenaza VARCHAR(30) DEFAULT 'MODERADO',
                    cultivos_afectados VARCHAR(255)
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.monitoreos (
                    id SERIAL PRIMARY KEY,
                    plaga_id INTEGER REFERENCES %s.plagas(id),
                    sector VARCHAR(100) NOT NULL,
                    incidencia_porcentaje NUMERIC(5,2) NOT NULL,
                    responsable VARCHAR(100),
                    fecha_muestreo DATE DEFAULT CURRENT_DATE
                );
            """.formatted(schema, schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.productos_fitosanitarios (
                    id SERIAL PRIMARY KEY,
                    nombre_comercial VARCHAR(100) NOT NULL,
                    ingrediente_activo VARCHAR(100),
                    tipo VARCHAR(50),
                    periodo_carencia_dias INTEGER DEFAULT 7,
                    stock_litros NUMERIC(8,2) DEFAULT 0.0
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.aplicaciones (
                    id SERIAL PRIMARY KEY,
                    producto_id INTEGER REFERENCES %s.productos_fitosanitarios(id),
                    sector VARCHAR(100) NOT NULL,
                    dosis_por_ha VARCHAR(50),
                    fecha_aplicacion DATE DEFAULT CURRENT_DATE,
                    estado VARCHAR(30) DEFAULT 'COMPLETADO'
                );
            """.formatted(schema, schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.periodos_carencia (
                    id SERIAL PRIMARY KEY,
                    sector VARCHAR(100) NOT NULL,
                    fecha_inicio DATE NOT NULL,
                    fecha_cosecha_permitida DATE NOT NULL,
                    estado VARCHAR(20) DEFAULT 'ACTIVO'
                );
            """.formatted(schema));

        } else if (t.contains("inventario") || t.contains("bodega")) {
            // Plantilla: Inventarios y bodegas agrícolas
            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.bodegas (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(100) NOT NULL,
                    encargado VARCHAR(100),
                    ubicacion VARCHAR(150),
                    capacidad_m3 NUMERIC(10,2)
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.proveedores (
                    id SERIAL PRIMARY KEY,
                    razon_social VARCHAR(150) NOT NULL,
                    contacto VARCHAR(100),
                    telefono VARCHAR(50),
                    correo VARCHAR(100)
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.insumos (
                    id SERIAL PRIMARY KEY,
                    codigo VARCHAR(50) NOT NULL UNIQUE,
                    nombre VARCHAR(100) NOT NULL,
                    categoria VARCHAR(50),
                    unidad_medida VARCHAR(20),
                    stock_actual NUMERIC(10,2) DEFAULT 0.0,
                    stock_minimo NUMERIC(10,2) DEFAULT 10.0
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.maquinaria (
                    id SERIAL PRIMARY KEY,
                    codigo VARCHAR(50) NOT NULL UNIQUE,
                    tipo VARCHAR(50) NOT NULL,
                    marca_modelo VARCHAR(100),
                    horas_operacion NUMERIC(10,2) DEFAULT 0.0,
                    estado VARCHAR(30) DEFAULT 'DISPONIBLE'
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.mantenimientos (
                    id SERIAL PRIMARY KEY,
                    maquinaria_id INTEGER REFERENCES %s.maquinaria(id),
                    tipo VARCHAR(50),
                    fecha DATE DEFAULT CURRENT_DATE,
                    costo NUMERIC(10,2) DEFAULT 0.0,
                    descripcion TEXT
                );
            """.formatted(schema, schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.movimientos (
                    id SERIAL PRIMARY KEY,
                    insumo_id INTEGER REFERENCES %s.insumos(id),
                    bodega_id INTEGER REFERENCES %s.bodegas(id),
                    tipo_movimiento VARCHAR(20) NOT NULL,
                    cantidad NUMERIC(10,2) NOT NULL,
                    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    responsable VARCHAR(100)
                );
            """.formatted(schema, schema, schema));

        } else {
            // Plantilla por defecto: Cultivos y parcelas
            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.parcelas (
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
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.variedades (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(100) NOT NULL,
                    especie VARCHAR(100) NOT NULL,
                    ciclo_dias INTEGER DEFAULT 120,
                    rendimiento_estimado_ton_ha NUMERIC(6,2)
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.cultivos (
                    id SERIAL PRIMARY KEY,
                    parcela_id INTEGER REFERENCES %s.parcelas(id) ON DELETE CASCADE,
                    variedad_id INTEGER REFERENCES %s.variedades(id),
                    fecha_siembra DATE DEFAULT CURRENT_DATE,
                    fecha_cosecha_estimada DATE,
                    densidad_plantas_ha INTEGER,
                    estado VARCHAR(30) DEFAULT 'VEGETATIVO'
                );
            """.formatted(schema, schema, schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.siembras (
                    id SERIAL PRIMARY KEY,
                    cultivo_id INTEGER REFERENCES %s.cultivos(id) ON DELETE CASCADE,
                    lote VARCHAR(50) NOT NULL,
                    metodo_siembra VARCHAR(50) DEFAULT 'Directa Mecanizada',
                    semilla_kg_ha NUMERIC(6,2),
                    costo_estimado NUMERIC(10,2)
                );
            """.formatted(schema, schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.cosechas (
                    id SERIAL PRIMARY KEY,
                    cultivo_id INTEGER REFERENCES %s.cultivos(id),
                    fecha_cosecha DATE DEFAULT CURRENT_DATE,
                    rendimiento_total_ton NUMERIC(8,2) NOT NULL,
                    calidad VARCHAR(20) DEFAULT 'PRIMERA',
                    humedad_grano_pct NUMERIC(5,2)
                );
            """.formatted(schema, schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.suelos (
                    id SERIAL PRIMARY KEY,
                    parcela_id INTEGER REFERENCES %s.parcelas(id) ON DELETE CASCADE,
                    materia_organica_pct NUMERIC(4,2),
                    nitrogeno_ppm NUMERIC(6,2),
                    fosforo_ppm NUMERIC(6,2),
                    potasio_ppm NUMERIC(6,2),
                    fecha_analisis DATE DEFAULT CURRENT_DATE
                );
            """.formatted(schema, schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.sectores (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(100) NOT NULL,
                    responsable VARCHAR(100),
                    area_total_ha NUMERIC(8,2)
                );
            """.formatted(schema));

            stmts.add("""
                CREATE TABLE IF NOT EXISTS %s.bitacora (
                    id BIGSERIAL PRIMARY KEY,
                    parcela_id INTEGER REFERENCES %s.parcelas(id),
                    actividad VARCHAR(150) NOT NULL,
                    observaciones TEXT,
                    responsable VARCHAR(100),
                    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """.formatted(schema, schema));
        }

        return stmts;
    }
}
