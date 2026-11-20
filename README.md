# Gym Routines

Aplicación web para crear rutinas de gimnasio, entrenar con ellas y seguir la progresión.

- **Rutinas → tablas (días) → ejercicios → series** con tipo (aproximación, top set, back-off…), rango de reps, peso y RIR.
- **Modo entrenamiento** con cronómetro y la columna "Anterior" (lo que hiciste la última vez).
- **Historial y resumen** de cada sesión: peso máximo, reps, volumen y récords.
- **Catálogo** de 120 ejercicios en español con búsqueda sin acentos y ejercicios propios.

**Stack:** React + Vite + TypeScript + Tailwind (`client/`), Express + TypeScript + SQLite (`server/`) y un paquete compartido de tipos y validación Zod (`shared/`), organizados como *npm workspaces*.

## Con Docker (recomendado para usarla)

Requisito: Docker con Docker Compose v2.

```bash
docker compose up -d --build   # construir y arrancar
```

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

## En desarrollo

Requisito: Node.js 22.

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev        # shared (watch) + API en :3000 + web en :5173
npm run check      # typecheck + lint + build
```

En desarrollo la base de datos es el archivo `server/database/gym.sqlite`, independiente del volumen de Docker. Ambos entornos pueden funcionar a la vez.
