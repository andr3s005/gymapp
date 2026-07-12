const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const { supabaseAdmin } = require('./config/supabase');
const authRoutes = require('./routes/authRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes')
const routineRoutes = require('./routes/routineRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const coachRoutes = require('./routes/coachRoutes');
const foodRoutes = require('./routes/foodRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express()

// CORS manual — debe ir ANTES de helmet y cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  next()
})

const corsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor corriendo correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);

module.exports = app;