# Verificación de correo y recuperación de contraseña

El registro público crea una cuenta `CLIENTE`, pendiente y sin sesión. El enlace
de confirmación dura 24 horas. La persona debe abrirlo y pulsar **Confirmar mi
correo**; la confirmación abre una sesión y lleva directamente a **Selecciona tu
plan** para continuar el registro. Después de elegir el plan se completa un
formulario de pago simulado con datos ficticios de tarjeta. Solo al confirmar
la simulación se contrata el plan y se abre el panel. Los datos de tarjeta no se
envían al backend ni se guardan. Si se cierra o recarga la página, la cuenta sin suscripciones retoma
la selección del plan al iniciar sesión.
Ya no se simula un pago antes de confirmar el correo.

Después del registro aparece la ventana de verificación y una pantalla de espera.
El reenvío está dentro de esa ventana; no se muestra debajo del login ni del
formulario de registro. Las cuentas con suscripciones anteriores mantienen su
acceso al panel, incluidos los pagos y la administración de suscripciones.

**Olvidé mi contraseña** envía un enlace válido durante 30 minutos. Al guardar la
nueva contraseña se invalidan el enlace y todos los JWT anteriores de la cuenta.
Los enlaces son de un solo uso y no son intercambiables entre recuperación y
verificación. Solicitar otro sustituye al anterior; se permite un envío por cuenta
y tipo cada 60 segundos. La recuperación y el reenvío responden de forma genérica
para no confirmar si una dirección está registrada.

El enlace **Olvidé mi contraseña** abre el formulario para ingresar el correo
asociado. La ventana posterior pide revisar la bandeja de entrada. Al abrir el
enlace recibido se muestra el formulario de nueva contraseña y confirmación;
solo después de guardarla se vuelve al inicio de sesión.

Los tokens tienen 256 bits aleatorios y solo se guarda su SHA-256. Al consumirlos
se bloquea la fila de la cuenta durante la transacción para impedir usos
simultáneos. Los enlaces usan el fragmento de la URL y el frontend lo retira del
historial al abrirse. No se guardan tokens de correo ni contraseñas en el
almacenamiento del navegador.

## Configuración del despliegue existente

La versión pública consultada de `https://agrocloud-three.vercel.app` usa
`https://agrocloud-backend.onrender.com/api/v1` como API. Esto identifica la
dirección configurada, sin confirmar la disponibilidad actual del backend.

### Backend en Render

Conectar un servicio de correo antes de publicar este cambio. Se incluye envío
por HTTPS con Brevo y por SMTP para desarrollo u otros proveedores. Render
gratuito bloquea los puertos SMTP 25, 465 y 587, por lo que allí debe usarse HTTPS.

Configurar estas variables en el servicio de Render:

| Variable | Valor |
| --- | --- |
| `APP_FRONTEND_URL` | `https://agrocloud-three.vercel.app` |
| `MAIL_PROVIDER` | `brevo` |
| `BREVO_API_KEY` | Clave API de envío creada en la cuenta de Brevo; no la clave SMTP |
| `MAIL_FROM` | Correo personal verificado como remitente en Brevo, por ejemplo `AgroCloud <tu-correo@gmail.com>` |
| `CORS_ALLOWED_ORIGINS` | Incluir `https://agrocloud-three.vercel.app` y los orígenes locales necesarios |

Para este proyecto estudiantil no hace falta comprar un dominio. Crear una cuenta
de Brevo, añadir el correo personal como remitente y confirmar el mensaje que
envía Brevo a esa dirección. El remitente de ejemplo debe sustituirse por el real.
Habilitar los correos transaccionales en la cuenta si el proveedor solicita
activación. Brevo puede reemplazar el dominio de un remitente gratuito por
`brevosend.com` para cumplir las reglas de entrega; eso es comportamiento del
proveedor. La cuenta sigue sujeta a sus cuotas y validaciones. No se debe intentar
autenticar el dominio `gmail.com` ni el subdominio de Vercel como si fueran propios.

Pasos en Brevo:

1. Registrar la cuenta con el correo personal del equipo.
2. Añadir ese mismo correo en la sección de remitentes y completar su verificación.
3. Crear una clave API y guardarla como `BREVO_API_KEY` en Render.
4. Establecer `MAIL_PROVIDER=brevo`, `MAIL_FROM` con el remitente verificado y
   `APP_FRONTEND_URL=https://agrocloud-three.vercel.app`.
5. Publicar backend y frontend, registrar una cuenta de prueba, abrir el enlace
   recibido y comprobar también la recuperación de contraseña.

Las claves van solamente en el backend, nunca en variables `VITE_*`. Al iniciar
Java directamente, exportar las variables al proceso o configurarlas en el IDE:
Spring Boot no carga automáticamente el archivo `.env` de la raíz. Los archivos
Docker Compose sí pasan estas variables al contenedor de la API.

Los correos se envían de forma asíncrona después de confirmar la transacción. Un
fallo del proveedor deja un error sin tokens en el registro del backend; revisar
la configuración y solicitar un nuevo enlace. No hay cola duradera ni reintentos
automáticos: si el proceso se reinicia durante el envío, hay que solicitar otro
enlace. Para volúmenes mayores, aplicar límites globales de solicitudes en la
infraestructura además del límite por cuenta.

### Frontend en Vercel

Mantener `VITE_API_URL=https://agrocloud-backend.onrender.com/api/v1` y publicar
la nueva versión del frontend después de configurar y actualizar el backend.
No basta con desplegar solo el frontend: cambió la respuesta del registro.

El propietario del equipo de Vercel debe invitar el correo de la cuenta del
colaborador y darle acceso al proyecto. Para configurar el envío se necesita
también acceso al servicio de Render y a la cuenta del proveedor de correo.
Los cambios de este repositorio no envían invitaciones ni modifican esos servicios.

## Migración y cuentas existentes

Flyway aplica `V17__email_verification_and_password_reset.sql`. Las cuentas
anteriores conservan acceso y se consideran verificadas por compatibilidad;
esto no comprueba retroactivamente la propiedad de sus correos. Las cuentas
creadas por administración conservan el aprovisionamiento actual. Solo los
nuevos registros públicos requieren verificar su correo.

Las cuentas suspendidas no pueden activarse mediante enlaces ni recuperar su
contraseña. Un cambio administrativo de correo o contraseña invalida los enlaces
anteriores y sus sesiones. No activar manualmente una cuenta pública pendiente:
debe verificar el correo, ya que el acceso comprueba también esa condición.

## Pruebas locales con Brevo y entrega real

La integración HTTPS existente también funciona desde tu computadora. No requiere
publicar el proyecto ni exponer un puerto local a Internet. Necesitas conexión a
Internet para que el backend contacte a Brevo; abre los enlaces recibidos en la
misma computadora donde ejecutas el frontend.

1. Entra a [Brevo](https://app.brevo.com/) y crea tu cuenta o inicia sesión.
2. En **Configuración > Remitentes, dominios e IP dedicadas > Remitentes**, agrega
   un remitente con nombre `AgroCloud` y un correo que puedas abrir. Completa la
   verificación que Brevo envíe a ese correo. Si usas un dominio propio, completa
   también la autenticación que te indique Brevo.
3. En **SMTP y API > Claves API**, crea una clave para `AgroCloud local` y cópiala
   al archivo `.env` de la raíz. Usa una **clave API**, no una clave SMTP. Si Brevo
   solicita activar los correos transaccionales, completa ese paso.
4. Completa estas variables en `.env`, conservando las de base de datos y JWT:

   ```dotenv
   APP_FRONTEND_URL=http://localhost:5173
   MAIL_PROVIDER=brevo
   MAIL_FROM=AgroCloud <tu-correo-verificado@example.com>
   BREVO_API_KEY=pega-aqui-tu-clave-api
   ```

   Sustituye ambos ejemplos por tus datos reales. La clave pertenece solo al
   backend; no la pongas en `frontend/.env`, variables `VITE_*`, capturas ni Git.
   Con `MAIL_PROVIDER=brevo` no necesitas configurar `MAIL_HOST`, `MAIL_USERNAME`
   ni `MAIL_PASSWORD`.
5. Inicia Docker Desktop y aplica los cambios con la receta que ya uses. Para
   la instalación E04 descrita en `DOCKER.md`, desde la raíz:

   ```powershell
   docker compose -f docker-compose.e04.yml up -d --build api
   ```

   Para la instalación original con `docker-compose.yml`, compila primero el
   JAR actual y luego recrea la API:

   ```powershell
   docker build --target artifact --output type=local,dest=build-artifacts -f backend/Dockerfile backend
   docker compose up -d --force-recreate api
   ```

   Para un equipo nuevo usa `docker compose -f docker-compose.team.yml up -d --build api`.
   Usa solo la receta de tu instalación. Reiniciar un contenedor sin recrearlo
   no actualiza sus variables de entorno.
6. Ejecuta el frontend en `http://localhost:5173` con la API local
   (`VITE_API_URL=http://localhost:8080/api/v1`). Registra una cuenta de prueba
   con un buzón que controles, confirma el correo recibido y prueba **Olvidé mi
   contraseña**. El correo debe contener un enlace a `localhost:5173`.

Si no llega, revisa spam y los registros de **Transaccional > Email** en Brevo.
Revisa también los registros de la API: la respuesta genérica del formulario no
confirma que Brevo haya aceptado el envío. Comprueba la clave, la verificación del
remitente y la activación transaccional. Si Brevo pide autorizar la IP de tu
conexión local, sigue su aviso. Tras corregir la configuración, solicita otro
enlace respetando el intervalo de 60 segundos.

Esta configuración envía correos reales. Para probar sin entrega, usa el buzón
local de la siguiente sección.

## Pruebas locales sin enviar correos a personas

Se puede usar un buzón SMTP de desarrollo como Mailpit en `localhost:1025`.
Configurar `MAIL_PROVIDER=smtp`, `MAIL_HOST=localhost`, `MAIL_PORT=1025`,
`MAIL_SMTP_AUTH=false`, `MAIL_STARTTLS=false`, `MAIL_SSL=false` y
`APP_FRONTEND_URL=http://localhost:5173`. Dentro de Docker usar
`MAIL_HOST=host.docker.internal` si Mailpit corre en el equipo anfitrión.
Para SMTP de producción, seguir los valores de autenticación y cifrado del
proveedor; usar `MAIL_STARTTLS=true` o `MAIL_SSL=true` según corresponda.

Las pruebas de integración sustituyen el envío por un buzón en memoria. Cubren
registro pendiente, confirmación, inicio de sesión, recuperación, reutilización y
separación de enlaces, revocación de JWT y rechazo de la contraseña anterior.
Las pruebas unitarias cubren también caducidad y límite de reenvío.

## Referencias

- [Restricciones de Render gratuito](https://render.com/docs/free)
- [API de envío de Brevo](https://developers.brevo.com/reference/send-transac-email)
- [Remitentes personales y dominio de envío de Brevo](https://help.brevo.com/hc/en-us/articles/35852083084178-Domain-setup-for-better-email-deliverability)
- [Recuperación de contraseña: OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [Gestión de miembros de Vercel](https://vercel.com/docs/rbac/managing-team-members)
