const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/tareas.controller');
/*
Endpoints para tareas:
localhost:3000/api/tareas
http://localhost:3000/api/tareas/ metodos: post
https://localhost:3000/api/tareas/ metodos: get
http://localhost:3000/api/tareas/:id metodos: get
http://localhost:3000/api/tareas/:id metodos: put
http://localhost:3000/api/tareas/:id/completar metodos: patch
http://localhost:3000/api/tareas/ metodos: delete

*/
//- POST /api/tareas: Crear una nueva tarea.

router.post('/', verificarToken, controller.crearTarea);

//- GET /api/tareas: Listar todas las tareas del usuario.
router.get('/', verificarToken, controller.obtenerTodasLasTareas);

//- GET /api/tareas/:id: Obtener detalle de una tarea específica.
router.get('/:id', verificarToken, controller.obtenerTareaPorId);

//- PUT /api/tareas/:id: Actualizar una tarea.
router.put('/:id', verificarToken, controller.actualizarTarea);

//- PATCH /api/tareas/:id/completar: Marcar una tarea como completada.
router.patch('/:id/completar', verificarToken, controller.marcarComoCompletada);

//- DELETE /api/tareas/:id: Eliminar una tarea.
router.delete('/:id', verificarToken, controller.eliminarTarea);


//funcionalidades adicionales de tareas para filtrar por estado
router.get('/estado/pendientes', verificarToken, controller.tareasPendientes);
router.get('/estado/vencidas', verificarToken, controller.tareasVencidas);
router.get('/estado/completadas', verificarToken, controller.tareasCompletadas);


module.exports = router;


