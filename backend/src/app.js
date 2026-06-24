const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');


require('dotenv').config();

const app = express();
const { supabaseAdmin } = require('./config/supabase');
//Middlewares globales
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

//Ruta de salud para verificar que el backend está corriendo
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor corriendo correctamente'});
});


/* Ruta temporal de prueba - la vamos a quitar después
app.get('/api/test-db', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('exercises')
    .select('*')
    .limit(5);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Conexión exitosa', data });
});*/


module.exports = app;
