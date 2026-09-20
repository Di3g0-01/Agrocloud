# AgroCloud — Backend (Java Spring Boot + PostgreSQL)

Esta carpeta contiene la estructura del proyecto Backend desarrollado en **Java Spring Boot**, con seguridad JWT y persistencia en **PostgreSQL**.

## 📂 Estructura de Paquetes

- `src/main/java/com/agrocloud/backend/controller/`: Controladores de la API REST (`/api/v1/...`).
- `src/main/java/com/agrocloud/backend/service/`: Lógica de negocio y reglas del sistema.
- `src/main/java/com/agrocloud/backend/repository/`: Repositorios JPA para acceso a PostgreSQL.
- `src/main/java/com/agrocloud/backend/entity/`: Entidades JPA mapeadas a las tablas de la base de datos.
- `src/main/java/com/agrocloud/backend/dto/`: Data Transfer Objects para peticiones y respuestas JSON.
- `src/main/java/com/agrocloud/backend/security/`: Configuración de Spring Security y JWT (`JwtFilter`, `JwtUtil`).
