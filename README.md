# AgroCloud - Plataforma SaaS Cloud & Database Management

**AgroCloud** es una plataforma web integral tipo SaaS diseñada para la gestión, aprovisionamiento, monitoreo y soporte de instancias de bases de datos e infraestructura en la nube. Ofrece un portal para clientes con aprovisionamiento automático y seguro, y una consola de administración global.

---

## 🚀 Características Principales

### 🔐 Seguridad & Credenciales Encriptadas
* **Encriptación AES-256:** Las credenciales de acceso a las bases de datos creadas (MySQL, PostgreSQL, MongoDB, Redis, etc.) se cifran en el backend mediante clave simétrica y almacenamiento seguro.
* **Consulta Bajo Demanda:** El cliente puede visualizar o copiar sus credenciales desencriptadas mediante autenticación segura.

### 📊 Monitoreo de Instancias en Tiempo Real
* **Métricas Operativas:** Monitoreo activo de consumo de CPU (%), memoria RAM (MB / %), espacio en disco (GB) y conexiones activas.
* **Consola de Administración:** Dashboard centralizado para administradores con gráficos y estados globales del clúster.

### 🚨 Sistema de Incidentes y Soporte
* **Creación y Seguimiento de Tickets:** Reporte de fallas asociadas a instancias específicas con asignación de severidad y estado (Abierto, En Progreso, Resuelto, Cerrado).
* **Historial de Comentarios:** Comunicación bidireccional entre cliente y equipo de soporte.

### 🔔 Centro de Notificaciones
* Alertas automáticas por eventos del sistema, cambios de estado en instancias e incidentes creados/actualizados.

---

## 🛠️ Arquitectura y Tecnologías

### **Backend**
* **Lenguaje & Framework:** Java 17 / Spring Boot 3
* **Seguridad:** Spring Security con Tokens JWT
* **Persistencia:** Spring Data JPA / Hibernate
* **Base de Datos:** PostgreSQL
* **Migraciones:** Flyway Database Migrations (V1 a V15)
* **Cifrado:** Algoritmo AES-256 / GCM / NoPadding con clave simétrica configurable.

### **Frontend**
* **Framework:** React 19
* **Lenguaje:** TypeScript
* **Bundler & Dev Server:** Vite
* **Estilos:** Tailwind CSS v4
* **Iconos:** Lucide React
* **Cliente HTTP:** Axios (con interceptores para manejo de tokens JWT)

### **Infraestructura y Contenedores**
* **Docker & Docker Compose:** Archivos de orquestación para entornos de prueba (`docker-compose.e04.yml`) y desarrollo (`docker-compose.yml`).

---

## 📋 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas:

* **Java JDK:** Versión `17` o superior (`java -version`).
* **Apache Maven:** Versión `3.8+` (`mvn -v`) o utilizar el ejecutable en la raíz de `backend`.
* **Node.js:** Versión `18.x` o superior (Recomendado `20.x`+) (`node -v`).
* **npm:** Incluido con Node.js (`npm -v`).
* **PostgreSQL:** Versión `15+` o **Docker Desktop** para levantar la base de datos en contenedor.

---

## 💻 Guía de Instalación y Ejecución

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Di3g0-01/Agrocloud.git
cd AgroCloud
```

---

### 2. Ejecutar el Backend (Spring Boot)

#### Opción A: Con Maven instalado localmente
```bash
cd backend
mvn clean spring-boot:run
```

#### Opción B: Con el Wrapper de Maven (Windows / Linux)
```bash
# Windows (PowerShell / CMD)
cd backend
.\mvnw spring-boot:run

# Linux / macOS
cd backend
./mvnw spring-boot:run
```

El servidor Backend iniciará por defecto en: **`http://localhost:8080`**

---

### 3. Ejecutar el Frontend (React + Vite)

Abre una nueva terminal en la raíz del proyecto y ejecuta:

```bash
cd frontend
npm install
npm run dev
```

El servidor Frontend iniciará por defecto en: **`http://localhost:5173`**

---

### 4. Despliegue con Docker Compose (Entorno Completo / Entregable E04)

Si prefieres ejecutar toda la plataforma (Base de Datos + Backend + Frontend) mediante contenedores:

```bash
docker compose -f docker-compose.e04.yml up -d --build
```

---

## 🧪 Pruebas y Verificación

Para ejecutar la suite de pruebas funcionales y de verificación para la entrega actual, consulta el archivo:
* 📄 **[Plan de Pruebas E04](PLAN_DE_PRUEBAS_E04.md)**

Para interactuar con los endpoints REST del backend:
* 📦 **[Colección de Postman](AgroCloud_Postman_Collection.json)**

---

## 📜 Scripts y Comandos Principales

### **Frontend (`/frontend`)**
| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite. |
| `npm run build` | Compila TypeScript y genera el bundle para producción. |
| `npm run preview` | Previsualiza el build de producción en local. |
| `npm run lint` | Ejecuta el linter (Oxlint) para análisis de código. |

### **Backend (`/backend`)**
| Comando | Descripción |
| :--- | :--- |
| `mvn spring-boot:run` | Ejecuta la aplicación Spring Boot. |
| `mvn clean compile` | Valida la sintaxis y compila todas las clases Java. |
| `mvn test` | Ejecuta la suite de pruebas unitarias e integración. |

---

## 🤝 Créditos y Equipo

Desarrollado por el equipo de ingeniería de **AgroCloud** - Universidad Rafael Landívar.

