# AgroCloud con Docker

La receta `docker-compose.yml` administra únicamente los servicios `agrocloud-api` y
`agrocloud-db`. `agrocloud-api` se crea desde la imagen original entregada en
`agrocloud-backend.tar`; el JAR generado a partir de `backend/` se monta en `/app/app.jar`
para ejecutar los cambios actuales sin reemplazar esa imagen. PostgreSQL usa el volumen
`agrocloud-postgres-data` para conservar los datos al reconstruir los contenedores.
La base publica el puerto 15432 solo en `127.0.0.1` para conectarse desde DataGrip
en esta computadora. Ambos servicios se comunican por la red `agrocloud-net`.

## Primera ejecución en otra computadora

Instala Docker Desktop, descarga este repositorio y consigue una copia de
`agrocloud-backend.tar`. El TAR de la imagen no se guarda en Git. Desde la carpeta raíz:

1. Carga y etiqueta la imagen original:

   ```sh
   docker load -i /ruta/a/agrocloud-backend.tar
   docker tag agrocloud-backend:latest agrocloud-backend:original-2026-09-22
   ```

2. Copia `.env.example` a `.env` y cambia `POSTGRES_PASSWORD` y `JWT_SECRET` por
   valores privados. Para `JWT_SECRET`, usa al menos 32 bytes aleatorios codificados
   en Base64. No compartas `.env` ni lo subas a Git.
3. Crea los recursos persistentes (solo la primera vez):

   ```sh
   docker network create agrocloud-net
   docker volume create agrocloud-postgres-data
   ```

4. Compila el backend y exporta el JAR local sin crear otro contenedor permanente:

   ```sh
   docker build --target artifact --output type=local,dest=build-artifacts -f backend/Dockerfile backend
   ```

5. Inicia los dos servicios:

   ```sh
   docker compose up -d
   docker compose ps
   ```

Comprueba `http://localhost:8080/actuator/health`. Debería mostrar `"status":"UP"`.
Flyway crea las tablas incluidas en `backend/src/main/resources/db/migration/`.
Una base nueva comienza sin registros de negocio; el repositorio no contiene un
volcado de datos reales.

## Conectar DataGrip

Crea una fuente de datos de tipo **PostgreSQL** con `Host: 127.0.0.1`,
`Port: 15432` y los valores `POSTGRES_DB`, `POSTGRES_USER` y `POSTGRES_PASSWORD`
del archivo `.env` local como base de datos, usuario y contraseña. Usa
**Test Connection** antes de guardar. La conexión solo funciona en esta
computadora mientras `agrocloud-db` está activo; no requiere otro contenedor.

## Después de obtener cambios de Git

```sh
git pull
docker build --target artifact --output type=local,dest=build-artifacts -f backend/Dockerfile backend
docker compose up -d --force-recreate api
```

El contenedor de la API se crea de nuevo desde la misma imagen original y carga el JAR
actualizado. El volumen de PostgreSQL permanece. Para detener los servicios, usa
`docker compose down`; evita `-v` si quieres conservar los datos.

## Máquina que ya tenía estos contenedores

En esta computadora se reutilizaron la red `agrocloud-net`, el volumen
`agrocloud-postgres-data`, la base `agrocloud_db` y sus credenciales existentes.
La imagen original se cargó desde `C:\Users\david\Downloads\agrocloud-backend.tar`
con la etiqueta `agrocloud-backend:original-2026-09-22`. Los contenedores actuales se
crearon de nuevo; el TAR de una imagen no puede recuperar los identificadores de los
contenedores eliminados.
El archivo `.env` local conserva esas credenciales y está excluido de Git.
Antes de migrar se guardó un respaldo local en
`backups/agrocloud-before-compose.dump`, también excluido de Git.

Si otra computadora ya tiene contenedores con los nombres `agrocloud-api` y
`agrocloud-db` creados fuera de Compose, respalda primero la base y retira solo
esos dos contenedores antes de ejecutar `docker compose up -d`. Nunca
elimines el volumen si necesitas sus datos.
