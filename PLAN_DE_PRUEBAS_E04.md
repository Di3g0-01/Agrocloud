# AgroCloud — Plan de Pruebas Integradas (Entregable 04)

Este documento detalla la guía de pruebas funcionales para validar al 100% los módulos integrados del **Entregable 04**:
* **Módulo Diego Afre:** Monitoreo de Instancias en Tiempo Real y Consulta Segura de Credenciales Encriptadas (AES-256).
* **Módulo Luis:** Sistema de Incidencias / Tickets por Rol (Cliente, Soporte Técnico, Admin) y Notificaciones Internas por eventos.

---

## 🔒 1. Pruebas del Módulo de Credenciales Encriptadas (Diego Afre)

### 🧪 Prueba 1.1: Consulta Segura de Credenciales (Cliente Propietario)
* **Objetivo:** Verificar que el cliente auténtico pueda desencriptar y ver la contraseña de su base de datos.
* **Pasos:**
  1. Iniciar sesión como **Cliente** en la plataforma web.
  2. Ir al panel de **Mis Instancias**.
  3. Hacer clic en una instancia activa para desplegar el drawer de detalles.
  4. Presionar el botón **"Credenciales"**.
* **Resultado Esperado:** 
  * Se abre el modal con `Host`, `Puerto`, `Base de Datos` y `Usuario`.
  * La contraseña aparece inicialmente enmascarada (`••••••••••••`).
  * Al hacer clic en el ícono del ojo 👁️, se desencripta y muestra la contraseña real (ej. `AgroPass_...`).
  * La contraseña **nunca viaja en texto plano en la BD ni en las listas públicas**; solo se expone via `GET /api/v1/instancias/{id}/credenciales`.

### 🧪 Prueba 1.2: Aislamiento de Seguridad (Acceso Denegado a Otros Usuarios)
* **Objetivo:** Garantizar que un cliente no pueda ver las credenciales de la instancia de otro cliente.
* **Pasos:**
  1. Copiar el ID de una instancia que pertenece a *Cliente A*.
  2. Iniciar sesión como *Cliente B*.
  3. Ejecutar la petición HTTP: `GET /api/v1/instancias/{id-de-cliente-A}/credenciales` en Postman con el token de *Cliente B*.
* **Resultado Esperado:** 
  * La API devuelve un código **403 Forbidden** o **404 Not Found**.

---

## 📊 2. Pruebas del Módulo de Monitoreo de Instancias (Diego Afre)

### 🧪 Prueba 2.1: Visualización de Métricas en Tiempo Real (Admin / Cliente)
* **Objetivo:** Comprobar que las métricas de uso (Almacenamiento, CPU, RAM y Uptime) se consulten y grafiquen dinámicamente desde la BD.
* **Pasos:**
  1. Iniciar sesión como **Administrador** e ingresar al módulo **Monitoreo**.
  2. Verificar los contadores superiores de instancias (*Operativas*, *En revisión*, *Detenidas*).
  3. Observar las barras de progreso de **CPU (%)** y **Memoria (%)** por cada instancia.
* **Resultado Esperado:**
  * Los valores reflejan métricas almacenadas en la tabla `instance_metrics` (vía `GET /api/v1/instancias/{id}/metricas`).
  * Las métricas se actualizan automáticamente en el frontend (sondeo cada 30s).

### 🧪 Prueba 2.2: Registro Automático de Métrica al Reiniciar Instancia
* **Objetivo:** Confirmar que las acciones sobre instancias registran un nuevo punto de métrica.
* **Pasos:**
  1. En el panel de instancias del Cliente, seleccionar una instancia y presionar **"Reiniciar"**.
  2. Consultar `GET /api/v1/instancias/{id}/metricas`.
* **Resultado Esperado:**
  * La instancia cambia a estado activo/reiniciando.
  * Se inserta un nuevo registro en `instance_metrics` con timestamp actual.

---

## 🎫 3. Pruebas del Módulo de Incidencias / Tickets (Luis)

### 🧪 Prueba 3.1: Apertura de Ticket por el Cliente
* **Objetivo:** Verificar que el cliente pueda abrir tickets de soporte asociados a sus instancias.
* **Pasos:**
  1. Iniciar sesión como **Cliente**.
  2. Ir al panel **Soporte / Incidencias** y hacer clic en **"Abrir Ticket"**.
  3. Seleccionar la prioridad (*Alta*, *Media*, *Baja*), escribir el título y la descripción del problema.
  4. Enviar el formulario.
* **Resultado Esperado:**
  * Se genera la incidencia en estado **ABIERTA** con un número público de ticket (ej. `INC-1001`).
  * Aparece en la lista de tickets del cliente.

### 🧪 Prueba 3.2: Atender y Resolver Ticket (Soporte Técnico)
* **Objetivo:** Validar que el agente de soporte pueda asignar, comentar y resolver el ticket.
* **Pasos:**
  1. Iniciar sesión como **Soporte Técnico**.
  2. Ir al panel de **Incidencias Asignadas**.
  3. Seleccionar el ticket creado en la Prueba 3.1 y cambiar el estado a **EN_REVISION**.
  4. Escribir un comentario de avance en la sección de comentarios del ticket.
  5. Cambiar el estado a **RESUELTA** agregando la solución técnica.
* **Resultado Esperado:**
  * El estado cambia correctamente en tiempo real.
  * El historial de comentarios registra el autor (Soporte) y la fecha/hora.

### 🧪 Prueba 3.3: Supervisión por el Administrador
* **Objetivo:** Garantizar que el rol **ADMINISTRADOR** pueda supervisar y reasignar cualquier ticket.
* **Pasos:**
  1. Iniciar sesión como **Admin**.
  2. Ir a **Admin Incidencias**.
* **Resultado Esperado:**
  * El Admin ve la totalidad de los tickets del sistema de todos los clientes y agentes.

---

## 🔔 4. Pruebas de Notificaciones Internas (Luis & Diego Afre)

### 🧪 Prueba 4.1: Notificación por Cambio de Estado de Ticket
* **Objetivo:** Verificar que el cliente reciba una alerta interna cuando su ticket cambia de estado.
* **Pasos:**
  1. Mientras el **Cliente** está en el sistema, el agente de **Soporte** cambia el estado de su ticket a *RESUELTA*.
  2. Observar la campana 🔔 de notificaciones en el navbar del Cliente.
* **Resultado Esperado:**
  * El contador rojo de la campana se incrementa.
  * Al hacer clic en la campana, se despliega la notificación: *"Ticket INC-1001 resuelto"*.
  * Al hacer clic en *"Marcar como leída"*, el contador se decrementa.

### 🧪 Prueba 4.2: Notificación por Evento de Instancia
* **Objetivo:** Verificar alertas al crear, reiniciar o actualizar estado de instancias.
* **Pasos:**
  1. Crear una nueva instancia o reiniciar una existente.
  2. Abrir el menú de notificaciones 🔔.
* **Resultado Esperado:**
  * Aparece la notificación *"Instancia reiniciada: La instancia X está activa"*.

---

## 🏁 Checklist de Verificación Final
* [x] `mvn compile` exitoso en el backend (0 errores).
* [x] `npm run build` exitoso en el frontend (0 errores).
* [x] Migración Flyway `V13__create_instance_metrics.sql` lista para correr en PostgreSQL.
* [x] Integración de git `pull` unificada en `develop`.
