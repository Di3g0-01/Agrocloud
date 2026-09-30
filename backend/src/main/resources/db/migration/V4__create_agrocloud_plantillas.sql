CREATE TABLE IF NOT EXISTS agrocloud_plantillas (
    id VARCHAR(100) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tablas INTEGER,
    version VARCHAR(50),
    instancias INTEGER,
    estado VARCHAR(50),
    schema_tables TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

INSERT INTO agrocloud_plantillas (id, nombre, descripcion, tablas, version, instancias, estado, schema_tables, created_at, updated_at)
VALUES 
('TPL-01', 'Cultivos y parcelas', 'Estructura relacional para la administración de parcelas, cultivos, etapas de crecimiento y rendimiento agrícola.', 8, '2.1', 12, 'Activa', 'parcelas,cultivos,siembras,cosechas,variedades,suelos,sectores,bitacora', NOW(), NOW()),
('TPL-02', 'Monitoreo de riego y fertilización', 'Esquema optimizado para la captura de lecturas de sensores de humedad, flujo de agua y programas de fertirriego.', 6, '1.4', 8, 'Activa', 'sensores,lecturas,valvulas,programas_riego,fertilizantes,aplicaciones', NOW(), NOW()),
('TPL-03', 'Control de plagas y fitosanitario', 'Base de datos para el seguimiento de monitoreos de plagas, tratamientos químicos/orgánicos y períodos de carencia.', 5, '1.0', 4, 'Activa', 'plagas,monitoreos,productos_fitosanitarios,aplicaciones,periodos_carencia', NOW(), NOW()),
('TPL-04', 'Inventarios y bodegas agrícolas', 'Gestión de insumos, maquinaria, repuestos, herramientas y movimientos de entrada/salida en bodega.', 7, '1.8', 15, 'Activa', 'insumos,bodegas,movimientos,proveedores,maquinaria,mantenimientos,existencias', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
