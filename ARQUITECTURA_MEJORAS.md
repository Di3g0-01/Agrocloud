# Plan de Mejoras de Arquitectura (DRY, KISS, SOLID)

Este documento detalla los hallazgos técnicos detectados durante la auditoría de arquitectura en **Frontend** y **Backend**, clasificados por principio, junto con los pasos específicos y archivos a modificar para ejecutarlos ordenadamente en la siguiente sesión.

---

## 📋 Resumen de Prioridades

| Prioridad | Área | Principio | Descripción | Esfuerzo |
|:---:|:---|:---:|:---|:---:|
| 🔴 Alta | Frontend | **DRY / KISS** | Eliminar duplicación de `StatusBadge` y utilitarios en componentes UI | Bajo (~15 min) |
| 🔴 Alta | Frontend | **KISS / SRP** | Extraer constantes de navegación fuera de los componentes (`Fast Refresh`) | Bajo (~20 min) |
| 🟡 Media | Frontend | **KISS / React** | Optimizar llamadas de `setState` dentro de `useEffect` (evitar render cascades) | Medio (~35 min) |
| 🟡 Media | Backend | **SRP** | Desacoplar validaciones y reglas de negocio en `IncidentService` | Medio (~45 min) |
| 🟢 Baja | Frontend | **SRP** | Descomponer vistas masivas (`AdminSubscriptions`, `AdminInstances`) en subcomponentes | Medio (~1h) |

---

## 🛠️ Detalle de Cambios y Cómo Realizarlos

### 1. [Frontend] Eliminar duplicación de `StatusBadge` (Violación de DRY)

* **Problema:** El archivo [`BadgesAndIcons.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/components/ui/BadgesAndIcons.tsx) contiene una copia idéntica de la función `getStatusLabel` y el componente `StatusBadge`, que ya están centralizados y exportados en [`StatusBadge.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/components/ui/StatusBadge.tsx).
* **Archivos involucrados:**
  * [`frontend/src/components/ui/BadgesAndIcons.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/components/ui/BadgesAndIcons.tsx)
  * [`frontend/src/components/ui/StatusBadge.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/components/ui/StatusBadge.tsx)
* **Pasos de implementación:**
  1. En `BadgesAndIcons.tsx`, eliminar la declaración duplicada de `getStatusLabel` y `StatusBadge`.
  2. Si `BadgesAndIcons.tsx` necesita renderizar un badge de estado, importar `StatusBadge` directamente desde `./StatusBadge`.
  3. Ejecutar `npm run lint` en `frontend/` para verificar que la advertencia desaparece.

---

### 2. [Frontend] Extraer constantes de configuración de paneles (KISS y Fast Refresh)

* **Problema:** Componentes exportan tanto componentes de React como arreglos de navegación u objetos estáticos en el mismo archivo. Oxlint y Vite advierten que esto invalida React Fast Refresh (`react/only-export-components`).
* **Archivos involucrados:**
  * [`frontend/src/features/client/ClientPanel.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/features/client/ClientPanel.tsx) (`clientNav`)
  * [`frontend/src/features/support/SupportPanel.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/features/support/SupportPanel.tsx) (`supportNav`)
  * [`frontend/src/context/AuthContext.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/context/AuthContext.tsx) (`useAuth`)
* **Pasos de implementación:**
  1. Crear o mover las constantes a sus respectivos archivos de datos o configuración:
     * Mover `clientNav` hacia [`frontend/src/data/client.ts`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/data/client.ts).
     * Mover `supportNav` hacia [`frontend/src/data/support.ts`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/data/support.ts) (crear si no existe).
  2. En `ClientPanel.tsx` y `SupportPanel.tsx`, importar los arreglos desde los archivos `data/`.
  3. Para `AuthContext.tsx`, extraer el hook `useAuth` a [`frontend/src/context/useAuth.ts`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/context/useAuth.ts) y re-exportarlo en `index.ts` o exportar solo el provider en el componente principal.

---

### 3. [Frontend] Corregir render cascades en `useEffect` (KISS & Estabilidad)

* **Problema:** Uso de `setState` de manera síncrona dentro de efectos inmediatamente al montar, lo cual provoca renders innecesarios en cascada (`react/set-state-in-effect`).
* **Archivos involucrados:**
  * [`frontend/src/pages/ClientDashboard.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/pages/ClientDashboard.tsx) (línea 58)
  * [`frontend/src/pages/AdminDashboard.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/pages/AdminDashboard.tsx) (línea 41)
  * [`frontend/src/components/shared/IncidentComments.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/components/shared/IncidentComments.tsx) (líneas 63 y 80)
  * [`frontend/src/features/auth/Login.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/features/auth/Login.tsx) (dependencia faltante `selectedPlanId`)
* **Pasos de implementación:**
  1. En `IncidentComments.tsx`: inicializar el estado `targetRole` directamente con `useState(defaultTargetRole || "CLIENT")` o derivarlo en el render si no muta localmente.
  2. En `Login.tsx`: ajustar el hook o usar un callback ref para no omitir dependencias reactivas en `useEffect`.
  3. Asegurar que las peticiones asíncronas (`fetchInstances()`, `fetchUsers()`) utilicen banderas de limpieza (`isMounted` o `AbortController`) para evitar actualizaciones de estado sobre componentes desmontados.

---

### 4. [Backend] Refactorizar SRP en `IncidentService` (Principio de Responsabilidad Única)

* **Problema:** [`IncidentService.java`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/backend/src/main/java/com/agrocloud/backend/incident/IncidentService.java) acumula:
  1. Lógica de validación de estado y transiciones de incidencias.
  2. Chequeo de permisos por rol (`CLIENT`, `SUPPORT`, `ADMIN`).
  3. Enrutamiento y asignación de tickets.
  4. Mapeo entidad-a-DTO.
* **Archivos involucrados:**
  * [`backend/src/main/java/com/agrocloud/backend/incident/IncidentService.java`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/backend/src/main/java/com/agrocloud/backend/incident/IncidentService.java)
* **Pasos de implementación:**
  1. **Separar la validación de transiciones de estado:** Crear un validador o clase de dominio (e.g., `IncidentStateTransitionValidator`) para asegurar qué transiciones son legales (ej. `ABIERTA -> EN_PROCESO -> RESUELTA`).
  2. **Extraer el mapeo a un Mapper:** Crear `IncidentMapper` para la conversión entre `IncidentEntity`, `IncidentRequest` e `IncidentResponse`, desacoplando la lógica de negocio del formato JSON de respuesta.
  3. Mantener `IncidentService` exclusivamente como orquestador del caso de uso.

---

### 5. [Frontend] Modularización de Pantallas Administrativas (SRP en UI)

* **Problema:** Archivos como [`AdminSubscriptions.tsx`](file:///c:/Users/ovall/OneDrive%20-%20Universidad%20Rafael%20Landivar/Escritorio/AgroCloud/frontend/src/features/admin/AdminSubscriptions.tsx) superan las 470 líneas y contienen en un solo archivo:
  * Tabla de visualización de suscripciones.
  * Formulario / Modal para crear o editar suscripciones.
  * Drawer lateral con detalle de usuario y pagos.
* **Pasos de implementación:**
  1. Crear carpeta `frontend/src/features/admin/subscriptions/`.
  2. Extraer subcomponentes:
     * `SubscriptionTable.tsx`: Tabla y filtros de búsqueda.
     * `SubscriptionDetailDrawer.tsx`: Panel lateral con detalles.
     * `SubscriptionModalForm.tsx`: Modal para crear/modificar.
  3. Reducir `AdminSubscriptions.tsx` a un contenedor principal que coordina el estado y los subcomponentes.

---

## 🚀 Comandos de Validación para la Próxima Sesión

Al realizar cada cambio, ejecutar estos comandos para comprobar que nada se rompa:

```powershell
# 1. En frontend:
cd frontend
npm run lint    # Verificar reducción de warnings
npm run build   # Verificar que no hay errores de TypeScript ni Vite

# 2. En backend:
cd ../backend
mvn test-compile   # Verificar compilación limpia de Java
```
