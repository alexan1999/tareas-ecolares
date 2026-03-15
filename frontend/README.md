# Frontend - Proyecto Tareas

Aplicacion React (Vite) para consumir la API del backend.

## Guia paso a paso (para principiantes)

### 0) Preparar el entorno del frontend
Antes de iniciar el frontend, asegúrate de tener el proyecto listo y las dependencias instaladas.

### 0.1) Si no existe la carpeta frontend (crear proyecto desde cero)
Solo realiza este paso si la carpeta `frontend` **no existe**.

1. Abre una terminal en la carpeta raiz del proyecto:
   ```bash
   cd C:\Users\pablo\Downloads\proyecto_tareas\proyecto_tareas
   ```
2. Crea el proyecto con Vite + React:
   ```bash
   npm create vite@latest frontend -- --template react
   ```
3. Entra a la carpeta creada:
   ```bash
   cd frontend
   ```
4. Instala dependencias:
   ```bash
   npm install
   ```

Luego continua con el paso **0) Preparar el entorno del frontend**.

1. **Ubica la carpeta del frontend**:
   - `C:\Users\pablo\Downloads\proyecto_tareas\proyecto_tareas\frontend`
2. **Abre una terminal en esa carpeta** y ejecuta:
   ```bash
   npm install
   ```
3. **Verifica el archivo `.env` del frontend** (si no existe, créalo):
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. **Guarda el archivo** y continua con el paso 1.

### 1) Verificar que Node.js este instalado
1. Abre una terminal.
2. Ejecuta:
   ```bash
   node -v
   ```
3. Si ves una version (por ejemplo `v20.x`), continua.
4. Si no aparece version, instala Node.js y vuelve a intentar.

### 2) Abrir dos terminales
Necesitaras **dos terminales** abiertas al mismo tiempo:
- Una para el **backend**
- Otra para el **frontend**

### 3) Iniciar el backend
1. En la **primera terminal**, entra a la carpeta del backend:
   ```bash
   cd C:\Users\pablo\Downloads\proyecto_tareas\proyecto_tareas\backend
   ```
2. Instala dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm run dev
   ```
4. Debes ver algo como:
   ```
   Servidor corriendo en puerto 3000
   ```
5. **No cierres esta terminal.** El backend debe quedarse corriendo.

### 3.1) Verificar que el backend responde
1. Abre el navegador y visita:
   ```
   http://localhost:3000/api
   ```
2. Si aparece algun mensaje o error de ruta, significa que el servidor esta activo.

### 4) Iniciar el frontend
1. En la **segunda terminal**, entra a la carpeta del frontend:
   ```bash
   cd C:\Users\pablo\Downloads\proyecto_tareas\proyecto_tareas\frontend
   ```
2. Instala dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Inicia el frontend:
   ```bash
   npm run dev
   ```
4. Vite mostrara una URL como:
   ```
   Local: http://localhost:5173/
   ```
5. **Abre esa URL en el navegador.**

### 5) Crear usuario (registro)
1. En el navegador, veras la pantalla de **Registro / Login**.
2. Da clic en **Crear cuenta**.
3. Llena:
   - Nombre
   - Correo
   - Contrasena
4. Clic en **Crear cuenta**.
5. Si todo esta correcto, te pedira iniciar sesion.

### 6) Iniciar sesion
1. Da clic en **Iniciar sesion**.
2. Escribe el mismo correo y contrasena.
3. Entra al sistema.

### 7) Crear tu primer periodo
1. En el menu izquierdo, entra a **Periodos**.
2. Llena el formulario y guarda.
3. Verifica que aparezca en la lista.

### 8) Crear materias
1. Ve a **Materias**.
2. Escribe el nombre y profesor.
3. Selecciona el periodo creado.
4. Guarda.

### 9) Crear tareas
1. Ve a **Tareas**.
2. Crea una tarea y elige la materia.
3. Guarda y verifica que aparezca en el listado.
4. Puedes usar los filtros para buscar o cambiar estado.

### 10) Crear horarios
1. Ve a **Horarios**.
2. Selecciona dia, horas y materia.
3. Guarda y revisa que aparezca en el horario semanal.

### 11) Ver el calendario
1. Ve al **Dashboard**.
2. Veras el calendario con tareas por dia.
3. Da clic en un dia para ver detalle.

### 12) Exportar calendario
1. En el Dashboard, da clic en **Exportar calendario**.
2. Se descargara un archivo CSV con las tareas.

---

## Cambios aplicados para que se visualice como ahora
- Se creo el proyecto frontend con Vite + React.
- Se agrego la UI completa: login/registro, dashboard, periodos, materias, tareas y horarios.
- Se conecto el frontend a la API del backend con `VITE_API_URL`.
- Se agrego el calendario con detalle de tareas por dia.
- Se agrego la vista de horario semanal con colores por materia.
- Se agregaron filtros avanzados de tareas y exportacion a CSV.

## Variables de entorno
Archivo `.env` en `frontend/`:

```
VITE_API_URL=http://localhost:3000/api
```

## Scripts

```bash
npm install
npm run dev
```

## Funcionalidades
- Registro e inicio de sesion
- CRUD de periodos, materias, tareas y horarios
- Calendario de tareas con detalle por dia
- Filtros avanzados de tareas
- Exportacion de calendario a CSV
- Horario semanal con colores por materia
