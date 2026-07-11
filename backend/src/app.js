const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();
// Agrega esto justo después de require('dotenv').config()
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'MISSING')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING')
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

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

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