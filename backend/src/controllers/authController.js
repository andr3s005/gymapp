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
}

module.exports = { register };
