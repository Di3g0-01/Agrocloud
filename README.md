# AgroCloud - Frontend

Frontend web de la plataforma **AgroCloud**, desarrollado con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS**.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

* **Node.js**: Versión `18.x` o superior (Recomendado `20.x` o posterior). Puedes verificar tu versión con:
  ```bash
  node -v
  ```
* **npm** (Viene incluido con Node.js) o **pnpm** / **yarn**.
* **Git** para clonar el repositorio.

---

## Guía de Instalación y Ejecución

Sigue estos pasos para descargar y ejecutar la aplicación frontend en tu entorno local.

### 1. Clonar el Repositorio

Si aún no has clonado el proyecto, abre tu terminal y ejecuta:

```bash
git clone https://github.com/Di3g0-01/Agrocloud.git
cd AgroCloud/frontend
```

> *(Si ya tienes la carpeta del proyecto en tu máquina, únicamente abre la terminal e ingresa a la carpeta `frontend`)*:
```bash
cd frontend
```

---

### 2. Instalar Dependencias

Ejecuta el siguiente comando para descargar e instalar todos los paquetes necesarios del proyecto:

```bash
npm install
```

---

### 3. Configuración de Variables de Entorno (Opcional)

Si el frontend necesita conectarse al servidor backend local o en la nube, crea un archivo `.env` en la raíz de la carpeta `frontend` si no existe:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 4. Ejecutar en Modo de Desarrollo

Para iniciar el servidor de desarrollo local con recarga rápida (HMR):

```bash
npm run dev
```

Una vez ejecutado el comando, abre tu navegador e ingresa a la URL que aparece en la terminal (por lo general es):
`http://localhost:5173`

---

## Comandos Disponibles

En la carpeta `frontend` puedes ejecutar los siguientes comandos:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Vite. |
| `npm run build` | Compila el proyecto para producción (TypeScript + Vite). |
| `npm run preview` | Permite previsualizar la build de producción localmente. |
| `npm run lint` | Ejecuta el linter (Oxlint) para verificar la calidad del código. |

---

## Tecnologías Principales

* **Framework:** React 19
* **Lenguaje:** TypeScript
* **Bundler:** Vite
* **Estilos:** Tailwind CSS v4
* **Iconos:** Lucide React
* **Peticiones HTTP:** Axios
