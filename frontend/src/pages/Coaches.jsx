import { useState, useEffect } from 'react'
import { Settings, Plus, X } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import CoachCard from '../components/coaches/CoachCard'
import AvailabilityModal from '../components/coaches/AvailabilityModal'
import {
  getCoachesRequest,
  assignCoachRequest,
  unassignCoachRequest,
  getMyClientsRequest,
  setAvailabilityRequest,
} from '../services/coachService'
import { checkMembershipStatusRequest } from '../services/membershipService'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

function CreateCoachForm({ onClose, onCreated }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [specialty, setSpecialty] = useState('training')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fullName || !email || !password) {
      setError('Todos los campos son obligatorios')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/admin-create-user', {
        full_name: fullName,
        email,
        password,
        role: 'coach',
        specialty,
      })
      await onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el coach')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm text-text-secondary font-body block mb-1.5">Nombre completo</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
          placeholder="Carlos Entrenador" className={inputClass} />
      </div>
      <div>
        <label className="text-sm text-text-secondary font-body block mb-1.5">Correo</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="coach@gimnasio.com" className={inputClass} />
      </div>
      <div>
        <label className="text-sm text-text-secondary font-body block mb-1.5">Contraseña temporal</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres" className={inputClass} />
      </div>
      <div>
        <label className="text-sm text-text-secondary font-body block mb-1.5">Especialidad</label>
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={inputClass}>
          <option value="training">Entrenamiento</option>
          <option value="nutrition">Nutrición</option>
          <option value="both">Ambas</option>
        </select>
      </div>

      {error && <p className="text-sm text-effort font-body">{error}</p>}

      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose}
          className="flex-1 bg-bg border border-surface-hover text-text-primary font-body text-sm rounded-lg py-2.5">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-60">
          {loading ? 'Creando...' : 'Crear coach'}
        </button>
      </div>
    </form>
  )
}

function Coaches() {
  const user = useAuthStore((state) => state.user)
  const isCoach = user?.role === 'coach'
  const isAdmin = user?.role === 'admin'

  const [coaches, setCoaches] = useState([])
  const [myCoachId, setMyCoachId] = useState(null)
  const [clients, setClients] = useState([])
  const [membershipStatus, setMembershipStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showCreateCoach, setShowCreateCoach] = useState(false)
  const [error, setError] = useState('')

  const hasCoachAccess = isAdmin || isCoach ||
    membershipStatus?.membership?.coach_included ||
    membershipStatus?.is_admin

  const canChangeCoach = new Date().getDate() === 1

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    async function checkMembership() {
      if (!isCoach && !isAdmin && user?.id) {
        try {
          const data = await checkMembershipStatusRequest(user.id)
          setMembershipStatus(data)
        } catch (err) {
          console.error('Error verificando membresía:', err)
        }
      }
    }
    checkMembership()
  }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const coachData = await getCoachesRequest()
      setCoaches(coachData.coaches)

      if (isCoach) {
        const clientData = await getMyClientsRequest()
        setClients(clientData.clients)
      }
    } catch (err) {
      console.error('Error cargando coaches:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign(coachId) {
    setError('')
    try {
      await assignCoachRequest(coachId)
      setMyCoachId(coachId)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al asignar coach')
    }
  }

  async function handleUnassign() {
    setError('')
    try {
      await unassignCoachRequest()
      setMyCoachId(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al desasignar coach')
    }
  }

  async function handleSaveAvailability(slots) {
    await setAvailabilityRequest(user.id, slots)
    await loadData()
  }

  async function handleDeleteCoach(coachId, coachName) {
    if (!confirm(`¿Eliminar al coach ${coachName}? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/auth/users/${coachId}`)
      await loadData()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar el coach')
    }
  }

  const myCoach = coaches.find((c) => c.id === myCoachId)
  const otherCoaches = coaches.filter((c) => c.id !== myCoachId)

  return (
    <DashboardLayout>
      <div className="px-10 py-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold font-display text-text-primary">
            {isCoach ? 'Mi panel de coach' : 'Coaches'}
          </h1>
          {isCoach && (
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="flex items-center gap-2 bg-surface border border-surface-hover text-text-primary text-xs font-body px-3 py-2 rounded-lg hover:border-strength transition-colors"
            >
              <Settings size={14} />
              Mi disponibilidad
            </button>
          )}
        </div>

        <p className="text-sm text-text-secondary font-body mb-6">
          {isCoach
            ? `Tienes ${clients.length} cliente${clients.length !== 1 ? 's' : ''} asignado${clients.length !== 1 ? 's' : ''}`
            : 'Encuentra y elige tu entrenador'}
        </p>

        {error && (
          <p className="text-sm text-effort font-body mb-4 bg-effort/10 border border-effort/30 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-text-secondary text-sm font-body">Cargando...</p>
        ) : isCoach ? (
          // Vista del coach — lista de clientes
          <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-hover">
              <p className="font-display font-bold text-text-primary text-sm">Mis clientes</p>
            </div>
            {clients.length === 0 ? (
              <p className="text-text-secondary text-sm font-body text-center py-12">
                Aún no tienes clientes asignados
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-hover">
                    {['Cliente', 'Objetivo', 'Plan', 'Estado membresía'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs text-text-secondary font-body font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((assignment) => {
                    const client = assignment.profiles
                    const membership = client?.memberships?.[0]
                    return (
                      <tr key={assignment.id} className="border-b border-surface-hover last:border-0">
                        <td className="px-6 py-4">
                          <p className="text-sm text-text-primary font-medium">{client?.full_name}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{client?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary font-body capitalize">
                          {client?.goal?.replace('_', ' ') || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary font-body capitalize">
                          {membership?.plan_type || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-body ${
                            membership?.status === 'active'
                              ? 'bg-strength/10 text-strength'
                              : 'bg-effort/10 text-effort'
                          }`}>
                            {membership?.status || 'Sin membresía'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : isAdmin ? (
          // Vista del admin — gestión de coaches
          <div className="flex flex-col gap-4">
            <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-hover flex items-center justify-between">
                <p className="font-display font-bold text-text-primary text-sm">Coaches registrados</p>
                <button
                  onClick={() => setShowCreateCoach(true)}
                  className="flex items-center gap-1.5 bg-strength text-bg text-xs font-bold font-body px-3 py-1.5 rounded-lg"
                >
                  <Plus size={13} />
                  Nuevo coach
                </button>
              </div>
              {coaches.length === 0 ? (
                <p className="text-text-secondary text-sm font-body text-center py-12">
                  No hay coaches registrados todavía
                </p>
              ) : (
                <div className="divide-y divide-surface-hover">
                  {coaches.map((coach) => (
                    <div key={coach.id} className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                          style={{ background: 'var(--color-nutrition)', color: 'var(--color-bg)' }}
                        >
                          {coach.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-text-primary font-medium">{coach.full_name}</p>
                          <p className="text-xs text-text-secondary font-body">
                            {coach.email} · {
                              coach.specialty === 'training' ? 'Entrenamiento' :
                              coach.specialty === 'nutrition' ? 'Nutrición' :
                              coach.specialty === 'both' ? 'Ambas' : 'Sin especialidad'
                            }
                          </p>
                          {coach.coach_availability?.length > 0 && (
                            <p className="text-xs text-text-secondary font-body mt-0.5">
                              {coach.coach_availability.length} horario{coach.coach_availability.length !== 1 ? 's' : ''} registrado{coach.coach_availability.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 md:ml-0">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-body ${
                          coach.coach_assignments?.filter(a => a.active).length > 0
                            ? 'bg-strength/10 text-strength'
                            : 'bg-surface-hover text-text-secondary'
                        }`}>
                          {coach.coach_assignments?.filter(a => a.active).length || 0} clientes
                        </span>
                        <button
                          onClick={() => handleDeleteCoach(coach.id, coach.full_name)}
                          className="text-xs text-effort border border-effort/40 px-3 py-1.5 rounded-lg hover:bg-effort/10 transition-colors font-body"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Vista del usuario
          <div className="flex flex-col gap-6">
            {!hasCoachAccess ? (
              <div className="bg-surface border border-surface-hover rounded-xl p-8 text-center max-w-lg mx-auto">
                <p className="font-display font-bold text-text-primary text-base mb-2">
                  Tu plan no incluye coach
                </p>
                <p className="text-text-secondary text-sm font-body mb-4 leading-relaxed">
                  El servicio de coach está disponible en planes trimestrales o superiores,
                  o con un costo adicional en el plan mensual.
                </p>
                <p className="text-xs text-text-secondary font-body">
                  Habla con el administrador del gimnasio para actualizar tu plan
                  o agregar el servicio de coach a tu membresía actual.
                </p>
              </div>
            ) : (
              <>
                {myCoach && (
                  <div>
                    <p className="text-xs text-text-secondary font-body mb-3 uppercase tracking-wide">
                      Tu coach actual
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <CoachCard
                        coach={myCoach}
                        isMyCoach={true}
                        onUnassign={handleUnassign}
                        canChange={canChangeCoach}
                      />
                    </div>
                  </div>
                )}

                {otherCoaches.length > 0 && (
                  <div>
                    <p className="text-xs text-text-secondary font-body mb-3 uppercase tracking-wide">
                      {myCoach ? 'Otros coaches disponibles' : 'Coaches disponibles'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {otherCoaches.map((coach) => (
                        <CoachCard
                          key={coach.id}
                          coach={coach}
                          isMyCoach={false}
                          onAssign={handleAssign}
                          canChange={canChangeCoach}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {coaches.length === 0 && (
                  <p className="text-text-secondary text-sm font-body text-center py-12">
                    No hay coaches registrados todavía
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showAvailabilityModal && isCoach && (
        <AvailabilityModal
          coach={user}
          currentAvailability={
            coaches.find((c) => c.id === user.id)?.coach_availability || []
          }
          onClose={() => setShowAvailabilityModal(false)}
          onSave={handleSaveAvailability}
        />
      )}

      {showCreateCoach && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-text-primary text-lg">Nuevo coach</h2>
              <button onClick={() => setShowCreateCoach(false)} className="text-text-secondary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <CreateCoachForm
              onClose={() => setShowCreateCoach(false)}
              onCreated={loadData}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Coaches