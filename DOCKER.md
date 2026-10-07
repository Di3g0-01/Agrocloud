# AgroCloud con Docker local

## Versión E04 con los datos existentes de esta computadora

Desde la rama `feature/e04-luis`, la receta `docker-compose.e04.yml` inicia la
base existente, la API actual y la interfaz con un solo comando. Usa el volumen
externo `agrocloud-postgres-data`; no crea una base vacía. Flyway conserva los
datos e instala las migraciones V7 a V10. Mantén un respaldo antes de instalar
una versión nueva.

```powershell
docker compose --env-file 'C:\Users\david\Desktop\Proyectos\Agro_Cloud\.env' -f docker-compose.e04.yml up -d --build
```

La página queda en `http://localhost:5173` y la API en
`http://localhost:8080`. Para comprobar el estado usa
`docker compose --env-file 'C:\Users\david\Desktop\Proyectos\Agro_Cloud\.env' -f docker-compose.e04.yml ps`.
No ejecutes `docker-compose.yml` desde el checkout antiguo mientras uses E04:
intentaría reemplazar la API nueva con el JAR anterior. Para detener E04 usa
`docker compose --env-file 'C:\Users\david\Desktop\Proyectos\Agro_Cloud\.env' -f docker-compose.e04.yml down`
sin `-v`; la base y sus datos permanecen en el volumen externo.

Los archivos de Compose y las migraciones se comparten por Git. Cada integrante
ejecuta Docker en su propia computadora; la base de datos, las claves, las imagenes
y los contenedores no se suben al repositorio ni se despliegan en Railway.

Hay dos recetas para los mismos dos servicios:

- `docker-compose.yml` conserva la instalacion de esta computadora, con la imagen
  original `agrocloud-backend:original-2026-09-22`, la red y el volumen existentes.
- `docker-compose.team.yml` permite a un integrante nuevo construir la API desde
  `backend/` y crear un volumen local nuevo. No necesita el archivo TAR original.

No ejecutes ambas recetas en la misma computadora: usan los nombres
`agrocloud-api` y `agrocloud-db` y los mismos puertos.

## Primera ejecucion de un integrante nuevo

1. Instala Docker Desktop, clona el repositorio y cambia a la rama del equipo.
2. Copia `.env.example` a `.env` y sustituye `POSTGRES_PASSWORD` y `JWT_SECRET`
   por valores privados. `JWT_SECRET` debe ser una clave aleatoria de al menos
   32 bytes codificada en Base64. `.env` esta excluido de Git.
3. Desde la raiz del repositorio ejecuta:

   ```sh
   docker compose -f docker-compose.team.yml up -d --build
   ```

Compose construye la API con la version de Java indicada en `backend/Dockerfile`,
descarga PostgreSQL 16, crea solo `agrocloud-api` y `agrocloud-db` y guarda los
datos en el volumen local `agrocloud-team-postgres-data`. Flyway crea las tablas
desde las migraciones del repositorio. Cada instalacion comienza sin los usuarios
ni los datos de otros integrantes.

Comprueba `http://localhost:8080/actuator/health`. Deberia mostrar
`"status":"UP"`. La primera construccion puede tardar mientras Docker descarga
las imagenes y las dependencias.

Despues de recibir cambios de Git, actualiza la API con:

```sh
git pull
docker compose -f docker-compose.team.yml up -d --build
```

El contenedor de la API se reconstruye desde el codigo actualizado y los datos
permanecen en el volumen. Para detenerlos usa
`docker compose -f docker-compose.team.yml down` sin `-v`.

El frontend sigue ejecutandose localmente desde `frontend/` con sus comandos de
instalacion y desarrollo; esta receta de Docker administra solo la API y PostgreSQL.

## Instalacion original de esta computadora

La receta `docker-compose.yml` administra únicamente los servicios `agrocloud-api` y
`agrocloud-db`. `agrocloud-api` se crea desde la imagen original entregada en
`agrocloud-backend.tar`; el JAR generado a partir de `backend/` se monta en `/app/app.jar`
para ejecutar los cambios actuales sin reemplazar esa imagen. PostgreSQL usa el volumen
`agrocloud-postgres-data` para conservar los datos al reconstruir los contenedores.
La base publica el puerto 15432 solo en `127.0.0.1` para conectarse desde DataGrip
en esta computadora. Ambos servicios se comunican por la red `agrocloud-net`.

## Preparacion original de esta computadora

La receta original usa `agrocloud-backend.tar`. El TAR de la imagen no se guarda
en Git. Si es necesario restaurar esta instalacion desde cero:

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

## Despues de obtener cambios de Git en esta computadora

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
