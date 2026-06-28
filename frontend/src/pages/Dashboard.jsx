import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuthStore } from '../store/authStore'

function Dashboard() {
  const user = useAuthStore((state) => state.user)

  const firstName = user?.full_name?.split(' ')[0] || ''

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <DashboardLayout>
      <div className="px-10 py-8">
        <p className="text-sm text-text-secondary font-body capitalize">{today}</p>
        <h1 className="text-2xl font-bold font-display text-text-primary mt-1 mb-7">
          Hola, {firstName}
        </h1>

        <div className="grid grid-cols-3 gap-3.5 mb-7">
          <div className="bg-surface border border-surface-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary font-body">Membresía</p>
            <p className="text-lg font-bold font-display text-strength mt-1.5 capitalize">
              {user?.membership_status || 'Sin datos'}
            </p>
          </div>
          <div className="bg-surface border border-surface-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary font-body">Sesiones este mes</p>
            <p className="text-lg font-bold font-display text-effort mt-1.5">—</p>
          </div>
          <div className="bg-surface border border-surface-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary font-body">Coach asignado</p>
            <p className="text-lg font-bold font-display text-nutrition mt-1.5">Sin asignar</p>
          </div>
        </div>

        <div className="bg-surface border border-surface-hover rounded-xl p-6 text-center text-text-secondary font-body text-sm">
          Aquí va el contenido principal del dashboard
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard