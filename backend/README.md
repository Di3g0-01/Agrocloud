# AgroCloud - Backend (Java Spring Boot + PostgreSQL)

Esta carpeta contiene el Backend desarrollado con **Java 24**, **Spring Boot 4.1.1**, seguridad JWT y persistencia en **PostgreSQL 16**.

## 📂 Estructura de Paquetes

- `src/main/java/com/agrocloud/backend/controller/`: Controladores de la API REST (`/api/v1/...`).
- `src/main/java/com/agrocloud/backend/service/`: Lógica de negocio y reglas del sistema.
- `src/main/java/com/agrocloud/backend/repository/`: Repositorios JPA para acceso a PostgreSQL.
- `src/main/java/com/agrocloud/backend/entity/`: Entidades JPA mapeadas a las tablas de la base de datos.
- `src/main/java/com/agrocloud/backend/dto/`: Data Transfer Objects para peticiones y respuestas JSON.
- `src/main/java/com/agrocloud/backend/security/`: Configuración de Spring Security y JWT (`JwtAuthenticationFilter`, `JwtService`).

## Autenticación

La API implementa autenticación stateless con Spring Security, JWT y contraseñas BCrypt.
Las contraseñas se guardan como hashes de una sola vía, nunca como texto plano ni como
cifrado reversible. `RegistrationService` crea la cuenta y asigna `CLIENTE`, `LoginService`
valida credenciales y estado, `CurrentUserService` consulta la cuenta autenticada y
`AuthResponseFactory` construye la respuesta con el token. El controlador conserva
los endpoints públicos de registro e inicio de sesión.
La variable `JWT_SECRET` es obligatoria y debe contener una clave aleatoria en Base64.
El registro público siempre asigna el rol `CLIENTE`; los roles administrativos no se aceptan
desde la petición de registro.
Cada usuario tiene exactamente un rol. Los roles `ADMINISTRADOR`, `CLIENTE` y `SOPORTE`
se guardan en la tabla `roles` y pueden ser compartidos por varios usuarios. La migración
`V2__create_roles.sql` conserva el rol de los usuarios existentes.
El cierre de sesión elimina el token guardado en el navegador; el JWT emitido conserva
su validez hasta su vencimiento (8 horas por defecto).

### Ejecutar con Docker

Consulta [DOCKER.md](../DOCKER.md) para configurar `.env`, iniciar los contenedores
`agrocloud-api` y `agrocloud-db`, y conservar el volumen de PostgreSQL.

### Pruebas de integración

Las pruebas de integración arrancan la API contra PostgreSQL real y verifican registro,
persistencia del usuario, inicio de sesión, acceso con JWT y errores de autenticación.
Las pruebas unitarias se ejecutan durante la construcción de la imagen. La prueba de
integración con PostgreSQL requiere una base de pruebas separada y la variable
`RUN_DB_INTEGRATION_TESTS=true`; no usa la base `agrocloud-db`.

En Windows, ejecuta `./backend/test-integration.ps1` desde la raíz del proyecto.
El script crea `agrocloud_test` dentro del contenedor original `agrocloud-db` si hace
falta, toma las credenciales de `.env` y ejecuta Maven en un contenedor temporal.
Las pruebas se niegan a escribir si `DB_URL` no termina en `/agrocloud_test` y
eliminan las cuentas temporales que crean. `agrocloud_db` no se modifica.

### Colección de Postman

Importa `AgroCloud_Postman_Collection.json` desde la raíz del repositorio. La
variable `baseUrl` apunta al backend local (`http://localhost:8080/api/v1`).
Ejecuta **Iniciar sesión** con una cuenta de prueba: la colección guarda el JWT en
`token`. Cambia de cuenta según el rol indicado en cada solicitud. Las solicitudes
de creación guardan los identificadores devueltos para las rutas siguientes.
La colección partió de los 32 endpoints presentes en `develop` al inicio del
E04 y se amplía al completar cada módulo.

### Endpoints

- `POST /api/v1/auth/register`: crea una cuenta de cliente y devuelve un JWT.
- `POST /api/v1/auth/login`: autentica por correo y contraseña.
- `GET /api/v1/auth/me`: devuelve el usuario del token enviado como `Bearer`.
- `GET /api/v1/usuarios`: lista las cuentas (solo `ADMINISTRADOR`).
- `GET /api/v1/usuarios/{id}`: consulta una cuenta (solo `ADMINISTRADOR`).
- `POST /api/v1/usuarios`: crea una cuenta de cliente, soporte o administrador (solo `ADMINISTRADOR`). Requiere `organizationName`, `email`, `password` y `role`; la contraseña se guarda con BCrypt. La cuenta inicia activa.
- `PUT /api/v1/usuarios/{id}`: actualiza los datos, el rol y el estado de una cuenta (solo `ADMINISTRADOR`). Requiere `organizationName`, `email`, `role` y `status`; `password` es opcional y, si se envía, se guarda con BCrypt. No permite quitarse a sí mismo el rol administrativo ni suspenderse.
- `GET /actuator/health`: estado del servicio y de sus dependencias.

El panel **Usuarios** consume estos endpoints. Su botón **Agregar miembro de soporte**
crea una cuenta con rol `SOPORTE`; el registro público sigue creando únicamente clientes.
No hay envío de invitaciones por correo: el administrador entrega la contraseña inicial
al miembro de soporte por un canal privado.

Ejemplo de registro (también se aceptan los alias del frontend `nombreEmpresa`,
`contactoNombre` y `telefono`):

```json
{
  "organizationName": "Finca Los Pinos",
  "contactName": "Carlos Monterroso",
  "email": "carlos@fincalospinos.gt",
  "phone": "+502 4455 6677",
  "password": "ClaveSegura123"
}
```

La selección y contratación de un plan corresponde al módulo de suscripciones; se realiza
después de crear la cuenta y no forma parte del contrato de autenticación.

### Flujo de incidencias E04

El cliente crea el ticket con `POST /api/v1/incidencias`, enviando el ID de una
instancia propia, asunto, categoría, problema y prioridad (`ALTA`, `MEDIA` o
`BAJA`). El administrador asigna un usuario de Soporte activo mediante
`PATCH /api/v1/incidencias/{id}/asignacion` con `{ "agenteId": "UUID" }`.
Cada ticket conserva su UUID para las rutas y recibe un código público único
como `INC-00001`. Los tickets anteriores obtienen un código al aplicar V8.

Soporte consulta únicamente sus tickets asignados. El administrador ve todos
los tickets y el cliente solo los propios. También existen las rutas
`GET /api/v1/incidencias/cliente/{id}` y
`GET /api/v1/incidencias/agente/{id}`; cada ID se comprueba contra el usuario
autenticado, salvo para el administrador.

El agente asignado o el administrador cambia el estado con
`PATCH /api/v1/incidencias/{id}/estado` y un cuerpo como
`{ "estado": "EN_REVISION" }`. El flujo de atención es `ABIERTA` →
`EN_REVISION` → `RESUELTA`. Al resolver se debe enviar también
`mensajeResolucion` (1 a 2000 caracteres) para explicar al cliente qué se hizo;
el mensaje queda guardado y se devuelve al consultar el ticket. Por ejemplo:
`{ "estado": "RESUELTA", "mensajeResolucion": "Se restauró la conexión y se verificó el servicio." }`.
El cliente propietario puede cambiarlo a `CERRADA`
en cualquier momento si ya no necesita atención. El administrador también
puede cerrarlo. `CERRADA` es final: nadie puede reabrirlo ni reasignarlo.
La ruta anterior `PATCH /api/v1/incidencias/{id}` se conserva para el frontend
actual; admite cambiar el estado (con `mensajeResolucion` al resolver) o la
`guiaDiagnostico`, en solicitudes separadas.

El administrador asigna al agente desde la pantalla de incidencias; soporte
solo ve las asignadas y escribe el mensaje antes de resolver. El cliente puede
cerrar desde el detalle y no puede reabrir. El mensaje de resolución aparece en
el detalle del ticket. `V10__incident_notifications.sql` crea la tabla de
notificaciones; la campana usa `GET /api/v1/notificaciones`,
`PATCH /api/v1/notificaciones/{id}/leida` y el flujo autenticado
`GET /api/v1/notificaciones/stream` para recibir avisos al instante. La interfaz
también consulta periódicamente si se corta la conexión.

Las instancias también generan notificaciones para su propietario al crearse,
reiniciarse, cambiar de estado o eliminarse. El aviso de eliminación conserva
el nombre de la instancia y no enlaza a un recurso que ya no existe. Si se
solicita el mismo estado actual, no se crea un aviso duplicado. Estos eventos
usan las mismas rutas y el mismo flujo en tiempo real de la campana.

`V11__incident_comments.sql` agrega comentarios persistentes a cada ticket.
El cliente propietario, el agente asignado y el administrador pueden consultarlos
con `GET /api/v1/incidencias/{id}/comentarios` y escribirlos con
`POST /api/v1/incidencias/{id}/comentarios` y `{ "texto": "..." }` (1 a 2000
caracteres). Los demás usuarios reciben 403. Un ticket cerrado conserva el
historial para lectura, pero no acepta mensajes nuevos. Cada comentario avisa
a los demás participantes mediante la campana.
