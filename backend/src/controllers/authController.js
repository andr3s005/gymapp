const { supabaseAdmin } = require ('../config/supabase');

// POST /api/auth/register
async function register(req, res) {
    const { email, password, full_name, height_cm, weight_kg, birth_date, gender, goal } = req.body;
    
    if(!email || !password || !full_name){
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if(authError){
        return res.status(400).json({ error: authError.message});
    }

    const userId = authData.user.id;

    //Creacion del usuario
    const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
        id: userId,
        email,
        full_name,
        height_cm,
        weight_kg,
        birth_date,
        gender,
        goal,
        role: 'user'
    })
    .select()
    .single();

if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return res.status(400).json({ error: profileError.message });
  }

  // Generamos una sesión real para hacer login automático
  const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (sessionError) {
    // El usuario y perfil ya se crearon correctamente, solo falló la sesión automática
    return res.status(201).json({
      message: 'Usuario registrado correctamente, pero inicia sesión manualmente',
      profile: profileData
    });
  }

  res.status(201).json({
    message: 'Usuario registrado correctamente',
    profile: profileData,
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  // Obtenemos el perfil completo junto con el token de sesión
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    return res.status(500).json({ error: 'Error al obtener el perfil' });
  }

  res.json({
    message: 'Login exitoso',
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    profile
  });
}

// GET /api/auth/me — devuelve el perfil del usuario autenticado
async function me(req, res) {
  res.json({ profile: req.user });
}

// POST /api/auth/admin-create-user — solo accesible por admins
async function adminCreateUser(req, res) {
  const { email, password, full_name, role, specialty, height_cm, weight_kg, birth_date, gender, goal } = req.body;

  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'email, password, full_name y role son obligatorios' });
  }

  if (!['user', 'coach', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'role debe ser user, coach o admin' });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const userId = authData.user.id;

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name,
      height_cm,
      weight_kg,
      birth_date,
      gender,
      goal,
      role,
      specialty: role === 'coach' ? specialty : null
    })
    .select()
    .single();

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return res.status(400).json({ error: profileError.message });
  }

  res.status(201).json({ message: 'Usuario creado correctamente por admin', profile: profileData });
}

module.exports = { register, login, me, adminCreateUser };
