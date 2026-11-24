1. Descripción del Proyecto

Aplicación web full-stack sencilla, rápida y escalable para la creación, gestión y visualización de rutinas de entrenamiento en el gimnasio.

Objetivo actual: Construir un MVP (Producto Mínimo Viable) funcional en entorno local, manteniendo el equipo anfitrión ligero (sin motores de bases de datos pesados ni contenedores Docker por el momento), pero con una arquitectura limpia preparada para escalar en el futuro.

2. Stack Tecnológico

Frontend

Framework: React 18+ (inicializado con Vite para máxima velocidad y ligereza).

Lenguaje: TypeScript (estricto) para garantizar la integridad de los datos.

Estilos: Tailwind CSS (para desarrollo ágil, limpio y responsivo).

Gestión de estado y peticiones: React Query (TanStack Query) o Fetch API encapsulado en servicios.

Enrutamiento: React Router DOM.

Iconografía: Lucide React.

Backend

Entorno de ejecución: Node.js (versión LTS).

Framework: Express.js (o Fastify) con TypeScript.

Base de Datos (Ligera / Cero configuración): SQLite (usando better-sqlite3 o Prisma ORM con proveedor SQLite). Justificación: Es un único archivo local dentro del proyecto, no requiere instalar servicios en el sistema operativo y permite usar SQL estándar.

Validación de datos: Zod (tanto para variables de entorno como para los payloads de las peticiones HTTP).

3. Arquitectura y Estructura de Carpetas

El proyecto debe estructurarse como un Monorepo sencillo con dos carpetas principales en la raíz (/client y /server) para mantener una clara separación de responsabilidades:

gym-routine-app/
├── client/                     # Aplicación Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Componentes UI reutilizables (Botones, Modales, Cards)
│   │   ├── features/           # Lógica agrupada por dominio (ej. /routines, /exercises)
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # Clientes HTTP (comunicación con la API)
│   │   ├── types/              # Interfaces y tipos compartidos
│   │   ├── utils/              # Funciones auxiliares puras
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # API REST Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Configuración y validación de variables de entorno
│   │   ├── controllers/        # Manejo de peticiones/respuestas HTTP (sin lógica de negocio)
│   │   ├── middlewares/        # Manejo global de errores, validación, seguridad
│   │   ├── repositories/       # Capa de acceso a datos (Patrón Repositorio)
│   │   ├── routes/             # Definición de endpoints
│   │   ├── schemas/            # Esquemas de validación con Zod
│   │   ├── services/           # Lógica de negocio pura
│   │   ├── types/              # Tipos e interfaces de TypeScript
│   │   ├── app.ts              # Configuración de Express
│   │   └── server.ts           # Punto de entrada del servidor
│   ├── database/               # Archivo SQLite local (ignorado en git)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                  # Ignorar node_modules, .env, y archivos .sqlite
└── PROJECT_SPEC.md             # Este archivo de especificaciones


4. Modelo de Datos Inicial (MVP)

El sistema debe soportar inicialmente las siguientes entidades y relaciones:

Routine (Rutina):

id: UUID / String (Primary Key)

name: String (ej. "Torso / Pierna - Día 1")

description: String (Opcional)

createdAt: DateTime

updatedAt: DateTime

Exercise (Ejercicio dentro de una rutina):

id: UUID / String (Primary Key)

routineId: String (Foreign Key -> Routine)

name: String (ej. "Press de Banca con Barra")

sets: Number (Series, ej. 4)

reps: String (Repeticiones, ej. "8-10" o "12")

weight: Number (Peso en kg, opcional, ej. 60.5)

restSeconds: Number (Descanso en segundos, opcional, ej. 90)

notes: String (Opcional)

order: Number (Para mantener el orden de los ejercicios en la rutina)

5. Reglas Estrictas de Desarrollo (Buenas Prácticas)

Claude debe adherirse obligatoriamente a los siguientes principios al generar código:

A. Código Limpio y Mantenibilidad (Clean Code & SOLID)

Separación de Responsabilidades (SoC): Los controladores en el backend nunca deben contener consultas a la base de datos ni lógica de negocio compleja. Flujo estricto: Route -> Controller -> Service -> Repository.

Desacoplamiento de Base de Datos (Repository Pattern): Toda interacción con SQLite debe estar encapsulada en /repositories implementando interfaces de TypeScript. Si en el futuro cambiamos SQLite por PostgreSQL, solo debería modificarse esta capa.

Principio DRY y Componentes Pequeños: Ningún componente de React o función debe superar las 150 líneas. Si crece demasiado, dividir en subcomponentes o funciones más pequeñas con nombres descriptivos.

Tipado Estricto: Prohibido el uso de any en TypeScript. Todo dato que entre o salga de una función debe estar tipado.

B. Integridad de Datos

Validación en Frontera: Ningún dato externo es confiable. Todas las peticiones POST y PUT en el backend deben ser validadas mediante Zod antes de llegar al controlador.

Transacciones: Al crear o eliminar una rutina con múltiples ejercicios, usar transacciones de base de datos para evitar datos huérfanos o estados inconsistentes.

Manejo Centralizado de Errores: Implementar un middleware global de errores en Express que devuelva respuestas JSON estandarizadas (ej. { success: false, error: { code, message } }) sin filtrar trazas de error internas (stack traces) en producción.

C. Seguridad (Security by Design)

Cabeceras HTTP Seguras: Implementar helmet en Express desde el inicio.

CORS Restrictivo: Configurar cors para aceptar peticiones únicamente desde la URL exacta del frontend en desarrollo (ej. http://localhost:5173).

Prevención de Inyección: Usar consultas parametrizadas o un ORM/Query Builder seguro (nunca concatenar strings para formar consultas SQL).

Gestión de Secretos: Nunca hardcodear puertos, rutas de base de datos o claves. Usar archivos .env y proveer .env.example. Asegurar que .env y la carpeta /database/*.sqlite estén en el .gitignore.

Sanitización: Limitar el tamaño máximo del payload JSON en Express (express.json({ limit: '10kb' })) para prevenir ataques básicos de denegación de servicio.

D. Documentación Continua

Registro de Acciones: Cada acción realizada en el proyecto debe documentarse en el archivo PROJECT_DOC.md, ubicado en el directorio raíz. La documentación debe ser clara, resumida y legible, de forma que pueda consultarla tanto el desarrollador como el asistente (Claude) para conocer el estado del proyecto, las decisiones tomadas y su motivo.

6. Instrucciones de Ejecución para el Asistente (Claude)

Por favor, ejecuta la creación de este proyecto paso a paso, solicitando confirmación o verificando cada fase antes de avanzar a la siguiente:

Fase 1 (Inicialización): Crea la estructura de directorios raíz, el archivo .gitignore adecuado e inicializa los proyectos client (Vite + React + TS + Tailwind) y server (Node + Express + TS) instalando únicamente las dependencias necesarias.

Fase 2 (Base de Datos y Backend Core): Configura SQLite, crea las interfaces de repositorio, los esquemas de validación con Zod, los servicios, controladores y rutas CRUD para Routines y Exercises, aplicando los middlewares de seguridad (helmet, cors, manejo de errores).

Fase 3 (Frontend Core): Configura la capa de servicios API en React, los tipos compartidos y construye las vistas principales: listado de rutinas, vista detallada de rutina y formulario de creación/edición de rutinas y ejercicios con diseño limpio y responsivo.

Fase 4 (Verificación): Proporciona los comandos exactos para levantar ambos entornos en paralelo y realiza una revisión final de seguridad y limpieza del código generado.

7. Actualizacion de App para nuevas funcionalidades

---

## 🔄 Refactorización Mayor: Jerarquía Avanzada e Historial de Progresión

### 1. Nuevo Modelo de Dominio (Jerarquía de 4 Niveles)
Se abandona la estructura plana (`Rutina -> Ejercicios`) y se migra a una jerarquía relacional estricta de **Plantillas vs. Sesiones Registradas**:

1. **Rutina (`Routine`)**: Contenedor principal o mesociclo (ej. *"Torso-Pierna 4 días"*).
2. **Tabla / Día de Entrenamiento (`WorkoutDay`)**: Pertenece a una `Routine`. Una rutina puede tener N tablas independientes (ej. *"Torso A"*, *"Pierna A"*, *"Torso B"*).
3. **Ejercicio en Tabla (`DayExercise`)**: Pertenece a un `WorkoutDay`. Contiene el nombre del ejercicio, orden y notas técnicas.
4. **Serie Planificada (`PlannedSet`)**: Pertenece a un `DayExercise`. Cada serie es una entidad independiente con:
   - `set_number` (int): Orden de la serie (1, 2, 3...).
   - `set_type` (enum): `'warmup'` (aproximación), `'topset'` (serie efectiva pesada), `'backoff'` (serie de descarga), `'restpause'`, `'dropset'`, `'normal'`.
   - `target_rep_min` (int) y `target_rep_max` (int): Rango de repeticiones objetivo (ej. `6` a `8` reps).
   - `target_weight` (float, nullable): Peso objetivo o de referencia en kg.
   - `target_rir` (int, nullable): Opcional, repeticiones en recámara.

### 2. Modelo de Historial y Progresión (Logs)
Para comparar el rendimiento sin sobrescribir la plantilla base:
- **Sesión Ejecutada (`WorkoutSessionLog`)**: Vinculada a un `workout_day_id`, con fecha (`completed_at`) y duración/notas.
- **Serie Realizada (`LoggedSet`)**: Vinculada a `WorkoutSessionLog` y al ejercicio correspondiente. Guarda `set_number`, `set_type`, `actual_weight`, `actual_reps` y si se completó.

---

### 📋 Plan de Ejecución por Fases (Para Claude)

#### Fase 2: Migración de Base de Datos y Refactorización del Backend
- **Objetivo**: Actualizar el esquema de persistencia (SQLite/JSON) y los repositorios manteniendo la separación limpia (`Controller -> Service -> Repository`).
- **Tareas**:
  1. Rediseñar las tablas/entidades para soportar `Routine -> WorkoutDay -> DayExercise -> PlannedSet`.
  2. Crear las tablas de historial `WorkoutSessionLog` y `LoggedSet`.
  3. Actualizar los validadores (ej. Zod/Joi) en el backend para validar rangos (`target_rep_min <= target_rep_max`) y tipos de serie permitidos.
  4. Exponer endpoints REST limpios:
     - CRUD de Rutinas y sus Tablas (`GET/POST /api/routines/:id/days`).
     - CRUD de Ejercicios y sus Series independientes (`POST /api/days/:dayId/exercises` con array de `sets`).
     - Endpoints de historial: `POST /api/sessions` (guardar entrenamiento) y `GET /api/days/:dayId/history` (obtener sesiones pasadas de esa tabla específica).

#### Fase 3: Constructor de Tablas y Series Independientes (Frontend)
- **Objetivo**: Permitir configurar rutinas complejas con gran agilidad visual.
- **Tareas**:
  1. **Vista Detalle de Rutina**: Mostrar pestañas o tarjetas por cada **Tabla** (ej. *Torso*, *Pierna*) con botón para añadir/renombrar/eliminar tablas dentro de la rutina.
  2. **Editor de Ejercicio por Serie**: Al añadir o editar un ejercicio dentro de una tabla, permitir añadir/quitar filas individuales para cada serie (`+ Añadir serie`).
  3. Cada fila de serie debe permitir seleccionar:
     - Etiqueta visual / selector de **Tipo de Serie** (`Top Set`, `Back-off`, `Rest-Pause`, `Aproximación`, `Normal`) con códigos de color sutiles.
     - Inputs numéricos compactos para **Peso (kg)**, **Reps Mín** y **Reps Máx**.
  4. Permitir duplicar rápidamente la configuración de una serie anterior para agilizar la creación.

#### Fase 4: Modo Entrenamiento Activo y Comparativa de Progresión
- **Objetivo**: Ejecutar una tabla en el gimnasio viendo qué se hizo la última vez y guardando el progreso.
- **Tareas**:
  1. **Vista "Iniciar Tabla"**: Carga la estructura de `DayExercise` y `PlannedSet` de esa tabla en un formulario de entrenamiento activo.
  2. **Columna "Anterior" (Ghost Data)**: Consultar automáticamente la última `WorkoutSessionLog` de esa misma tabla y mostrar junto a cada serie lo que se levantó en la sesión previa (ej. *"Anterior: 100kg x 7 [Top Set]"*).
  3. **Autocompletado y Guardado**: Permitir marcar cada serie con un check al completarla, ajustar peso/reps reales y guardar la sesión completa en el historial.
  4. **Vista de Historial por Tabla / Ejercicio**: Mostrar una comparativa cronológica (tabla o gráfico simple) de sesiones pasadas de esa misma tabla para visualizar la sobrecarga progresiva (peso movido, repeticiones totales y e1RM estimado).

  8. Actualizacion v3

  ### 1. Corrección de Lógica: Planificación vs. Ejecución Real
Actualmente la interfaz solo muestra los objetivos de la plantilla (`target_rep_min`, `target_rep_max`, `target_weight`). Se debe separar estrictamente la **Vista de Edición de Tabla** (plantilla) de la **Vista de Entrenamiento Activo** (ejecución):

- **En la Plantilla (`PlannedSet`)**: Se mantienen `target_weight`, `target_rep_min` y `target_rep_max` como guía/objetivo.
- **En el Entrenamiento Activo (`LoggedSet`)**: Cada fila de serie debe tener sus propios inputs editables para registrar lo que realmente ha ocurrido en el gimnasio:
  - `actual_weight` (float): Peso real levantado (pre-rellenado por defecto con `target_weight` o el último peso usado para agilizar).
  - `actual_reps` (int): **Repeticiones reales completadas** (campo vacío o placeholder con el rango objetivo ej. `"6-8"`, obligatorio antes de marcar la serie como completada).
  - `completed` (boolean): Checkbox de serie terminada.

### 2. Ciclo de Vida de la Sesión y Cronómetro
El entrenamiento tendrá un estado activo controlado por el usuario:

1. **Iniciar Entrenamiento (`Iniciar Tabla`)**:
   - Entra en la ruta/vista `/workout/active/:dayId`.
   - Guarda el timestamp exacto de inicio (`started_at = Date.now()`) en el estado y en `localStorage` (para que si el usuario recarga la página o bloquea el móvil, el cronómetro no se reinicie ni pierda los datos apuntados).
   - Muestra una **barra superior fija (sticky header)** con:
     - Nombre de la tabla activa.
     - **Cronómetro en tiempo real (`HH:MM:SS`)**: Calculado mediante diferencia de timestamps (`Date.now() - started_at`) cada segundo, evitando desfases cuando la pestaña está en segundo plano.
     - Botón para **Cancelar/Descartar** sesión (con confirmación).
     - Botón destacado para **Terminar Entrenamiento**.

2. **Durante el Entrenamiento**:
   - El usuario visualiza el objetivo de cada serie (ej. `Top Set · Obj: 100kg × 6-8 reps`) y la referencia de la sesión anterior si existe.
   - Rellena **Peso Real** y **Reps Reales** en cada serie y marca el check de completado.
   - *(Opcional pero recomendado)*: Permitir añadir una serie extra "al vuelo" durante el entrenamiento si el usuario decide hacer una serie más ese día, sin modificar necesariamente la plantilla base.

3. **Terminar Entrenamiento**:
   - Al pulsar **Terminar Entrenamiento**, se detiene el reloj y se calcula `duration_seconds = Math.floor((Date.now() - started_at) / 1000)`.
   - Se valida que haya al menos una serie marcada como completada (o se pregunta si se desean guardar solo las series completadas).
   - Se envía el payload completo a `POST /api/sessions` con:
     - `workout_day_id`
     - `started_at` y `completed_at`
     - `duration_seconds`
     - `notes` (campo opcional para sensaciones generales del entreno)
     - `sets`: Array con las series realizadas (`exercise_id`, `set_number`, `set_type`, `actual_weight`, `actual_reps`).
   - Se limpia el borrador de `localStorage` y redirige a un **Resumen Post-Entrenamiento** (mostrando duración total, volumen total levantado en kg y comparativa de mejora respecto a la última sesión).

### 3. Tareas Técnicas para Claude (Backend + Frontend)
- **Backend**:
  - Verificar que el modelo/tabla `WorkoutSessionLog` incluya `started_at` (DATETIME), `completed_at` (DATETIME) y `duration_seconds` (INTEGER).
  - Asegurar que `GET /api/days/:dayId/history` devuelva también la duración de cada sesión pasada formateada o en segundos.
- **Frontend**:
  - Crear componente `ActiveWorkoutTimer` basado en `started_at` (nunca con `setInterval` sumando `+1` a ciegas, para evitar congelamientos en móvil).
  - Implementar persistencia temporal en `localStorage` (`active_workout_draft`) para tolerancia a fallos/recargas accidentales en el gimnasio.



---

## 📚 Fase 6: Catálogo de Ejercicios y Autocompletado Inteligente

### 1. Estrategia de Datos (Híbrida: Catálogo Base + Ejercicios Personalizados)
Para evitar latencia en el gimnasio y dependencia de servicios externos caídos, se implementará una tabla local `ExerciseCatalog` poblada inicialmente con un catálogo curado en español (~120 ejercicios principales de gimnasio), permitiendo además que el usuario cree sus propios ejercicios personalizados (`is_custom = true`).

- **Modelo `ExerciseCatalog`**:
  - `id` (PK)
  - `name` (string, único, indexado): Ej. *"Press de Banca con Barra"*, *"Sentadilla Libre"*, *"Jalón al Pecho"*.
  - `muscle_group` (enum/string): `'Pecho'`, `'Espalda'`, `'Pierna'`, `'Hombro'`, `'Bíceps'`, `'Tríceps'`, `'Core'`, `'Cardio'`.
  - `equipment` (string, nullable): `'Barra'`, `'Mancuernas'`, `'Polea'`, `'Máquina'`, `'Peso Corporal'`.
  - `is_custom` (boolean, default `false`).

### 2. Tareas Técnicas para Claude
- **Backend**:
  1. Crear la entidad/tabla `ExerciseCatalog` y vincular opcionalmente `DayExercise` mediante `catalog_exercise_id` (manteniendo compatibilidad con ejercicios existentes).
  2. Crear un script de inicialización (`seedExercises.ts/js`) idempotente que cargue automáticamente una lista completa y bien categorizada de ~120 ejercicios reales de musculación en español si la tabla está vacía.
  3. Crear endpoints:
     - `GET /api/exercises/catalog?q=...&muscle=...`: Búsqueda rápida insensible a mayúsculas/acentos.
     - `POST /api/exercises/catalog`: Permitir guardar un ejercicio nuevo creado por el usuario en el catálogo para futuras rutinas.
- **Frontend**:
  1. Sustituir el input de texto simple al añadir un ejercicio a una tabla por un **Combobox / Autocompletado con filtro por grupo muscular**.
  2. Al escribir (ej. *"press"*), mostrar sugerencias agrupadas con etiqueta de grupo muscular y equipamiento.
  3. Si el ejercicio escrito no existe en el catálogo, mostrar la opción rápida: *`+ Crear y añadir "[Nombre escrito]"`* para guardarlo al instante sin bloquear al usuario.

  ---

10. Actualizacion v5

## 🎨 Fase 7: Refinamiento UI/UX, Renombrado y Compactación Visual

### 1. Eliminación del 1RM Estimado (e1RM)
- **Objetivo**: Simplificar las métricas de progresión centrándose únicamente en datos reales ejecutados (peso levantado, repeticiones realizadas y volumen total).
- **Tareas**:
  1. Eliminar cualquier cálculo, columna, badge, tarjeta o gráfica de **1RM / e1RM** en la vista de entrenamiento activo, en el resumen post-entrenamiento y en la vista de historial de sesiones.
  2. Mantener intactas las métricas reales: historial de sesiones pasadas, comparativa serie a serie (*Anterior*), peso máximo movido y repeticiones totales.

### 2. Renombrado de Acción Principal
- **Objetivo**: Unificar la terminología de la interfaz para que sea más natural.
- **Tareas**:
  1. Cambiar el texto del botón `"Iniciar Tabla"` (y cualquier referencia equivalente en cabeceras o tooltips) por **`"Empezar Entrenamiento"`** manteniendo exactamente la misma ruta y lógica de inicio de sesión activa.

### 3. Compactación Vertical de la Vista de Ejercicios en Tabla
- **Objetivo**: Reducir el desplazamiento vertical (*scroll*) para visualizar más ejercicios y series de un solo vistazo, tanto en la vista de edición/detalle de la tabla como durante el entrenamiento activo, **sin eliminar ninguna funcionalidad**.
- **Reglas de Diseño Compacto**:
  1. **Cabecera del Ejercicio en una sola línea (`flex-row justify-between items-center`)**:
     - Nombre del ejercicio + badge discreto de grupo muscular a la izquierda.
     - Menú de acciones (`...` o iconos compactos para editar, reordenar, añadir serie o eliminar) a la derecha, eliminando barras de herramientas secundarias que ocupen altura extra.
     - Si el ejercicio tiene notas técnicas, mostrarlas colapsadas bajo un icono/botón compacto de nota (expandible al hacer clic) en lugar de un bloque de texto abierto permanentemente.
  2. **Tabla/Filas de Series de Alta Densidad**:
     - Reducir padding vertical de las filas de series (`py-1.5` o `py-2` máximo) y altura de los inputs (`h-8` / `32px`), manteniendo buen área táctil horizontal.
     - Usar una **cabecera de columnas única** por ejercicio (`Serie | Tipo | Anterior | Peso (kg) | Reps | ✓`) en lugar de repetir etiquetas (*labels*) encima de cada input en cada fila.
     - Sustituir selectores largos de tipo de serie por **badges/selectores compactos** con abreviaturas claras y tooltip (ej. `TOP`, `BACK`, `RP`, `WARM`, `NORM`).
  3. **Botón `+ Añadir serie` integrado**:
     - Colocarlo como una fila sutil de baja altura en el pie de la tabla de series del ejercicio, evitando botones grandes con márgenes amplios entre tarjetas.

11. Empezando en docker

---

## 🐳 Fase 8: Contenerización con Docker y Docker Compose

### 1. Arquitectura de Contenedores (Ligera y Persistente)
Empaquetar el frontend y el backend usando imágenes base ligeras (`alpine`) y volúmenes persistentes para no perder los datos de la base de datos local al reiniciar o reconstruir contenedores.

- **Servicio `backend`**:
  - Imagen base `node:20-alpine`.
  - Expone el puerto interno de la API (ej. `3000` o `3001`).
  - **Persistencia crítica**: Montar un volumen Docker (`./backend/data:/app/data` o volumen nombrado) apuntando al directorio donde reside el archivo de base de datos SQLite/JSON para garantizar que las rutinas y sesiones registradas nunca se borren al recrear el contenedor.
- **Servicio `frontend`**:
  - Build multi-etapa (*multi-stage build*): compila React con Vite en una etapa de Node y sirve los archivos estáticos resultantes con **`nginx:alpine`** (consumo mínimo de RAM, ~10-15 MB).
  - Configura `nginx.conf` con proxy inverso (`/api` -> `http://backend:3000`) para evitar problemas de CORS y soporte para rutas SPA (`try_files $uri /index.html`).

### 2. Archivos a Generar por Claude
1. `backend/Dockerfile` y `backend/.dockerignore` (excluyendo `node_modules`, `.env`, etc.).
2. `frontend/Dockerfile`, `frontend/nginx.conf` y `frontend/.dockerignore`.
3. `docker-compose.yml` en la raíz del proyecto que levante ambos servicios en una red interna compartida.
4. Actualizar `README.md` con los comandos básicos: `docker compose up -d --build` y `docker compose down`.

12. Nueva funcionalidad: loggin

---

## 🔐 Fase 9: Autenticación Segura, Multi-usuario y Protección de Rutas

### 1. Arquitectura de Seguridad
Para preparar la aplicación antes de exponerla fuera de la red local, cada rutina, tabla, ejercicio personalizado e historial pertenecerá exclusivamente al usuario autenticado.

- **Almacenamiento de Contraseñas**: Nunca guardar contraseñas en texto plano. Hashear con **`bcrypt`** (mínimo 10-12 *salt rounds*).
- **Gestión de Sesión (`JWT`)**:
  - Generar un token JWT firmado con una clave secreta fuerte definida en `.env` (`JWT_SECRET`, mínimo 32 caracteres aleatorios).
  - Expiración recomendada: `7d` (cómodo para uso personal en el gimnasio sin tener que loguearse cada día).
  - Incluir `userId` en el payload del token; **nunca** confiar en un `userId` enviado en el cuerpo (`body`) de la petición por el cliente.
- **Protección contra Fuerza Bruta y Abusos**:
  - Añadir limitación de peticiones (*rate limiting* con `express-rate-limit`) en los endpoints `/api/auth/login` y `/api/auth/register` (ej. máx. 10 intentos cada 15 minutos por IP).
  - Mensajes de error genéricos en login (`"Credenciales inválidas"`) para no revelar si un email existe o no en el sistema.

### 2. Cambios en el Modelo de Datos (Migración Segura)
1. **Nueva tabla/entidad `User`**:
   - `id` (PK)
   - `email` (string, único, indexado, normalizado en minúsculas)
   - `password_hash` (string)
   - `name` (string)
   - `created_at` (DATETIME)
2. **Aislamiento de Propiedad (`user_id`)**:
   - Añadir clave foránea `user_id` en `Routine`, `WorkoutSessionLog` y en `ExerciseCatalog` (cuando `is_custom = true`).
   - **Migración de datos existentes**: Si ya existen rutinas creadas antes de activar el login, asignarlas automáticamente al primer usuario que se registre (o crear un usuario inicial por defecto) para no dejar datos huérfanos.

### 3. Tareas Técnicas para Claude

#### Backend (Node.js / Express)
1. **Dependencias**: Instalar `bcrypt` (o `bcryptjs` para evitar problemas de compilación nativa en contenedores `node:alpine`), `jsonwebtoken` y `express-rate-limit`.
2. **Endpoints Públicos (`/api/auth`)**:
   - `POST /api/auth/register`: Valida formato de email y contraseña segura (mínimo 8 caracteres), crea usuario con `password_hash` y devuelve `{ token, user }`. *(Opcional: añadir variable de entorno `ALLOW_REGISTRATION=true/false` para poder cerrar registros públicos una vez creada tu cuenta personal).*
   - `POST /api/auth/login`: Verifica hash con `bcrypt.compare` y devuelve `{ token, user }`.
   - `GET /api/auth/me` (protegido): Verifica el token actual y devuelve los datos básicos del usuario.
3. **Middleware `authenticateToken`**:
   - Extraer `Authorization: Bearer <token>`, verificar firma y adjuntar `req.user = { id: decoded.userId }`.
   - Proteger **todas** las rutas de `/api/routines`, `/api/days`, `/api/sessions` y `/api/exercises`.
4. **Filtrado estricto en Repositorios/Servicios**:
   - Asegurar que `GET /api/routines` solo devuelva las rutinas donde `user_id === req.user.id`.
   - Verificar propiedad antes de editar, borrar o registrar sesiones sobre cualquier `routineId` o `dayId` (devolver `403 Forbidden` o `404 Not Found` si pertenece a otro usuario).

#### Frontend (React)
1. **Estado Global de Autenticación (`AuthContext`)**:
   - Gestionar `user`, `token`, `isAuthenticated`, `login()`, `register()` y `logout()`.
   - Persistir el token de forma segura y validar sesión al arrancar la app mediante `/api/auth/me`.
2. **Interceptor HTTP**:
   - Inyectar automáticamente la cabecera `Authorization: Bearer <token>` en todas las llamadas a la API.
   - Si el backend responde `401 Unauthorized` (token expirado o inválido), cerrar sesión automáticamente y redirigir a `/login`.
3. **Vistas y Protección de Rutas**:
   - Crear pantallas limpias y minimalistas de **Iniciar Sesión (`/login`)** y **Registro (`/register`)**.
   - Envolver las rutas privadas de la aplicación en un componente `<ProtectedRoute>` para impedir el acceso sin sesión activa.
   - Añadir botón discreto de **Cerrar Sesión** en la cabecera o menú de usuario.

#### Docker & Variables de Entorno
- Actualizar `.env.example` y `docker-compose.yml` añadiendo `JWT_SECRET` y `ALLOW_REGISTRATION=true` en el servicio `backend`.


---

13. Deploy en railway

## 🚀 Fase 10: Preparación para Despliegue en Producción (Railway + Docker Unificado)

### 1. Objetivo de Arquitectura en Producción
Unificar el **frontend (React)** y el **backend (Node.js/Express)** en un único servicio y un único contenedor Docker en la raíz del proyecto para desplegarlo en **Railway**, evitando costes duplicados, problemas de CORS y garantizando la persistencia de la base de datos SQLite en un volumen externo.

### 2. Requisitos Técnicos Obligatorios

#### A. Adaptación del Backend (Node.js / Express)
1. **Puerto Dinámico**: El servidor debe escuchar obligatoriamente en `process.env.PORT || 3000` y en la interfaz `0.0.0.0` (requerido por Railway para enrutar el tráfico público).
2. **Ruta Persistente de Base de Datos**:
   - Leer la ruta del archivo SQLite desde la variable de entorno `DATABASE_PATH` (con fallback local `./data/database.sqlite`).
   - Asegurar por código (`fs.mkdirSync(path.dirname(dbPath), { recursive: true })`) que la carpeta padre se cree automáticamente si aún no existe al montar un volumen vacío.
3. **Servir el Frontend Estático en Producción**:
   - Cuando `NODE_ENV === 'production'`, Express debe servir los archivos compilados de React (`express.static` apuntando a la carpeta `public` o `dist` generada).
   - **Fallback para React Router (SPA)**: Cualquier ruta `GET` que **no** empiece por `/api` debe devolver `index.html` para que la navegación interna del frontend no dé error `404` al recargar la página.
4. **Seguridad y Registro**:
   - Validar que `JWT_SECRET` esté configurado en producción (lanzar error claro si falta en `NODE_ENV === 'production'`).
   - Soportar `ALLOW_REGISTRATION` (`'true'` / `'false'`) para permitir bloquear nuevos registros una vez creada la cuenta personal en la nube.

#### B. Ajuste del Frontend (React / Vite)
1. **URLs Relativas de API**: Asegurar que en producción las llamadas al backend usen rutas relativas (`/api/...`) en lugar de `http://localhost:3000`, para que funcionen bajo cualquier dominio asignado por Railway sin configurar CORS.

#### C. Dockerfile Multi-Etapa en la Raíz (`/Dockerfile`)
Crear un `Dockerfile` limpio en la raíz del proyecto (manteniendo el `docker-compose.yml` anterior solo si se desea para desarrollo local) con 3 etapas:
1. **Etapa 1 (`frontend-builder`)**: Imagen `node:20-alpine`, instala dependencias del frontend y ejecuta `npm run build`.
2. **Etapa 2 (`backend-builder`)**: Imagen `node:20-alpine`, instala dependencias del backend (compilando módulos si los hubiera y limpiando `devDependencies` para producción).
3. **Etapa 3 (`production`)**: Imagen final ligera `node:20-alpine` que copia:
   - El backend compilado/listo para producción.
   - El build estático del frontend dentro de la carpeta que servirá Express (ej. `/app/public`).
   - Define `ENV NODE_ENV=production` y arranca el servidor con `node ...` (evitando `npm start` para gestionar correctamente señales de apagado `SIGTERM` en Railway).

#### D. Higiene del Repositorio antes de GitHub (`.gitignore` y `.dockerignore`)
1. Revisar y actualizar `.gitignore` en la raíz para garantizar que **NUNCA** se suban a GitHub:
   - Archivos `.env` y `.env.local` (mantener solo `.env.example` con valores ficticios).
   - Archivos de base de datos locales (`*.sqlite`, `*.sqlite3`, `*.db`, carpeta `data/`).
   - `node_modules/`, `dist/`, `build/`.
2. Crear `.dockerignore` en la raíz excluyendo `node_modules`, `.git`, `.env`, `*.sqlite` y `dist` para acelerar la subida y construcción de la imagen en Railway.

### 3. Verificación Final antes del Push
- Comprobar que la imagen se construye sin errores localmente ejecutando `docker build -t gym-app-prod .`.
- Entregar un breve resumen con las variables de entorno exactas que debo pegar en el panel de **Railway** (`PORT`, `NODE_ENV`, `DATABASE_PATH`, `JWT_SECRET`, `ALLOW_REGISTRATION`) y la ruta del volumen (`/app/data`).

---

## ✨ Fase 11: Rebranding a AuraWorkout y Refinamiento del Dashboard de Rutinas

### 1. Rebranding General (`AuraWorkout`)
- **Objetivo**: Actualizar la identidad visual y textual de la aplicación de `"Gym Routines"` a **`"AuraWorkout"`**.
- **Tareas**:
  1. Cambiar el título principal en la barra de navegación (`Navbar` / `Header`) y en las pantallas de `Login` / `Register` por **`AuraWorkout`**.
  2. Actualizar el `<title>` del documento HTML (`frontend/index.html`) a `AuraWorkout` y revisar cualquier metadato, `manifest.json` (si existe) o texto de bienvenida que aún mencione `"Gym Routines"`.

### 2. Rediseño Condicional del Listado de Rutinas (`Empty State` vs. `Grid de Rutinas`)
- **Objetivo**: Eliminar botones redundantes y mejorar la estética y claridad visual tanto cuando el usuario es nuevo como cuando ya tiene rutinas creadas.
- **Tareas**:
  1. **Eliminar el botón superior `"Nueva Rutina"`**:
     - Quitar por completo el botón `"Nueva Rutina"` de la cabecera de la sección en todos los estados (tanto con 0 rutinas como con rutinas ya creadas).
  2. **Estado Vacío (`routines.length === 0`)**:
     - **Ocultar el título** de la sección (`My Workouts` no debe renderizarse cuando no hay rutinas).
     - Mantener únicamente la tarjeta/estado vacío centralizado con un único botón claro para crear la primera rutina, evitando cualquier duplicidad de acciones.
  3. **Estado Con Rutinas (`routines.length > 0`)**:
     - Mostrar el título de la sección cambiado de `"Mis Rutinas"` a **`"My Workouts"`**.
     - Renderizar al final del grid/lista de tarjetas de rutinas (justo a continuación de la última rutina creada) una **tarjeta de acción estética (`AddWorkoutCard`)** con borde discontinuo (`border-dashed`), efecto *hover* sutil y un icono/botón centrado para **crear una nueva rutina**, manteniendo exactamente la misma altura y proporciones que las tarjetas de rutina adyacentes.