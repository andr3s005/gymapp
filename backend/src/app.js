const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

require('dotenv').config();
const app = express();

const { supabaseAdmin } = require('./config/supabase');
const authRoutes = require('./routes/authRoutes');


//Middlewares globales
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

//Ruta de salud para verificar que el backend está corriendo
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor corriendo correctamente'});
});


app.use('/api/auth', authRoutes);

module.exports = app;
