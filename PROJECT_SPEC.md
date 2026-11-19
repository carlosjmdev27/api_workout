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