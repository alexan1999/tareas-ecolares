const pool = require('../config/db');

const getTareas = async (req, res) => {
    try {
        // Consultamos la tabla tareas que definiste en tu SQL [cite: 46]
        const result = await pool.query('SELECT * FROM tareas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getTareas };