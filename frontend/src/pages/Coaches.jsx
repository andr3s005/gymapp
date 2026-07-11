import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
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
  const [error, setError] = useState('')

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

  const myCoach = coaches.find((c) => c.id === myCoachId)
  const otherCoaches = coaches.filter((c) => c.id !== myCoachId)
  const hasCoachAccess = isAdmin || isCoach ||
    membershipStatus?.membership?.coach_included ||
    membershipStatus?.is_admin

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
        ) : (
          // Vista del usuario
          <div className="flex flex-col gap-6">
            {!hasCoachAccess ? (
              // Sin acceso a coach por plan
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
              // Con acceso a coach
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
    </DashboardLayout>
  )
}

export default Coaches