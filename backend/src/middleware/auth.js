const { supabaseAdmin } = require('../config/supabase');

// Verifica que el request tenga un token válido y adjunta el usuario a req.user
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Obtenemos también el perfil completo (incluyendo el role)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(401).json({ error: 'Perfil no encontrado' });
  }

  // Adjuntamos el usuario al request para que las siguientes funciones lo usen
  req.user = profile;
  next();
}

// Verifica que el usuario tenga uno de los roles permitidos
// Uso: requireRole('admin') o requireRole('admin', 'coach')
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
