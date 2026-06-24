const { supabseAdmin } = require ('../config/supabase');

// POST /api/auth/register
async function register(req, res) {
    const { email, password, full_name, height_cm, weight_kg, birth_date, gender, goal } = req.body;
    
    if(!email || !password || !full_name){
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUSer({
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

    if(profileError){
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return res.status(400).json({ error: profileError.message });
    }

    res.status(201).json({ message: 'Usuario registrado correctamente', profile: profileData });
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

module.exports = { register, login };
