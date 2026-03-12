# Proyecto Tareas - Backend

API REST para gestionar periodos, materias, horarios y tareas. Desarrollado con Node.js, Express y PostgreSQL.

## Backend

### Herramientas y librerias (con versiones)

| Tipo | Herramienta/Libreria | Version | Uso |
| --- | --- | --- | --- |
| Runtime | Node.js | v24.13.0 | Ejecutar el servidor |
| Gestor de paquetes | npm | 11.6.2 | Instalar dependencias y ejecutar scripts |
| Base de datos | PostgreSQL (psql) | 18.1 | Motor de base de datos (conector via `pg`) |
| Framework web | express | 5.2.1 | Ruteo, middleware y servidor HTTP |
| Middleware | cors | 2.8.6 | Habilitar CORS |
| Configuracion | dotenv | 17.3.1 | Cargar variables de entorno desde `.env` |
| Auth | jsonwebtoken | 9.0.3 | Firmar y validar JWT |
| Seguridad | bcrypt | 6.0.0 | Hash y verificacion de contrasenas |
| DB driver | pg | 8.18.0 | Cliente PostgreSQL para Node.js |
| Dev tool | nodemon | 3.1.14 | Recarga automatica en desarrollo |
| Lockfile | package-lock.json (lockfileVersion) | 3 | Reproducibilidad de instalaciones |

> Nota: las versiones de librerias corresponden a las instaladas en `package-lock.json`.

## Requisitos

- Node.js instalado (recomendado: el de la tabla)
- npm instalado
- PostgreSQL instalado y accesible desde el backend

## Instalacion y ejecucion

```bash
npm install
npm run dev
```

El servidor inicia por defecto en `http://localhost:3000` (configurable con `PORT`).

> Windows/PowerShell: si `npm` falla por `ExecutionPolicy`, usa `npm.cmd`/`npx.cmd` o ajusta la politica de ejecucion en tu equipo.

## Variables de entorno

Archivo: `.env`

| Variable | Descripcion | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `bdtareas` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contrasena del usuario | `********` |
| `JWT_SECRET` | Secreto para firmar JWT | `cambia_esto` |

## Scripts npm

| Script | Comando | Descripcion |
| --- | --- | --- |
| `dev` | `nodemon src/app.js` | Ejecuta en modo desarrollo con recarga |

## Endpoints (base)

- `POST /api/auth`
- `GET /api/periodos`
- `GET /api/materias`
- `GET /api/horarios`
- `GET /api/tareas`

## Estructura

```text
src/
  app.js
  config/
    db.js
  controllers/
  middlewares/
  routes/
```
