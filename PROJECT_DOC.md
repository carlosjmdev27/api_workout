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
| Fase 4: Verificación | ⏳ Pendiente |

**Arrancar en local** (desde la raíz):

```bash
npm run install:all   # solo la primera vez: instala raíz + server + client
npm run dev           # API en http://localhost:3000 y web en http://localhost:5173
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
