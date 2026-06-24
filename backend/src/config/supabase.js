 const { createClient } = require('@supabase/supabase-js');

/* Cliente con la service_role key: tiene permisos completos,
se salta TODAS las políticas de RLS. Solo se usa aquí en el backend,
nunca se expone al frontend.*/
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

module.exports = { supabaseAdmin };