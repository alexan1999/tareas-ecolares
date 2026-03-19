# Proyecto Tareas Escolares

Aplicaci?n completa **Backend + Frontend** para gestionar periodos, materias, tareas y horarios escolares, con calendario y agenda de tareas.

## Estructura del repositorio

```text
backend/   -> API REST (Node.js + Express + PostgreSQL)
frontend/  -> UI React (Vite)
db/        -> scripts SQL y estructura
```

## Funcionalidades
- Registro e inicio de sesi?n
- CRUD de periodos, materias, tareas y horarios
- Calendario con tareas por d?a y agenda
- Filtros avanzados de tareas
- Exportaci?n a CSV
- Horario semanal con colores por materia

---

# Gu?a r?pida (para principiantes)

## 1) Backend

### Requisitos
- Node.js
- npm
- PostgreSQL

### Instalaci?n
```bash
cd backend
npm install
```

### Variables de entorno (`backend/.env`)
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bdtareas
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=cambia_esto
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### Ejecutar
```bash
npm run dev
```

Servidor en: `http://localhost:3000`

---

## 2) Frontend

### Instalaci?n
```bash
cd frontend
npm install
```

### Variables de entorno (`frontend/.env`)
```
VITE_API_URL=http://localhost:3000/api
```

### Ejecutar
```bash
npm run dev
```

Frontend en: `http://localhost:5173`

---

# Endpoints principales (Backend)

| Endpoint | M?todo | Descripci?n |
| --- | --- | --- |
| `/api/auth/register` | POST | Registro de usuario |
| `/api/auth/login` | POST | Login de usuario |
| `/api/periodos` | GET/POST | CRUD de periodos |
| `/api/materias` | GET/POST | CRUD de materias |
| `/api/horarios` | GET/POST | CRUD de horarios |
| `/api/tareas` | GET/POST | CRUD de tareas |
| `/api/tareas/:id/completar` | PATCH | Completar tarea |

---

# Postman

Colecci?n: `backend/postman/TareasEscolares.postman_collection.json`

Orden recomendado:
1. Auth -> Register
2. Auth -> Login
3. Periodos -> Crear periodo
4. Materias -> Crear materia
5. Horarios -> Crear horario
6. Tareas -> Crear tarea

---

# Nota sobre hora de entrega
La tabla `tareas` incluye el campo `hora_entrega` (TIME). Si tu BD ya exist?a:
```sql
ALTER TABLE tareas ADD COLUMN hora_entrega TIME;
```

---

Universidad Polit?cnica de Bacalar  
Creador: Pablo Alexander Mendez Pimienta  
Fecha: 12/03/2026
