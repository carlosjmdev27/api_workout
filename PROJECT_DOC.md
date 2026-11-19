# PROJECT_DOC — Registro del proyecto

Bitácora de todas las acciones realizadas en el proyecto (regla 5.D de [PROJECT_SPEC.md](PROJECT_SPEC.md)).
Las entradas van en orden cronológico; la más reciente, al final.

---

## Estado actual

| Fase | Estado |
|------|--------|
| Fase 1: Inicialización | ✅ Completada |
| Fase 2: Base de datos y backend core | ✅ Completada |
| Fase 3: Frontend core | ✅ Completada |
| Fase 4: Verificación | ✅ Completada |

**Actualización §7 de la spec (jerarquía avanzada e historial):**

| Fase | Estado |
|------|--------|
| Paso previo: paquete `shared/` (npm workspaces) | ✅ Completado |
| Fase 2 v2: migración de la base de datos y backend | ✅ Completada |
| Fase 3 v2: constructor de tablas y series (frontend) | ✅ Completada |
| Fase 4 v2: modo entrenamiento activo e historial | ✅ Completada |

**Actualización §8 de la spec (v3: ciclo de vida de la sesión):** ✅ Completada (2026-11-19).

### Pendientes / deuda técnica

Revisar esta lista al empezar cada tarea.

| # | Pendiente | Prioridad | Origen |
|---|-----------|-----------|--------|
| 1 | ~~Unificar tipos y límites duplicados~~ | ✅ **Resuelto** (2026-11-19). `client` y `server` usan `@gym/shared`; ya no queda ningún archivo duplicado. | Fase 3 |
| 2 | **Rate limiting** en la API. | Alta antes de exponer la API fuera de local | Fase 2 |
| 3 | **Tests automatizados** en el repo. Hasta ahora las pruebas han sido scripts temporales. | Media | Fase 2 |
| 5 | **Privacidad de los `.md` de la raíz** (detalle abajo). Decisión aplazada por el usuario el 2026-11-19. | Media: decidir antes de añadir información sensible a la documentación | Fase 4 v2 |
| 4 | Avisos de `picomatch` (GHSA-fc5q-39xc-vjpf) en dependencias de desarrollo. El 2026-11-19 `npm audit` ya no los marca: **0 vulnerabilidades**, aunque seguimos en `picomatch@4.0.7`. No hubo cambio por nuestra parte; lo más probable es que se revisara el aviso. Vigilar en cada auditoría. | Baja | Fase 1 |

**Detalle del pendiente #5: privacidad de `PROJECT_SPEC.md`, `PROJECT_DOC.md` e `INSTRUCCIONESDEEJECUCION.md`**

- **Objetivo del usuario:** subir también `INSTRUCCIONESDEEJECUCION.md` a GitHub, pero que los `.md` de la raíz solo los vean el usuario y Claude.
- **Limitación:** GitHub no permite restringir archivos sueltos. En un repo público todo es visible. `PROJECT_SPEC.md` y `PROJECT_DOC.md` **ya son públicos, incluido su historial**.
- **Opciones:**
  1. **Hacer privado el repo** (recomendada). Se hace en Settings → General → Danger Zone → Change visibility. Después se saca `INSTRUCCIONESDEEJECUCION.md` del `.gitignore` y se sube. Contra: el código también deja de ser público.
  2. **Mover los `.md` a un segundo repo privado** y sacarlos del público. Su historial anterior sigue siendo visible, salvo que se reescriba (operación destructiva + force push, requiere confirmación explícita).
- **Mientras tanto:** `INSTRUCCIONESDEEJECUCION.md` sigue **solo en local**. Claude no necesita GitHub para leer ninguno de estos archivos, porque trabaja con los del disco.

**Arrancar en local** (desde la raíz, monorepo con npm workspaces):

```bash
# Solo la primera vez (o tras clonar)
npm install                                  # instala shared + server + client (un solo node_modules en la raíz)
cp server/.env.example server/.env           # PowerShell: Copy-Item server\.env.example server\.env
cp client/.env.example client/.env           # PowerShell: Copy-Item client\.env.example client\.env

# Cada día
npm run dev        # compila shared y arranca shared (watch) + API (http://localhost:3000/api) + web (http://localhost:5173)

# Antes de cada commit
npm run check      # typecheck + lint + build de shared, server y client
```

La guía detallada está en `INSTRUCCIONESDEEJECUCION.md`, que es solo local.

---

## Entorno

- Node.js 22.13.0, npm 10.9.2, git 2.47.1, Windows 11.
- Raíz del monorepo: `D:\VSCODE_RS` (donde está `PROJECT_SPEC.md`).
- La carpeta `api_workout/` ya existía, está vacía y no forma parte del proyecto.

---

## 2026-11-18 · Fase 1: Inicialización

### Estructura creada

```
/
├── .gitignore
├── PROJECT_SPEC.md
├── PROJECT_DOC.md
├── client/   React + Vite + TS + Tailwind
│   └── src/{components,features,hooks,services,types,utils}/
└── server/   Express + TS
    ├── database/           (aquí irá el .sqlite, ignorado en git)
    └── src/{config,controllers,middlewares,repositories,routes,schemas,services,types}/
```

Las carpetas aún vacías llevan un `.gitkeep` para que git las conserve.

### Client

- Creado con `create-vite@6.5.0`, plantilla `react-ts`. Versiones: React 19, Vite 6, TypeScript 5.8.
- **Dependencias:** `react-router-dom@7`, `@tanstack/react-query@5`, `lucide-react`.
- **Dependencias de desarrollo:** `tailwindcss@4`, `@tailwindcss/vite@4`.
- **Limpieza:** eliminados `App.css`, los SVG de demo, el `README.md` y el `.gitignore` propios de la plantilla (manda el de la raíz).
- **`vite.config.ts`:** plugin de Tailwind; puerto fijo `5173` con `strictPort`, porque debe coincidir con el origen CORS del servidor.
- **`src/index.css`:** solo `@import 'tailwindcss'`.
- **`src/main.tsx`:** se cambió el `!` (non-null assertion) por una comprobación explícita del elemento `#root`.
- **`src/vite-env.d.ts`:** tipado de `VITE_API_URL`.
- **`eslint.config.js`:** reglas añadidas para hacer cumplir la spec:
  - `@typescript-eslint/no-explicit-any: error`
  - `max-lines-per-function: 150`
- **`.env.example`:** `VITE_API_URL=http://localhost:3000/api`.

### Server

- Proyecto ESM (`"type": "module"`), TypeScript con `module: NodeNext`. Por eso los imports locales llevan extensión `.js`.
- **Dependencias:** `express@5`, `helmet@8`, `cors@2`, `zod@4`, `better-sqlite3@12`.
- **Dependencias de desarrollo:** `typescript@5.8`, `tsx@4` (ejecución en desarrollo), `@types/*`.
- **`tsconfig.json`:** `strict`, más `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns` y `noUnused*`.
- **Scripts:**

  | Script | Qué hace |
  |--------|----------|
  | `dev` | `tsx watch` |
  | `build` | `tsc` → `dist/` |
  | `start` | `node dist/server.js` |
  | `typecheck` | `tsc --noEmit` |

- **`src/config/env.ts`:** carga `.env` con el cargador nativo de Node (`process.loadEnvFile`), sin `dotenv`. Valida las variables con Zod (`NODE_ENV`, `PORT`, `CORS_ORIGIN`, `DATABASE_PATH`); si alguna es inválida, el proceso se detiene.
- **`src/app.ts`:**
  - Hace `createApp()`, desactiva `x-powered-by` y fija `express.json({ limit: '10kb' })`.
  - Expone `GET /api/health`.
- **`src/server.ts`:** arranque y apagado limpio (SIGINT/SIGTERM).
- **`.env.example`:** `PORT=3000`, `CORS_ORIGIN=http://localhost:5173`, `DATABASE_PATH=./database/gym.sqlite`.
- `helmet` y `cors` están instalados pero **todavía no se usan**; se montan en la Fase 2.

### Raíz

- **`.gitignore`:** ignora `node_modules`, `dist`, `*.tsbuildinfo` y los `.env` / `.env.*` (excepto los `.env.example`). También ignora `server/database/*.sqlite`, sus ficheros `-wal`, `-shm` y `-journal`, los logs y los archivos de editor/SO.
- Se crearon los `.env` locales copiando los `.env.example`; git no los sube.

### Verificación

| Prueba | Resultado |
|--------|-----------|
| `server: npm run typecheck` | ✅ |
| `client: npm run build` | ✅ |
| `client: npm run lint` | ✅ |
| `GET /api/health` | ✅ `{"success":true,"data":{"status":"ok"}}` |
| POST de 12 KB | ✅ rechazado con `413` (límite de 10kb funcionando) |
| `better-sqlite3` en Windows | ✅ binario nativo OK (SQLite 3.53.2) |

### Auditoría de dependencias

- **Server:** 0 vulnerabilidades.
- **Client:** 0 vulnerabilidades en producción. Hay 10 avisos "high" de `picomatch`, que entra solo por las herramientas de desarrollo y no llega al bundle. No se ejecutó `npm audit fix --force` porque cambiaría versiones mayores. **Revisar más adelante.**

---

## 2026-11-18 · Documentación continua y control de versiones

- **`PROJECT_SPEC.md`:** añadida la regla **5.D Documentación Continua**: toda acción se registra en `PROJECT_DOC.md`.
- **`PROJECT_DOC.md`:** creado este registro, con la Fase 1 documentada.
- **Git:**
  - `git init -b main` en la raíz.
  - Añadido `.gitattributes` (`* text=auto eol=lf`): fuerza finales de línea LF en todos los sistemas operativos y evita diffs falsos por CRLF en Windows.
  - Antes del commit se revisó qué se iba a subir: no entran `.env`, `node_modules` ni bases de datos.
  - Primer commit: estado completo de la Fase 1 más esta documentación.
  - **Identidad git del repo (config local, no global):** `CarlosMV27 <carlosjmdev27@gmail.com>`. El autor del primer commit se corrigió con `--amend --reset-author`. La config global (`cjmvdevandtech@gmail.com`) no se tocó y sigue aplicando a otros repos.
  - **Cuenta GitHub del repo:** `carlosjmdev27`, la asociada a `carlosjmdev27@gmail.com`. Se fija con la config local `credential.https://github.com.username=carlosjmdev27`, para que Git Credential Manager use esa cuenta en este repo. La cuenta antigua `CarlosMV27` sigue guardada para otros repos, y VS Code no se modificó.
  - **Remoto:** `origin` = `https://carlosjmdev27@github.com/carlosjmdev27/api_workout.git` (público). El usuario va en la URL para forzar la cuenta correcta. Rama `main` con seguimiento de `origin/main`.
  - **Primer push:** hecho por el usuario desde la terminal de VS Code, porque el inicio de sesión de GCM necesita una terminal interactiva. Se verificó lo siguiente:
    - El `main` local coincide con `origin/main`.
    - Hay 38 archivos y no se subió ningún `.env`, `.sqlite`, `node_modules` ni `dist`.
    - El autor es `carlosjmdev27@gmail.com`.
    - GCM guarda ahora las dos cuentas (`CarlosMV27` y `carlosjmdev27`); los siguientes push ya no piden login.

---

## 2026-11-18 · Guía de ejecución local

- Creado `INSTRUCCIONESDEEJECUCION.md` en la raíz. Explica cómo arrancar la API y la web en dos terminales, las URLs, la recarga en caliente, qué se ve en cada fase y cómo resolver los problemas habituales.
- Es **solo local**: está añadido a `.gitignore` y nunca se sube al repositorio. Si cambia la forma de ejecutar la app, hay que actualizarlo.

---

## 2026-11-18 · Arranque unificado desde la raíz

Se adelanta este punto de la Fase 4 ("levantar ambos entornos en paralelo").

- **`package.json` en la raíz:** solo orquesta; no contiene código de la app. Única dependencia de desarrollo: `concurrently@9`, con 0 vulnerabilidades.

  | Script | Qué hace |
  |--------|----------|
  | `npm run dev` | Arranca la API y la web a la vez, con prefijos `[api]` (azul) y `[web]` (verde). Con `--kill-others-on-fail`, si una falla se paran las dos. |
  | `npm run install:all` | Instala las dependencias de la raíz, de `server` y de `client`. |
  | `npm run build` | Compila primero `server` y después `client`. |

- **Verificado:** con `npm run dev`, `GET /api/health` responde `ok` y la web devuelve `200`. Al parar el proceso, los puertos 3000 y 5173 quedan libres.
- **`INSTRUCCIONESDEEJECUCION.md`:** actualizado. La opción A es `npm run dev` en la raíz; la opción B, dos terminales. Para autenticarse se usará Git Credential Manager (ya instalado, `credential.helper=manager`), que abre el navegador. Nunca se escriben contraseñas ni tokens en el chat ni en archivos.

---

## 2026-11-18 · Fase 2: Base de datos y backend core

### Arquitectura

Flujo estricto: **Route → (validación Zod) → Controller → Service → Repository → SQLite**

```
server/src/
├── config/        env.ts (Zod), paths.ts (raíz de /server), limits.ts (límites de negocio)
├── errors/        app-error.ts: AppError, NotFoundError (404), BusinessRuleError (422)
├── types/         routine.types.ts, exercise.types.ts, api.types.ts (formato de respuesta)
├── schemas/       common / routine / exercise .schema.ts (Zod)
├── repositories/  routine.repository.ts, exercise.repository.ts  ← interfaces
│   └── sqlite/    connection, migrations, mappers, sqlite-*.repository.ts  ← implementación
├── services/      routine.service.ts, exercise.service.ts  ← lógica de negocio
├── controllers/   routine / exercise .controller.ts, response.ts  ← solo HTTP
├── middlewares/   security (helmet + cors), validate (Zod), error (global + 404)
├── routes/        health / routine / exercise .routes.ts
├── container.ts   raíz de composición: el único sitio que conoce las clases concretas
├── app.ts         createApp(deps): monta middlewares y rutas
└── server.ts      arranque y apagado limpio (también cierra SQLite)
```

**Carpeta nueva fuera de la spec:** `errors/`, porque los errores de dominio no encajan en `types/` (son clases, no tipos).

### Decisiones clave

- **Interfaces de repositorio asíncronas** (`Promise`), aunque `better-sqlite3` es síncrono. Así, migrar a PostgreSQL solo exige escribir otra implementación y cambiarla en `container.ts`. Servicios y controladores no se tocan.
- **Todo lo específico de SQLite** está en `repositories/sqlite/`.
- **Migraciones versionadas** con `PRAGMA user_version` (versión actual: 1). Nunca se edita una migración ya aplicada; se añade una nueva al array.
- **Pragmas:** `foreign_keys = ON` (SQLite las trae desactivadas), `journal_mode = WAL` y `busy_timeout = 5000`.
- **`order` se guarda en la columna `position`**, porque `ORDER` es palabra reservada en SQL. En la API se expone como `order`, empezando en 1.
- **Integridad también en la base de datos:**
  - `CHECK` en `sets > 0`, `weight >= 0`, `rest_seconds >= 0` y `position > 0`.
  - FK con `ON DELETE CASCADE`.
  - Índice `(routine_id, position)`.
- **Transacciones** en todas las escrituras de varias filas:
  - Crear una rutina con sus ejercicios.
  - Borrar una rutina: borrado explícito de los ejercicios y después de la rutina. No depende de la cascada, así funciona igual en cualquier motor.
  - Crear o borrar un ejercicio: al borrar se cierra el hueco en `order`.
  - Reordenar.
- **Cada cambio en un ejercicio actualiza el `updatedAt` de su rutina.**
- **PUT es actualización parcial:** un campo ausente se mantiene y `null` lo borra. En los textos opcionales, `""` se guarda como `null`.
- **Validación Zod en frontera:**
  - Se usa `strictObject`, así que los campos desconocidos dan 400.
  - Los ids de la URL tienen que ser UUID.
  - Los textos se recortan (`trim`).
  - `satisfies z.ZodType<...>` garantiza en compilación que cada esquema coincide con su tipo de dominio.
- **Límites** (`config/limits.ts`):

  | Campo | Límite |
  |-------|--------|
  | Nombre | 100 caracteres |
  | Descripción y notas | 500 caracteres |
  | Repeticiones | 20 caracteres |
  | Series | 1 a 100 |
  | Peso | 0 a 1000 kg |
  | Descanso | 0 a 3600 s |
  | Ejercicios por rutina | 50 como máximo |

- **Ids** generados con `crypto.randomUUID()`; **fechas** en ISO 8601.
- **`.env` y la base de datos** se resuelven desde la carpeta `/server` (`paths.ts`), no desde el directorio de trabajo. La app funciona igual tanto si se arranca desde la raíz como desde `server/`.

### Endpoints (`/api`)

| Método | Ruta | Respuesta |
|--------|------|-----------|
| GET | `/health` | 200 `{status:"ok"}` |
| GET | `/routines` | 200, lista con `exerciseCount`, ordenada por `updatedAt` (más reciente primero) |
| POST | `/routines` | 201, rutina con `exercises[]` (opcional en el body) |
| GET | `/routines/:routineId` | 200, rutina con ejercicios ordenados |
| PUT | `/routines/:routineId` | 200, `name` y/o `description` |
| DELETE | `/routines/:routineId` | 204, borra también sus ejercicios |
| GET | `/routines/:routineId/exercises` | 200 |
| POST | `/routines/:routineId/exercises` | 201, se añade al final |
| PUT | `/routines/:routineId/exercises/order` | 200, body `{exerciseIds:[...]}` con todos los ejercicios |
| PUT | `/routines/:routineId/exercises/:exerciseId` | 200, actualización parcial |
| DELETE | `/routines/:routineId/exercises/:exerciseId` | 204 |

**Formato de respuesta:**

- Éxito: `{ success: true, data }`.
- Error: `{ success: false, error: { code, message, details? } }`.

**Códigos de error:**

| Código | HTTP |
|--------|------|
| `VALIDATION_ERROR` (con `details[]`) | 400 |
| `INVALID_JSON` | 400 |
| `ROUTINE_NOT_FOUND`, `EXERCISE_NOT_FOUND`, `ROUTE_NOT_FOUND` | 404 |
| `PAYLOAD_TOO_LARGE` | 413 |
| `INVALID_EXERCISE_ORDER`, `EXERCISE_LIMIT_REACHED` | 422 |
| `INTERNAL_ERROR` | 500 |

La traza (`stack`) solo se incluye en errores 500 y nunca en producción. El error completo se registra en la consola del servidor.

### Seguridad

- **`helmet()`** activo; `x-powered-by` desactivado.
- **CORS** limitado al origen exacto de `CORS_ORIGIN`:
  - Métodos permitidos: GET, POST, PUT y DELETE.
  - Cabecera permitida: solo `Content-Type`.
  - Las respuestas de preflight se cachean 10 minutos.
- **Payload JSON** limitado a 10 KB.
- **SQL:** solo sentencias preparadas con parámetros. La única interpolación es el número de versión interno en `PRAGMA user_version`, que no acepta parámetros.

### Verificación

- **Typecheck y build de producción:** ✅ Ningún `any` explícito. Archivo más grande: 138 líneas.
- **Smoke test end-to-end:** ✅ 30/30 pruebas.
  - CRUD completo, reordenación y compactación de `order`.
  - Validaciones: vacío, campo desconocido, tipo incorrecto, UUID inválido, update vacío.
  - Respuestas 404, 413 y JSON malformado.
  - CORS: origen permitido y origen ajeno.
  - Cabeceras de helmet y ausencia de `x-powered-by`.
  - Inyección SQL: el texto se guarda literal y la tabla sigue existiendo.
- **Atomicidad:** ✅ Forzando un fallo en la base de datos en el 2º ejercicio (`sets: 0`, saltándose Zod), no se guarda nada (0 rutinas, 0 huérfanos). `foreign_keys` está ON.
- **Incidencia durante las pruebas:**
  - El usuario tenía `npm run dev` activo y `tsx watch` recargó su API, así que el smoke test se ejecutó contra ella y dejó una rutina de prueba en `server/database/gym.sqlite`.
  - La base de datos se había creado en ese mismo arranque, de modo que no había datos previos.
  - La rutina de prueba se borró por la API; la base de datos quedó vacía.
  - **Lección:** antes de lanzar un servidor de pruebas, comprobar si los puertos 3000 y 5173 están ocupados, y usar otra base de datos y otro puerto.
- **`INSTRUCCIONESDEEJECUCION.md`:** nueva sección 4b con cómo probar la API desde el navegador y desde PowerShell.

### Pendiente o a futuro

- No hay *rate limiting*. No lo exige la spec para el MVP local; recomendable antes de exponer la API.
- No hay tests automatizados en el repo. Las pruebas de esta fase fueron scripts temporales, fuera del proyecto.

---

## 2026-11-18 · Fase 3: Frontend core

- Primero se subió la Fase 2 a GitHub (`7ea28b8`).

### Estructura

```
client/src/
├── types/        exercise.ts, routine.ts, api.ts (copia del contrato del server), form.ts
├── services/     http-client.ts (fetch + formato de respuesta), routines.api.ts,
│                 exercises.api.ts, query-client.ts (config de React Query)
├── utils/        limits.ts (copia de los límites del server), validation.ts, format.ts, errors.ts
├── hooks/        useDocumentTitle.ts
├── components/   UI reutilizable sin lógica de dominio:
│                 Button, IconButton, LinkButton (+ button-styles.ts), FormField (TextField, TextAreaField),
│                 Modal (<dialog> nativo), ConfirmDialog, Alert, StatusViews (Loading/Error/Empty),
│                 Layout, PageHeader, NotFound
├── features/
│   ├── routines/  hooks.ts (React Query), routine-form.ts, useRoutineDraft.ts,
│   │              components/ (RoutineCard, RoutineInfoFields, RoutineCreateForm, RoutineEditForm,
│   │                           RoutineDetailHeader, FormActions)
│   │              pages/ (RoutineListPage, RoutineDetailPage, RoutineCreatePage, RoutineEditPage)
│   └── exercises/ hooks.ts, exercise-form.ts,
│                  components/ (ExerciseFields, ExerciseForm, ExerciseFormDialog, ExerciseItem,
│                               ExercisesSection, ExerciseDraftList)
├── App.tsx       rutas
└── main.tsx      QueryClientProvider
```

### Rutas de la web

| URL | Vista |
|-----|-------|
| `/` | Listado de rutinas en tarjetas: nº de ejercicios y fecha de actualización |
| `/routines/new` | Crear una rutina con sus ejercicios en un único formulario (un solo POST, atómico) |
| `/routines/:id` | Detalle: datos, editar o eliminar la rutina; ejercicios con añadir, editar, eliminar y subir/bajar |
| `/routines/:id/edit` | Editar el nombre y la descripción |
| `*` | Página no encontrada |

### Decisiones clave

- **Capa HTTP** (`http-client.ts`):
  - Hay un único sitio que habla con la API. Usa `VITE_API_URL`.
  - Entiende el formato `{ success, data | error }`.
  - Convierte cualquier fallo en `ApiRequestError` (`status`, `code`, `details`). Una API caída se convierte en `NETWORK_ERROR`.
  - Única aserción de tipo: `json.data as T`. Se confía en el contrato de nuestra propia API, cuyos tipos son copia de los del server.
- **React Query:**
  - Claves de caché: `['routines','list']` y `['routines','detail',id]`.
  - Cada mutación actualiza o invalida el detalle y el listado. Al reordenar se aplica al instante el orden que devuelve el server.
  - Los errores 4xx no se reintentan; el resto, hasta 2 veces. `staleTime` es de 30 s.
- **Formularios sin librerías extra:**
  - Los valores del formulario se guardan como texto y se convierten a números al enviar. Se acepta coma decimal (`60,5`).
  - Validación en cliente con los mismos límites que el server, solo para dar feedback inmediato. **El server sigue siendo la autoridad.**
  - Los errores del server se muestran en un `Alert`, con detalles si los hay.
- **Edición de ejercicios** en un modal desde la vista de detalle, no en una página aparte. El formulario de editar rutina solo cambia nombre y descripción.
- **Accesibilidad:**
  - `<dialog>` nativo: atrapa el foco y se cierra con Esc.
  - `label` asociado a cada campo, con `aria-invalid` y `aria-describedby`.
  - Los botones que solo tienen icono llevan `aria-label`.
  - Hay estados de carga y error anunciados con `role`.
- **Mensajes al usuario** en español, según el código de error de la API (`utils/errors.ts`).
- **Responsive:**
  - Rejilla de 1, 2 o 3 columnas en el listado.
  - En móvil, las acciones de cada ejercicio se colocan en una rejilla de 2×2 y los botones de los formularios se apilan.

### Verificación

| Prueba | Resultado |
|--------|-----------|
| `tsc -b` | ✅ |
| `eslint` (sin `any`, máx. 150 líneas por función) | ✅ |
| `vite build` | ✅ (≈107 KB gzip de JS) |
| Archivo más grande | 132 líneas (`ExercisesSection.tsx`) |
| Preflight CORS real (POST desde 5173) | ✅ 204, origen, métodos y cabeceras correctos |
| Capturas con Edge headless (escritorio y móvil a 390 px reales) | ✅ revisadas |
| Flujos de interfaz automatizados con Edge vía CDP | ✅ 10/10 |

**Flujos probados:**
- Validación del formulario vacío.
- Crear una rutina con un ejercicio usando coma decimal.
- Error de rango en el modal y corrección.
- Añadir un ejercicio desde el modal.
- Reordenar.
- Editar con los valores precargados.
- Eliminar un ejercicio, con confirmación.
- Editar la rutina.
- Eliminar la rutina y volver al listado.
- Mensaje de rutina inexistente.

**Condiciones de las pruebas:**
- Se comprobó antes que los puertos estaban libres, para no repetir la incidencia de la Fase 2.
- Se usó una base de datos temporal fuera del proyecto. La base de datos real no se tocó.
- Edge headless en Windows fuerza un ancho mínimo de unos 492 px. Las capturas de móvil se hicieron con un iframe de 390 px.

### Pendiente o a futuro

- Los tipos del contrato están duplicados en client y server, y también los límites. Si el proyecto crece, conviene extraerlos a un paquete compartido.
- Reordenar con arrastrar y soltar. Ahora se hace con los botones de subir y bajar, que son accesibles con teclado.

---

## 2026-11-18 · Seguimiento de la deuda técnica

- Nueva tabla **"Pendientes / deuda técnica"** en el bloque "Estado actual" de este documento. Reúne los pendientes que estaban repartidos por las fases: duplicados, rate limiting, tests y `picomatch`.
- Los 8 archivos duplicados (4 parejas client/server) llevan ahora el comentario `DUPLICATED in ... — keep both in sync`, que apunta a su pareja.
- Hay una regla provisional y una solución prevista (paquete `shared/` con npm workspaces) para el pendiente #1.
- Verificado: typecheck de `server` y de `client` correcto (solo cambiaron comentarios).
- Commits `c4a91dc` (Fase 3) y este, subidos a GitHub.

---

## 2026-11-18 · Fase 4: Verificación final, seguridad y limpieza

### Comandos exactos

Están en el bloque **"Arrancar en local"** al principio de este documento.

- Se verificaron **clonando el repo en una carpeta vacía** y siguiéndolos al pie de la letra: `install:all` → copiar los `.env` → `check` → `dev`.
- Sobre ese clon pasaron las mismas pruebas de las fases anteriores:
  - Smoke test de la API: 30/30.
  - Flujos de interfaz con Edge vía CDP: 10/10.

### Cambios realizados

| Cambio | Motivo |
|--------|--------|
| `client/vite.config.ts`: el puerto sale de `DEV_SERVER_PORT` (`.env`), no de un `5173` fijo | Regla 5.C: nunca fijar puertos en el código. Solo se exige en `vite` (desarrollo); `vite build` no lo necesita. Variable sin prefijo `VITE_`, así que no llega al bundle del navegador. |
| `client/.env.example`: añadido `DEV_SERVER_PORT=5173` | Documentar la variable nueva. También se añadió al `.env` local. |
| `http-client.ts`: comprobación de `VITE_API_URL` al arrancar y tolerancia a la barra final | Sin la comprobación, faltar la variable provocaba peticiones a `undefined/routines` sin un error claro. |
| ESLint en `server` (mismas versiones que `client`), script `lint` y `eslint.config.js` | Las reglas 5.A (sin `any`, máx. 150 líneas por función) se comprueban ahora automáticamente también en el backend. `_next` del manejador de errores, permitido con `argsIgnorePattern: '^_'`. |
| Raíz: scripts `typecheck`, `lint` y `check` | Un solo comando para verificar todo el monorepo. |

### Revisión de seguridad y limpieza (PROJECT_SPEC §5)

| Regla | Verificación | Resultado |
|-------|--------------|-----------|
| A · Flujo Route → Controller → Service → Repository | Revisión de imports: los controladores solo importan servicios; solo los repositorios importan `better-sqlite3`. | ✅ |
| A · Repository Pattern | Interfaces en `repositories/`; las clases concretas solo aparecen en `container.ts`. | ✅ |
| A · Sin `any` | ESLint `no-explicit-any: error` en `client` y `server`. Solo dos aserciones `as` justificadas: `json.data as T` y `Object.fromEntries`. | ✅ |
| A · Máx. 150 líneas | ESLint `max-lines-per-function` en ambos. Archivo más grande: 138 líneas. | ✅ |
| A · Código muerto | Búsqueda de exports sin usar: ninguno. Sin `TODO`, `debugger` ni `console.*` de depuración; solo los logs intencionados del server. | ✅ |
| B · Validación en frontera | Todos los POST y PUT pasan por `validateBody` (Zod `strictObject`) y todos los ids por `validateParams` (UUID). | ✅ |
| B · Transacciones | Crear o borrar una rutina, y crear, borrar o reordenar ejercicios. Probado forzando un fallo de la base de datos a mitad: sin huérfanos. | ✅ |
| B · Errores centralizados sin traza en producción | Error 500 simulado con datos internos: en producción solo `INTERNAL_ERROR` genérico, sin `stack` ni mensaje interno; en desarrollo sí incluye `stack`. | ✅ |
| C · helmet | Cabeceras presentes (`nosniff`, etc.); sin `x-powered-by`. | ✅ |
| C · CORS restrictivo | Preflight real: solo `http://localhost:5173`, métodos GET/POST/PUT/DELETE, cabecera `Content-Type`. Un origen ajeno no se refleja. | ✅ |
| C · Inyección SQL | Todas las interpolaciones `${}` en SQL son constantes internas. Payload `'); DROP TABLE` guardado como texto literal. | ✅ |
| C · Secretos y config | Sin puertos, URLs ni rutas fijas en el código (corregido el puerto de Vite). `.env` y `*.sqlite` no versionados (`git ls-files`). Sin `.env`, server y client fallan con un mensaje claro. | ✅ |
| C · Límite de payload | `express.json({ limit: '10kb' })`: 12 KB → 413 `PAYLOAD_TOO_LARGE`. | ✅ |
| Client · XSS | Sin `dangerouslySetInnerHTML`, `innerHTML` ni `eval`; React escapa todo el texto. Ids de URL con `encodeURIComponent`. | ✅ |
| Dependencias | `npm audit --omit=dev`: **0** en raíz, server y client. Solo dev: `picomatch` sin versión corregida (pendiente #4). | ⚠️ aceptado |

### Riesgos aceptados para el MVP local

Ver la tabla de pendientes:

- Sin rate limiting (#2).
- Sin tests automatizados en el repo (#3).
- `picomatch` en dependencias de desarrollo (#4).
- Tipos duplicados entre client y server (#1).

### Incidencia durante las pruebas

- En el clon limpio, el flujo de interfaz 8 falló por un **error del test**, no de la app: esperaba ver una rutina de ejemplo de la Fase 3 que no existe en una base de datos nueva.
- Se corrigió el test y pasaron 10/10.

### Limpieza

- El clon temporal, las bases de datos de prueba y las carpetas `dist/` se borraron.
- La base de datos real (`server/database/gym.sqlite`) no se tocó en ninguna prueba de esta fase.

---

## 2026-11-18 · Decisión: pendientes aplazados

- **Decisión del usuario:** los pendientes #1 (tipos duplicados), #2 (rate limiting) y #3 (tests automatizados) **se aplazan** y no se abordan por ahora. Se mantienen en la tabla de pendientes.
- **Motivo:** el MVP se usa solo en local, donde no suponen un riesgo real.
- **Orden recomendado para cuando se retomen:**
  1. #2 rate limiting (`express-rate-limit`).
  2. #1 paquete `shared/` con npm workspaces.
  3. #3 tests con Vitest + supertest, al final para que cubran también el paquete compartido.
- **Obligatorio antes de exponer la API fuera de `localhost`:** resolver el #2.
- Se suben a GitHub los commits de la Fase 4 (`3b29e05`, `5f5772f`) y esta entrada.

---

## 2026-11-19 · Actualización §7: Paso previo y Fase 2 v2 (backend)

El usuario añadió la sección 7 a la spec: jerarquía Rutina → Tabla → Ejercicio → Serie, historial de sesiones y modo entrenamiento.

**Decisiones del usuario:**
1. Crear primero el paquete `shared/`, lo que resuelve el pendiente #1.
2. **Empezar de cero:** la base de datos antigua tenía 1 rutina («PIERNA») con 1 ejercicio, y se descartan, no se convierten.

### Paso previo: monorepo con npm workspaces + `@gym/shared`

- **Raíz:** `package.json` con `"workspaces": ["shared","server","client"]`.
  - Un solo `node_modules` y un solo `package-lock.json` en la raíz. Se borraron los de `server/` y `client/`.
  - `npm install` instala todo; `install:all` se mantiene como alias.
- **`shared/`** (paquete `@gym/shared`, ESM, compilado a `dist/` con declaraciones `.d.ts`):

  | Archivo | Contenido |
  |---------|-----------|
  | `limits.ts` | Todos los límites de negocio |
  | `set-types.ts` | `SET_TYPES` (`warmup`, `normal`, `topset`, `backoff`, `restpause`, `dropset`) y `isSetType` |
  | `schemas/*.schema.ts` | Esquemas Zod de rutina, tabla, ejercicio con series y sesión. Los tipos de entrada salen de `z.infer`, así que no se duplican. |
  | `types/domain.types.ts` | Entidades que devuelve la API |
  | `types/api.types.ts` | Formato `{ success, data \| error }` |
  | `progression.ts` | `estimateOneRepMax` (Epley), para la Fase 4 |

- **Por qué compilado y no código fuente TS:** `node dist/server.js` en producción no puede ejecutar TypeScript.
  - En desarrollo, `npm run dev` compila `shared` primero y luego lo deja en modo *watch* junto a la API y la web (3 procesos: `shared`, `api`, `web`).
  - `typecheck` y `build` compilan `shared` antes que el resto.
- **Una sola copia de `zod`** en todo el monorepo. Es necesario para que `instanceof ZodError` funcione en el manejador de errores.
- **Server:** se borraron sus tipos, límites y esquemas propios; ahora importa todo de `@gym/shared`. Solo conserva los esquemas de parámetros de URL (`schemas/params.schema.ts`) y el tipo interno `NewSessionRecord`.

### Modelo de datos (migración v2)

**Tablas nuevas:**

| Tabla | Relación |
|-------|----------|
| `routines` | Raíz |
| `workout_days` | Pertenece a `routines` (CASCADE) |
| `day_exercises` | Pertenece a `workout_days` (CASCADE) |
| `planned_sets` | Pertenece a `day_exercises` (CASCADE) |
| `workout_sessions` | Pertenece a `workout_days` (CASCADE) |
| `logged_sets` | Pertenece a `workout_sessions` (CASCADE). `day_exercise_id` es **ON DELETE SET NULL** |

**Integridad en la base de datos:**
- `CHECK` de `set_type` (lista cerrada).
- `target_rep_min > 0` y `min <= max`.
- Pesos, reps y RIR ≥ 0.
- `UNIQUE(day_exercise_id, set_number)`.
- Índices por padre y posición.

**Decisiones de modelo:**
- **API en camelCase** (`setNumber`, `targetRepMin`…); la base de datos en snake_case, como pide la spec.
- **`setNumber` lo asigna el servidor** (1..n según la posición en el array `sets`). El cliente no lo envía, así que nunca hay huecos ni duplicados.
- **Editar las series de un ejercicio = sustituirlas todas** en una transacción (`PUT /exercises/:id` con `sets`). Si se envían solo `name` o `notes`, las series no se tocan.
- **El historial sobrevive a los cambios de la plantilla:** cada `logged_set` guarda una copia del nombre y la posición del ejercicio. Si se borra el ejercicio de la tabla, sus registros quedan con `dayExerciseId: null` pero conservan nombre, peso y reps.
- **Borrar una tabla borra su historial** (cascade), igual que borrar la rutina. Se hace con confirmación en la UI.
- **Migración v2 inmutable:** la lista de `set_type` del `CHECK` está copiada literalmente en el SQL, no leída de `SET_TYPES`. Si se añade un tipo nuevo, hará falta una migración v3.
- **Borrar una rutina** ya no borra los hijos uno a uno: con 5 niveles se confía en `ON DELETE CASCADE`, que es SQL estándar y también existe en PostgreSQL.

### Endpoints (`/api`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/routines` | Lista (`dayCount`) / crear (`name`, `description`) |
| GET/PUT/DELETE | `/routines/:routineId` | Árbol completo días → ejercicios → series / editar / borrar todo |
| GET/POST | `/routines/:routineId/days` | Tablas de la rutina / añadir tabla (`name`) |
| PUT | `/routines/:routineId/days/order` | `{ dayIds }` con todas las tablas |
| GET/PUT/DELETE | `/days/:dayId` | Tabla con ejercicios, series y `routineName` / renombrar / borrar |
| POST | `/days/:dayId/exercises` | Ejercicio con `sets[]` (1..20), atómico |
| PUT | `/days/:dayId/exercises/order` | `{ exerciseIds }` |
| PUT/DELETE | `/exercises/:exerciseId` | Parcial; `sets` sustituye todas las series |
| POST | `/sessions` | `{ workoutDayId, completedAt?, durationMinutes?, notes?, sets[] }` |
| GET | `/days/:dayId/history` | Últimas 50 sesiones, de la más reciente a la más antigua, con sus series |
| DELETE | `/sessions/:sessionId` | Borrar una sesión registrada por error |

**Reglas de negocio** (`services/`):

| Regla | Código de error |
|-------|-----------------|
| Máximo 14 tablas por rutina | `DAY_LIMIT_REACHED` |
| Máximo 30 ejercicios por tabla | `EXERCISE_LIMIT_REACHED` |
| Reordenar exige enviar todos los elementos | `INVALID_DAY_ORDER` / `INVALID_EXERCISE_ORDER` |
| Una sesión solo registra ejercicios de su propia tabla | `INVALID_SESSION_EXERCISE` |
| `completedAt` no puede ser futuro (tolerancia de 5 min) | `INVALID_SESSION_DATE` |

**Nuevos 404:** `DAY_NOT_FOUND` y `SESSION_NOT_FOUND`.

### Verificación

| Prueba | Resultado |
|--------|-----------|
| `npm run check` (shared + server + client) | ✅ |
| `npm audit` | ✅ 0 vulnerabilidades (incluidas las de desarrollo) |
| Migración v1 → v2 sobre una **copia** de `gym.sqlite` | ✅ versión 2, 6 tablas, la tabla antigua eliminada, `foreign_key_check` e `integrity_check` correctos. La base de datos real no cambió (hash idéntico). |
| Smoke test de la API v2 (base de datos temporal, puertos comprobados antes) | ✅ 32/32 |
| Repositorios directos | ✅ Sin filas huérfanas en las 6 tablas tras las cascadas. Sustituir las series es atómico: un fallo de la base de datos a mitad deja intactos el nombre y las series anteriores. |
| Archivo más grande | 149 líneas (`rows.ts`) |

**Qué cubre el smoke test:**
- Jerarquía completa y series tipadas.
- Validaciones: `min > max` (con la ruta del error en el campo), tipo de serie desconocido, sin series, `min = 0`.
- Reordenar tablas y ejercicios.
- Sesiones e historial ordenado.
- Reglas 422 de sesión y series duplicadas.
- El historial conserva los datos tras borrar el ejercicio.
- **La sesión máxima (60 series) ocupa 9.330 bytes, dentro del límite de 10 KB.**
- Errores 404 y 400 y cascadas.

### Estado intermedio

- La **web (client) no funciona** hasta completar la Fase 3 v2, porque llama a los endpoints del modelo antiguo, que ya no existen. Compila, pero falla en tiempo de ejecución.
- La API sí se puede probar (ver `INSTRUCCIONESDEEJECUCION.md`, sección 4b).
- Cuando arranque, la API aplicará la migración v2 a `server/database/gym.sqlite`, que quedará vacía.

---

## 2026-11-19 · Actualización §7: Fase 3 v2 (constructor de tablas y series)

- Antes de empezar se subió el backend v2 a GitHub (`a3a2078`).

### Cambios en el client

- **Usa `@gym/shared`.** Se borraron `src/types/` (toda la carpeta), `utils/limits.ts` y todo el código del modelo v1: el formulario con borradores de ejercicios, `ExercisesSection`, `ExerciseItem`, etc.
  - Se añade `zod` como dependencia explícita (misma versión, una sola copia).
  - **Diferencia con la estructura de la spec §3:** `client/src/types/` ya no existe, porque los tipos viven ahora en `shared/src/types/`.
- **Validación con los mismos esquemas que la API** (`utils/validation.ts` → `validateWith`):
  - Cada formulario construye un candidato y lo valida con el esquema compartido (`routineInputSchema`, `workoutDayInputSchema`, `dayExerciseInputSchema`).
  - Los errores de Zod se traducen al español y se asignan por ruta de campo, p. ej. `sets.2.targetRepMax` → "Debe ser ≥ reps mín.".
  - Se usa `reportInput` para distinguir "campo obligatorio" de "debe ser un número" o "debe ser un número entero".
- **Servicios:** `routines.api.ts` (árbol completo), `days.api.ts` y `exercises.api.ts` con los endpoints nuevos.
- **Hooks de React Query:** cada mutación de tablas o ejercicios llama a `refreshRoutine()`, que invalida el árbol de la rutina y el listado.
  - Al borrar una rutina, además, se quita del listado en caché al instante.
- **`Modal`** admite `size="lg"` para el editor por series.

### Vistas

| Vista | Qué incluye |
|-------|-------------|
| Listado | Las tarjetas muestran el **nº de tablas**. |
| Crear / editar rutina | Un único `RoutineForm` (nombre y descripción). Al crear, se va al detalle para añadir las tablas. |
| Detalle de rutina | **Pestañas por tabla** (`DaysSection` + `DayTabs` + `DayPanel`), descritas abajo. |
| Editor de ejercicio (modal grande) | Nombre, **una fila por serie** y notas técnicas, descrito abajo. |

**Detalle de rutina:**
- La pestaña activa va en la URL (`?day=<id>`), así que sobrevive a recargar y se puede enlazar.
- Las pestañas siguen el patrón WAI-ARIA y se navegan con ←/→/Inicio/Fin.
- "+ Tabla" crea una tabla y la selecciona. Si la rutina no tiene tablas, se muestra un estado vacío con "Crear primera tabla".
- En cada tabla:
  - Renombrarla y moverla a izquierda o derecha.
  - Eliminarla, con un aviso explícito de que **borra su historial**.
  - Ejercicios con su tabla de series (badge de color por tipo, peso, reps mín-máx y RIR), subir/bajar, editar y eliminar. Al eliminar un ejercicio se avisa de que el historial se conserva.

**Editor de ejercicio:**
- Cada fila de serie tiene:
  - Un **selector de tipo** tintado con su color: Aproximación (azul), Normal (gris), Top set (rosa), Back-off (ámbar), Rest-pause (violeta), Drop set (verde).
  - **Campos compactos** para Peso kg, Reps mín, Reps máx y RIR. El peso acepta coma decimal.
  - Botones de **duplicar** (inserta una copia justo debajo) y **quitar** (desactivado si es la única serie).
- **"+ Añadir serie" copia la configuración de la última serie.**
- Un ejercicio nuevo empieza con 3 series normales de 8-12.
- Máximo 20 series.
- Los errores se muestran en la propia fila.
- **Móvil:** cada serie ocupa 2 líneas (tipo y acciones / 4 campos), sin scroll horizontal (comprobado: 358 px de contenido en 358 px disponibles).

### Verificación

| Prueba | Resultado |
|--------|-----------|
| `npm run check` (shared + server + client) | ✅ |
| `npm audit` | ✅ 0 vulnerabilidades |
| Archivo más grande del client | 104 líneas |
| Capturas (Edge headless) del detalle en escritorio y móvil, del editor en escritorio y del editor en móvil emulado a 390 px | ✅ revisadas |
| Flujos de interfaz automatizados con Edge vía CDP (base de datos temporal) | ✅ 14/14 |

**Flujos probados:**
- Crear rutina → estado sin tablas.
- Crear la primera tabla (seleccionada y en la URL) y una segunda con "+ Tabla".
- Teclado ← en las pestañas.
- Editor con 3 series por defecto.
- Error `min > max` en la fila 3.
- Duplicar (copia tipo y peso `85,5`), quitar y añadir (copia la última).
- Guardar con badges correctos.
- Editar con los valores precargados y quitar una serie.
- Renombrar, mover y eliminar la tabla.
- Eliminar la rutina y volver al listado.
- URL de una rutina borrada → mensaje claro.

**Incidencias del test (no eran fallos de la app):**
1. "Quitar serie" + "Guardar" en la misma tarea JS: React aún no había aplicado el cambio. Se añadió una espera en el test; un usuario real no puede hacer dos clics en la misma tarea.
2. Datos sobrantes de una ejecución interrumpida hacían fallar la comprobación "la rutina ya no está".
   - Al investigarlo se añadió igualmente una mejora real: quitar la rutina del listado en caché al instante tras borrarla.

### ⚠️ Incidencia: `gym.sqlite` real migrada a v2

- **Qué se encontró:** al final de esta fase, la base de datos real estaba ya en `user_version = 2`, **vacía** (0 filas en las 6 tablas, sin datos de prueba).
- **Cuándo:** el cambio está en `gym.sqlite-wal`, escrito el 2026-11-19 a las 16:09:08.
- **Origen sin confirmar:** no coincide con ningún servidor de prueba de Claude (16:04, 16:07 y 16:15, todos con `DATABASE_PATH` temporal y ya cerrados). Puede que el usuario arrancara la app en ese intervalo, pero no puede descartarse del todo un proceso de las pruebas.
- **Fallo de verificación de Claude:** las comprobaciones de "base de datos real intacta" comparaban solo el hash de `gym.sqlite`. Con `journal_mode = WAL`, SQLite escribe primero en `gym.sqlite-wal`, así que esa comprobación no detectaba cambios.
  - **A partir de ahora:** verificar `PRAGMA user_version` y los tres archivos (`.sqlite`, `-wal` y `-shm`).
- **Impacto:** ninguno real. Es el mismo estado que habría quedado al arrancar la API por primera vez tras la decisión de "empezar de cero".

---

## 2026-11-19 · Actualización §7: Fase 4 v2 (modo entrenamiento y progresión)

- Antes de empezar se subió la Fase 3 v2 a GitHub (`3d3dc7d`).

### Nuevas rutas de la web

| URL | Vista |
|-----|-------|
| `/days/:dayId/workout` | **Entrenamiento activo** de una tabla |
| `/days/:dayId/history` | **Historial y progresión** de esa tabla |

- Acceso desde cada tabla: botones **Iniciar tabla** (solo si tiene ejercicios) e **Historial**.

### Entrenamiento activo (`features/workout/`)

- **Carga:** la estructura de la tabla (`GET /days/:id`) y su historial. La sesión más reciente es la que alimenta los **datos de la sesión anterior**.
- **Columna "Anterior"** en cada serie, emparejada por ejercicio y número de serie, p. ej. "Anterior: 102,5 kg × 7".
  - Si el tipo de serie cambió desde entonces, se indica entre corchetes ("[Top set]").
  - Se marca "(no completada)" si aquella serie no se completó.
- **Autocompletado:**
  - Los campos vacíos muestran como sugerencia el peso y las reps de la sesión anterior; si no la hay, el peso objetivo y las reps mínimas.
  - **Al marcar ✓ una serie con campos vacíos, se rellenan con la sugerencia.** Se pueden ajustar después.
- **Cronómetro** visible. Al guardar, la duración se calcula sola (entre 1 y 600 min).
- **Guardar:** se envían las series marcadas o con algún valor escrito.
  - La validación usa `sessionInputSchema` (compartido) y los errores aparecen en su fila, p. ej. reps "6,5" → "Debe ser un número entero".
  - Si no hay nada → "Marca o rellena al menos una serie".
  - Tras guardar se va al historial con un aviso de confirmación.
- **Borrador en `localStorage`** (`workout-draft.ts`):
  - Lo escrito se guarda solo, en cuanto hay progreso, para no perderlo si se bloquea el móvil o se recarga la página.
  - Al volver aparece "Se ha recuperado un entrenamiento sin guardar".
  - Se ignoran los borradores de más de 12 h y se valida su forma con Zod.
  - **Descartar** (con confirmación) borra el borrador. Guardar también lo borra.
- **Barra inferior fija** con el progreso ("8/12 series"), Descartar y Guardar. Respeta la zona segura de los móviles con muesca.
- **Accesibilidad:** el check de cada serie es un botón interruptor con una etiqueta única ("Press de banca, serie 2 hecha"); su estado lo indica `aria-pressed`.

### Historial y progresión (`features/history/`)

- **Progresión por ejercicio:** un selector con los ejercicios presentes en el historial.
  - Agrupa por `dayExerciseId`, o por nombre si el ejercicio se borró de la plantilla.
  - **Gráfico del e1RM estimado** (Epley, `estimateOneRepMax` de `@gym/shared`) con la mejor serie de cada sesión.
  - **Tabla cronológica:** fecha, mejor serie, e1RM, **Δ e1RM** respecto a la sesión anterior, reps totales y **peso movido** (Σ peso × reps).
- **Sesiones:** tarjetas con duración, series hechas, reps totales y peso movido.
  - Se despliegan para ver cada serie (tipo, peso × reps, ✓ o "no completada") y las notas.
  - Se puede **eliminar una sesión** con confirmación.
- **Gráfico SVG propio, sin librerías nuevas**, siguiendo la guía de visualización de datos:
  - Una sola serie, así que no hay leyenda; el título la nombra.
  - Línea de 2 px, puntos de 8 px con anillo blanco de 2 px, rejilla de 1 px y valor al final de la línea.
  - Ticks redondos (`niceTicks`) y eje temporal proporcional a la fecha.
  - **Cruceta que se ajusta a la sesión más cercana**, con un tooltip donde el valor va primero.
  - **Navegable con el teclado** (foco → última sesión, ←/→, Esc) y anunciado con `aria-live`.
  - La tabla contiene los mismos datos, así que el tooltip nunca es la única vía para leerlos.
  - Color índigo validado con `validate_palette.js` contra el fondo: **todas las comprobaciones correctas**.
  - Ancho adaptable al contenedor (`useElementWidth` + `ResizeObserver`).

### Otros cambios

- **Claves de caché de las tablas** en `features/days/keys.ts`. `refreshRoutine()` invalida también `['days']`, así que editar una tabla refresca las pantallas de entrenamiento e historial. Guardar o borrar una sesión invalida el historial de esa tabla.
- **`shared/tsconfig.json`: `incremental: true`** (`dist/.tsbuildinfo`, ignorado por git).
  - **Arregla un problema de desarrollo:** al arrancar `npm run dev`, el *watch* de `shared` reescribía `dist/` y `tsx` reiniciaba la API unos segundos después. Una petición hecha en ese momento se cortaba (pasó al crear los datos de prueba).
  - Verificado: 0 reinicios al arrancar, y la API sí se reinicia cuando cambia de verdad un archivo de `shared`.
- **Formato:** `formatNumber`, `formatDateTime`, `formatShortDate` y `formatDuration`.

### Verificación

| Prueba | Resultado |
|--------|-----------|
| `npm run check` | ✅ |
| `npm audit` | ✅ 0 vulnerabilidades |
| Archivo más grande | 139 líneas (`workout-model.ts`) |
| Flujos de interfaz con Edge vía CDP (base de datos temporal y puertos comprobados antes) | ✅ 12/12 |
| Capturas revisadas | Entrenamiento (escritorio y móvil a 390 px), historial (escritorio y móvil), tooltip con un movimiento de ratón real. Además, el gris de las sugerencias se oscureció un tono para que se lea mejor. |
| **Base de datos real** | Hash de `gym.sqlite`, `-wal` y `-shm` idénticos antes y después de las pruebas, aplicando la lección de la Fase 3 v2 ✅ |

**Flujos probados:**
- Datos anteriores y sugerencias.
- Guardar vacío → aviso.
- Marcar ✓ autocompleta.
- Recuperar el borrador tras recargar.
- Descartar.
- Error por fila.
- Guardar → historial con aviso.
- Un punto del gráfico por sesión.
- Teclado en el gráfico.
- Cambiar de ejercicio.
- Eliminar una sesión.

**Incidencias del test (no eran fallos de la app):**
1. Los valores esperados suponían la sesión de 100 kg, pero la sesión cortada por el reinicio era otra. Se ajustaron a los datos reales.
2. Un botón "Serie 4" que no existe (las series se numeran por ejercicio). Al investigarlo se detectó y **corrigió un problema real de accesibilidad**: varios botones compartían la etiqueta "Serie 1 pendiente".
3. En Edge headless la página no tiene el foco de la ventana, así que `focus()` no dispara el evento. Se resolvió con `Emulation.setFocusEmulationEnabled`.

---

## 2026-11-19 · Limpieza de datos de prueba del usuario

- Por petición del usuario se eliminó de la base de datos real (`server/database/gym.sqlite`) su rutina de prueba **«PPL»**, que tenía 1 tabla, 1 ejercicio y ninguna sesión.
- La API estaba apagada, así que se usó el propio repositorio de la app (`SqliteRoutineRepository.delete`) con las claves foráneas activas. Antes de borrar se comprobó que el id y el nombre coincidían.
- Resultado: base de datos vacía, 0 filas en las 6 tablas.
---

## 2026-11-19 · Datos de demostración en la base de datos real

Por petición del usuario se simularon una rutina y entrenamientos para ver la app funcionando, con la comparación entre sesiones.

- **Cómo:** se arrancó solo la API sobre `server/database/gym.sqlite` (comprobando antes que los puertos estaban libres) y se rellenó **mediante la API real**, así que pasa por las mismas validaciones. Después se detuvo la API.
- **Rutina «Torso-Pierna 4 días»:** su descripción indica que es de ejemplo y que se puede borrar.

  | Tabla | Ejercicios | Tipos de serie que incluye |
  |-------|------------|----------------------------|
  | Torso A | 5 | Aproximación, top set, back-off, drop set… |
  | Pierna A | 5 | Incluye rest-pause en curl femoral |
  | Torso B | 5 | |
  | Pierna B | 4 | |

- **24 sesiones:** 6 semanas, del 5 de octubre al 13 de noviembre de 2026, cada tabla una vez por semana (lunes, martes, jueves y viernes).
  - **Doble progresión:** el peso sube ~2 % por semana y las reps alternan entre el máximo y el máximo − 1.
  - **Altibajos intencionados:** estancamiento en la sentadilla la semana 4, una back-off de banca sin completar y 4 sesiones con notas.
  - **Esta semana no tiene sesiones**, para poder usar "Iniciar tabla" y ver la columna "Anterior" con los datos de la semana pasada.
- **Para borrarla:** en la app, abrir la rutina → **Eliminar**. Se borran tablas, ejercicios e historial.
---

## 2026-11-19 · Eliminación de los datos de demostración

- Por petición del usuario se eliminó la rutina de ejemplo «Torso-Pierna 4 días», con sus 4 tablas y 24 sesiones (el usuario no había añadido sesiones propias). Se usó el repositorio de la app, comprobando antes el id y el nombre.
- La base de datos real queda vacía: 0 filas en las 6 tablas.
- Se suben a GitHub todos los commits locales pendientes.
---

## 2026-11-19 · Actualización §8 (v3): planificación vs. ejecución y ciclo de vida de la sesión

### Análisis previo

Mucho de lo que pedía la §8 ya existía desde la Fase 4 v2: vista de ejecución separada de la plantilla, inputs reales, check, columna "Anterior", cronómetro por diferencia de tiempos y borrador. Se propusieron alternativas en 4 puntos y **el usuario aceptó las 4 recomendaciones**:

| Punto | Spec | Decisión | Motivo |
|-------|------|----------|--------|
| Reps al marcar ✓ | Obligatorias | **Obligatorias** (se elimina el autocompletado de reps de la v2) | Evita registrar reps que no se hicieron |
| Botones | Todo en una barra superior fija | **Arriba**: nombre, cronómetro, progreso y Cancelar. **Abajo**: Terminar entrenamiento | El botón principal queda al alcance del pulgar en el móvil |
| Duración | El cliente envía `duration_seconds` | **La calcula el servidor** a partir de `startedAt` y `completedAt` | Una sola fuente de verdad; datos que no se contradicen |
| Resumen | Pantalla tras terminar | **Página propia de cada sesión** (`/sessions/:id`), que también se abre desde el historial | Se puede consultar después |

**Otras decisiones de Claude, sin consulta:**
- **Un único entrenamiento activo**, con un aviso en toda la app.
- **Se mantiene camelCase en la API** (la spec usaba `workout_day_id` y `exercise_id`).
- **Se adopta la ruta de la spec**, `/workout/active/:dayId`.

### Backend

- **Contrato (`@gym/shared`):**
  - `sessionInputSchema` exige `startedAt` y `completedAt` (ISO), con la regla `startedAt <= completedAt`. El esquema estricto **rechaza que el cliente envíe una duración**.
  - Los sets ya no llevan `completed` (solo se envían series hechas) y `actualReps` pasa a ser **obligatorio**.
  - `setNumber` puede llegar a 30 (`LOGGED_SET_NUMBER_MAX`) para las **series extra**.
  - `WorkoutSession` tiene `startedAt` (null en las sesiones anteriores a la v3) y `durationSeconds`.
  - Nuevo tipo `WorkoutSessionDetail`, con `dayName`, `routineId` y `routineName`.
- **Migración v3:** `ADD COLUMN started_at`, `ADD COLUMN duration_seconds` (CHECK ≥ 0), conversión minutos → segundos y `DROP COLUMN duration_minutes` (soportado por SQLite 3.53, se comprobó antes).
- **`SessionService`:**
  - Calcula `durationSeconds = (completedAt − startedAt) / 1000`.
  - Más de 10 h → 422 `INVALID_SESSION_DURATION`.
  - Fecha futura → 422 `INVALID_SESSION_DATE`.
  - Guarda todas las series como completadas.
- **Nuevo endpoint `GET /api/sessions/:sessionId`**, que devuelve la sesión con los nombres de su tabla y su rutina.
- `GET /days/:dayId/history` devuelve ahora `durationSeconds` y `startedAt`.

### Frontend

- **Entrenamiento activo único** (`features/workout/active-workout.ts`):
  - Se guarda en `localStorage` (`active_workout_draft`) **en cuanto se entra**, con el `startedAt`. Recargar o bloquear el móvil no reinicia el cronómetro.
  - El borrador se valida con Zod y se olvida pasadas 12 h.
  - `useSyncExternalStore` sincroniza todas las vistas y las demás pestañas.
- **Aviso "Entrenamiento en curso"** (`ActiveWorkoutBanner`) en todas las páginas salvo la del propio entrenamiento: muestra el cronómetro y lleva a "Reanudar". El `Layout` lo recibe como *slot*, así que `components/` no depende de ninguna funcionalidad.
- **Si se intenta iniciar otra tabla** con un entrenamiento activo, aparece una pantalla para **Reanudar** el actual o **Descartarlo y empezar esta**. Nunca se sobrescribe sin preguntar.
- **`ActiveWorkoutTimer` (HH:MM:SS):** siempre `Date.now() − startedAt`, nunca sumando segundos. Se recalcula también al volver a la pestaña (`visibilitychange`).
- **Cada serie:**
  - Peso **pre-rellenado** con el último usado o, si no hay, con el objetivo.
  - Reps **vacías**, con el rango como placeholder ("6-8").
  - ✓ sin reps → "Escribe las reps hechas" y el foco salta al campo de reps.
- **"+ Serie extra"** por ejercicio: copia el tipo y el objetivo de la última serie, no modifica la plantilla y solo se puede quitar la última extra, si no está marcada.
- **Terminar:**
  - Si hay series con reps escritas pero sin marcar, se pregunta: guardarlas también, guardar solo las marcadas o volver.
  - Se valida con `sessionInputSchema`, se borra el borrador y se va al resumen.
- **Cancelar** (con confirmación) borra el borrador y vuelve a la rutina.
- **Resumen** (`/sessions/:id`, `SessionSummaryPage`):
  - Cifras clave (duración, peso movido, series y reps) con su diferencia respecto a la sesión anterior de la misma tabla.
  - **Comparativa por ejercicio**: mejor serie hoy frente a la anterior, e1RM y Δ, más la insignia **Récord** (con icono y texto) si supera el mejor e1RM de todo el historial anterior. Igualarlo no cuenta.
  - Todas las series y las notas.
  - En el historial, cada sesión tiene un botón "Ver resumen".
- **Refactor:** `bestSet()` en `stats.ts` (compartido por el historial y el resumen), `SessionSetsList` reutilizable, `signedDelta`/`formatClock` en `utils/format.ts` y `formatDuration` en segundos.

### Verificación

| Prueba | Resultado |
|--------|-----------|
| `npm run check` y `npm audit` | ✅ / 0 vulnerabilidades |
| Migración v3 sobre **copias** (la DB real y una DB v2 con 4 sesiones) | ✅ minutos → segundos correctos, `started_at` NULL en las antiguas, integridad OK |
| API v3 (base de datos temporal) | ✅ 12/12 |
| Flujos de interfaz con Edge vía CDP | ✅ 15/15 |
| Capturas revisadas | Entrenamiento y resumen, en escritorio y móvil |
| **Base de datos real** | Hash idéntico de `.sqlite`, `-wal` y `-shm` antes y después ✅. No se ha migrado: la v3 se aplicará al arrancar la API |

**Qué cubre la prueba de la API:**
- Duración calculada (3700 s).
- Serie extra aceptada.
- Detalle con nombres.
- Rechazos: orden de fechas, más de 10 h, fecha futura, sin reps, `setNumber` 31 y una duración enviada por el cliente.

**Qué cubren los flujos de interfaz:**
- Borrador guardado al entrar.
- Peso pre-rellenado y reps vacías.
- Cronómetro HH:MM:SS.
- ✓ bloqueado sin reps (con foco en el campo).
- Al recargar se mantienen el inicio y las series.
- El aviso aparece en otras páginas y permite reanudar.
- Pantalla de conflicto con otra tabla.
- Serie extra.
- Diálogo de series sin marcar → resumen con récord, serie extra guardada y la no marcada descartada.
- Borrador limpio al terminar.
- Cancelar.

**Incidencias del test (no eran fallos de la app):**
1. Se buscaba "70 kg × 10" en toda la página, pero aparece correctamente en la columna "Anterior". La comprobación se limitó a la sección de series.
2. Una segunda ejecución igualaba la marca anterior, y **igualar no es récord**. El test ahora escribe las reps anteriores + 1.