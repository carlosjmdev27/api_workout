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