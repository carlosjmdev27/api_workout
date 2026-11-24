# AuraWorkout

Aplicación web para crear rutinas de gimnasio, entrenar con ellas y seguir la progresión.

- **Rutinas → tablas (días) → ejercicios → series** con tipo (aproximación, top set, back-off…), rango de reps, peso y RIR.
- **Modo entrenamiento** con cronómetro y la columna "Anterior" (lo que hiciste la última vez).
- **Historial y resumen** de cada sesión: peso máximo, reps, volumen y récords.
- **Catálogo** de 120 ejercicios en español con búsqueda sin acentos y ejercicios propios.

**Stack:** React + Vite + TypeScript + Tailwind (`client/`), Express + TypeScript + SQLite (`server/`) y un paquete compartido de tipos y validación Zod (`shared/`), organizados como *npm workspaces*.

## Con Docker (recomendado para usarla)

Requisito: Docker con Docker Compose v2.

```bash
cp .env.example .env           # y pon en JWT_SECRET un valor aleatorio largo (ver el archivo)
docker compose up -d --build   # construir y arrancar
```

Sin `JWT_SECRET` en `.env`, Compose no arranca.

Abre **http://localhost:8080**.

```bash
docker compose down            # parar (los datos se conservan)
docker compose logs -f backend # ver los logs de la API
```

| Servicio | Imagen | Función |
|----------|--------|---------|
| `frontend` | `nginx:alpine` | Sirve la web compilada y hace de proxy de `/api` hacia el backend (mismo origen, sin CORS). Único puerto publicado. |
| `backend` | `node:22-alpine` | API REST. Solo accesible dentro de la red interna `gym-net`. Corre como usuario sin privilegios. |

**Los datos** (SQLite) viven en el volumen Docker **`gym-routines_gym-data`**, montado en `/app/server/database`. Sobreviven a `down`, a reinicios y a `up --build`. Solo se borran con `docker compose down -v`.

Para usar otro puerto: `WEB_PORT=9000 docker compose up -d` (en PowerShell: `$env:WEB_PORT=9000; docker compose up -d`).

### Copia de seguridad del volumen

```bash
docker compose stop backend
docker compose cp backend:/app/server/database/gym.sqlite ./gym-backup.sqlite
docker compose start backend
```

### Llevar a Docker una base de datos existente

Con la API de desarrollo **parada** (`Ctrl+C` en `npm run dev`; al cerrarse vuelca el WAL al archivo principal):

```bash
docker compose up -d --build            # crea el volumen si no existe
docker compose stop backend
docker compose cp server/database/gym.sqlite backend:/app/server/database/gym.sqlite
docker compose run --rm --no-deps --user root --entrypoint chown backend node:node /app/server/database/gym.sqlite
docker compose start backend
```

Si junto a `gym.sqlite` existe `gym.sqlite-wal`, cópialo también (con el mismo nombre) y añádelo al `chown`. Esto sustituye los datos que hubiera en el volumen.

## Despliegue en Railway (un solo servicio)

El `Dockerfile` de la raíz genera **una sola imagen**: Express sirve la API (`/api`) y la web compilada, desde el mismo dominio y sin CORS. Railway lo detecta solo. El healthcheck (`/api/health`) se configura en el servicio: *Settings → Deploy → Healthcheck Path*. Railway retiró `railway.toml` el 2026-12-01, así que no hay archivo de configuración en el repo.

```bash
docker build -t gym-app-prod .   # comprobar en local que la imagen se construye
```

1. **New Project → Deploy from GitHub repo** y elige este repositorio.
2. **Volumen:** en el servicio, **+ New → Volume**, con *Mount path* **`/app/data`**. Ahí vive la base de datos SQLite; sin volumen, cada despliegue la borraría.
3. **Variables** (pestaña *Variables* del servicio):

   | Variable | Valor | Notas |
   |----------|-------|-------|
   | `NODE_ENV` | `production` | Ya viene en la imagen; ponerla no hace daño. |
   | `DATABASE_PATH` | `/app/data/database.sqlite` | Debe estar **dentro** del volumen. |
   | `JWT_SECRET` | 48+ caracteres aleatorios | `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. **Distinto** del de tu equipo. Sin él, la app no arranca. |
   | `ALLOW_REGISTRATION` | `true` → `false` | `true` para crear tu cuenta; después cámbialo a `false`. |
   | `TRUST_PROXY` | `1` | Railway pone un proxy delante: hace falta para que el límite de intentos de login sea por usuario y no global. |
   | `PORT` | *(no la pongas)* | La asigna Railway; la app la lee sola (3000 si falta). |

   `CORS_ORIGIN` **no** se define en producción: web y API comparten dominio.
4. **Settings → Networking → Generate Domain** para tener la URL pública (HTTPS).
5. Abre la URL, **crea tu cuenta** (la primera de esa base de datos) y pon `ALLOW_REGISTRATION=false`.

Notas:
- La base de datos de Railway **empieza vacía**: es independiente de la local y de la de Docker.
- Con un volumen, Railway mantiene **una sola réplica** (SQLite no admite varias instancias escribiendo a la vez).
- Railway monta el volumen como `root`. `docker-entrypoint.sh` da la carpeta al usuario sin privilegios `node` y arranca `node` como proceso principal, que recibe el `SIGTERM` y cierra SQLite limpiamente en cada despliegue.

## Cuentas y privacidad

- Cada usuario solo ve sus rutinas, su historial y sus ejercicios propios. El catálogo base es común.
- Contraseñas con bcrypt y sesión con JWT (7 días). Login y registro limitados a 10 intentos cada 15 minutos por IP.
- **La primera cuenta que se registra** se queda con los datos creados antes de que existiera el login.
- Cuando ya tengas tu cuenta, cierra el registro público: `ALLOW_REGISTRATION=false` en `.env` (Docker) o en `server/.env` (desarrollo), y reinicia.
- Antes de exponer la app fuera de tu red local, sírvela con **HTTPS**. En Railway ya viene incluido con el dominio que genera.

## En desarrollo

Requisito: Node.js 22.

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edita server/.env y pon en JWT_SECRET un valor aleatorio de 32 caracteres o más
npm run dev        # shared (watch) + API en :3000 + web en :5173
npm run check      # typecheck + lint + build
```

En desarrollo la base de datos es el archivo `server/database/gym.sqlite`, independiente del volumen de Docker. Ambos entornos pueden funcionar a la vez.
