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

## Endpoints

| Endpoint | Metodo | Descripcion |
| --- | --- | --- |
| `/api/auth` | POST | Autenticacion de usuario |
| `/api/periodos` | GET | Lista periodos del usuario |
| `/api/periodos/:id` | GET | Obtiene un periodo por id |
| `/api/periodos` | POST | Crea un periodo |
| `/api/periodos/:id` | PUT | Actualiza un periodo |
| `/api/periodos/:id` | DELETE | Elimina un periodo |
| `/api/materias` | GET | Lista materias del usuario |
| `/api/materias/:id` | GET | Obtiene una materia por id |
| `/api/materias` | POST | Crea una materia |
| `/api/materias/:id` | PUT | Actualiza una materia |
| `/api/materias/:id` | DELETE | Elimina una materia |
| `/api/horarios` | GET | Lista horarios del usuario |
| `/api/horarios/:id` | GET | Obtiene un horario por id |
| `/api/horarios` | POST | Crea un horario |
| `/api/horarios/:id` | PUT | Actualiza un horario |
| `/api/horarios/:id` | DELETE | Elimina un horario |
| `/api/tareas` | GET | Lista tareas del usuario |
| `/api/tareas/:id` | GET | Obtiene una tarea por id |
| `/api/tareas` | POST | Crea una tarea |
| `/api/tareas/:id` | PUT | Actualiza una tarea |
| `/api/tareas/:id` | DELETE | Elimina una tarea |

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

---

Universidad Politecnica de Bacalar  
Creador: Pablo Alexander Mendez Pimienta  
Fecha: 12/03/2026
