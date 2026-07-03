const { supabaseAdmin } = require('../config/supabase');

// GET /api/memberships — admin ve todas, usuario ve la suya
async function getMemberships(req, res) {
  const isAdmin = req.user.role === 'admin'

  let query = supabaseAdmin
    .from('memberships')
    .select(`
      *,
      profiles (
        id,
        full_name,
        email
      ),
      payments (
        id,
        amount,
        paid_at,
        payment_method,
        status
      )
    `)
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('user_id', req.user.id)
  }

  const { data, error } = await query

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ memberships: data })
}

// GET /api/memberships/:id
async function getMembershipById(req, res) {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('memberships')
    .select(`
      *,
      profiles (id, full_name, email),
      payments (id, amount, paid_at, payment_method, status)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Membresía no encontrada' })
  }

  const isOwner = data.user_id === req.user.id
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta membresía' })
  }

  res.json({ membership: data })
}

// POST /api/memberships — solo admin puede crear membresías
async function createMembership(req, res) {
  const { user_id, plan_type, start_date, payment_amount, payment_method } = req.body

  if (!user_id || !plan_type || !payment_amount) {
    return res.status(400).json({ error: 'user_id, plan_type y payment_amount son obligatorios' })
  }

  // Calcular end_date según el plan
  const start = start_date ? new Date(start_date) : new Date()
  const end = new Date(start)

  const planDays = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    biannual: 180,
    annual: 365,
  }

  const appAccessByPlan = {
    daily: 'limited',
    weekly: 'limited',
    monthly: 'full',
    quarterly: 'full',
    biannual: 'full',
    annual: 'full',
  }

  if (!planDays[plan_type]) {
    return res.status(400).json({ error: 'plan_type inválido' })
  }

  end.setDate(end.getDate() + planDays[plan_type])

  // Crear la membresía
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('memberships')
    .insert({
      user_id,
      plan_type,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      status: 'active',
      app_access: appAccessByPlan[plan_type],
    })
    .select()
    .single()

  if (membershipError) {
    return res.status(400).json({ error: membershipError.message })
  }

  // Registrar el pago asociado
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      membership_id: membership.id,
      amount: payment_amount,
      payment_method: payment_method || 'cash',
      status: 'completed',
    })
    .select()
    .single()

  if (paymentError) {
    return res.status(400).json({ error: paymentError.message })
  }

  res.status(201).json({
    message: 'Membresía creada correctamente',
    membership,
    payment,
  })
}

// PUT /api/memberships/:id/status — cambiar estado (solo admin)
async function updateMembershipStatus(req, res) {
  const { id } = req.params
  const { status, grace_period_end } = req.body

  const validStatuses = ['active', 'grace_period', 'expired', 'frozen', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' })
  }

  const { data, error } = await supabaseAdmin
    .from('memberships')
    .update({
      status,
      grace_period_end: grace_period_end || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Estado actualizado correctamente', membership: data })
}

// POST /api/memberships/:id/renew — renovar membresía (solo admin)
async function renewMembership(req, res) {
  const { id } = req.params
  const { payment_amount, payment_method } = req.body

  if (!payment_amount) {
    return res.status(400).json({ error: 'payment_amount es obligatorio' })
  }

  // Obtener membresía actual
  const { data: existing, error: findError } = await supabaseAdmin
    .from('memberships')
    .select('*')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Membresía no encontrada' })
  }

  const planDays = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    biannual: 180,
    annual: 365,
  }

  // Si la membresía ya expiró, renovar desde hoy
  // Si todavía está activa, extender desde su end_date actual
  const baseDate = new Date(existing.end_date) > new Date()
    ? new Date(existing.end_date)
    : new Date()

  const newEnd = new Date(baseDate)
  newEnd.setDate(newEnd.getDate() + planDays[existing.plan_type])

  const { data: membership, error: updateError } = await supabaseAdmin
    .from('memberships')
    .update({
      end_date: newEnd.toISOString().split('T')[0],
      status: 'active',
      grace_period_end: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return res.status(400).json({ error: updateError.message })
  }

  // Registrar el nuevo pago
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      membership_id: id,
      amount: payment_amount,
      payment_method: payment_method || 'cash',
      status: 'completed',
    })
    .select()
    .single()

  if (paymentError) {
    return res.status(400).json({ error: paymentError.message })
  }

  res.json({
    message: 'Membresía renovada correctamente',
    membership,
    payment,
  })
}

// GET /api/memberships/check/:userId — verificar si un usuario tiene membresía activa
async function checkMembershipStatus(req, res) {
  const { userId } = req.params

  const { data, error } = await supabaseAdmin
    .from('memberships')
    .select('id, status, end_date, grace_period_end, plan_type, app_access')
    .eq('user_id', userId)
    .in('status', ['active', 'grace_period'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return res.json({ has_active_membership: false, app_access: 'none' })
  }

  res.json({
    has_active_membership: true,
    app_access: data.app_access,
    membership: data,
  })
}

module.exports = {
  getMemberships,
  getMembershipById,
  createMembership,
  updateMembershipStatus,
  renewMembership,
  checkMembershipStatus,
}