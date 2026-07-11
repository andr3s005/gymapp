import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import MembershipStatusBadge from '../components/memberships/MembershipStatusBadge'
import AppAccessBadge from '../components/memberships/AppAccessBadge'
import CreateMembershipModal from '../components/memberships/CreateMembershipModal'
import {
  getMembershipsRequest,
  createMembershipRequest,
  updateMembershipStatusRequest,
  renewMembershipRequest,
} from '../services/membershipService'

const planLabels = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  biannual: 'Semestral',
  annual: 'Anual',
}

function Memberships() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    loadMemberships()
  }, [])

  async function loadMemberships() {
    setLoading(true)
    try {
      const data = await getMembershipsRequest()
      setMemberships(data.memberships)
    } catch (err) {
      console.error('Error cargando membresías:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(membershipData) {
    const data = await createMembershipRequest(membershipData)
    await loadMemberships()
    return data
  }

  async function handleRenew(membership) {
    const amount = prompt(`Monto de renovación para ${membership.profiles?.full_name}:`)
    if (!amount || isNaN(amount)) return

    setProcessingId(membership.id)
    try {
      await renewMembershipRequest(membership.id, {
        payment_amount: Number(amount),
        payment_method: 'cash',
      })
      await loadMemberships()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al renovar')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleUpdateStatus(membership, newStatus) {
    const actionLabels = {
      frozen: 'pausar',
      cancelled: 'cancelar',
      active: 'reactivar',
    }
    const label = actionLabels[newStatus] || newStatus
    if (!confirm(`¿Estás seguro de que quieres ${label} esta membresía?`)) return

    setProcessingId(membership.id)
    try {
      await updateMembershipStatusRequest(membership.id, newStatus)
      await loadMemberships()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar estado')
    } finally {
      setProcessingId(null)
    }
  }

  // Estadísticas calculadas del lado del cliente
  const stats = {
    total: memberships.length,
    active: memberships.filter((m) => m.status === 'active').length,
    expiringSoon: memberships.filter((m) => {
      if (m.status !== 'active') return false
      const daysLeft = Math.ceil(
        (new Date(m.end_date) - new Date()) / (1000 * 60 * 60 * 24)
      )
      return daysLeft <= 7 && daysLeft > 0
    }).length,
    monthlyRevenue: memberships
      .flatMap((m) => m.payments || [])
      .filter((p) => {
        const paid = new Date(p.paid_at)
        const now = new Date()
        return paid.getMonth() === now.getMonth() &&
          paid.getFullYear() === now.getFullYear()
      })
      .reduce((sum, p) => sum + Number(p.amount), 0),
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function getSecondaryAction(membership) {
    switch (membership.status) {
      case 'active':
      case 'grace_period':
        return { label: 'Pausar', status: 'frozen' }
      case 'frozen':
        return { label: 'Reactivar', status: 'active' }
      case 'expired':
        return { label: 'Cancelar', status: 'cancelled' }
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="px-10 py-8">
        <h1 className="text-2xl font-bold font-display text-text-primary mb-1">Membresías</h1>
        <p className="text-sm text-text-secondary font-body mb-6">
          Gestión de membresías y pagos del gimnasio
        </p>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
          <div className="bg-surface border border-surface-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary font-body">Total miembros</p>
            <p className="text-2xl font-bold font-display text-strength mt-1.5">{stats.total}</p>
          </div>
          <div className="bg-surface border border-surface-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary font-body">Activas</p>
            <p className="text-2xl font-bold font-display text-strength mt-1.5">{stats.active}</p>
          </div>
          <div className="bg-surface border border-surface-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary font-body">Por vencer (7 días)</p>
            <p className="text-2xl font-bold font-display text-effort mt-1.5">{stats.expiringSoon}</p>
          </div>
          <div className="bg-surface border border-surface-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary font-body">Ingresos este mes</p>
            <p className="text-2xl font-bold font-display text-nutrition mt-1.5">
              ${stats.monthlyRevenue.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-hover">
                {['Usuario', 'Plan', 'Vence', 'Estado', 'Acceso app', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs text-text-secondary font-body font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership) => {
                const secondaryAction = getSecondaryAction(membership)
                const isProcessing = processingId === membership.id
                return (
                  <tr key={membership.id} className="border-b border-surface-hover last:border-0">
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-primary font-medium">{membership.profiles?.full_name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{membership.profiles?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary font-body">
                      {planLabels[membership.plan_type] || membership.plan_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary font-body">
                      {formatDate(membership.end_date)}
                    </td>
                    <td className="px-6 py-4">
                      <MembershipStatusBadge status={membership.status} />
                    </td>
                    <td className="px-6 py-4">
                      <AppAccessBadge access={membership.app_access} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {membership.status !== 'cancelled' && (
                          <button
                            onClick={() => handleRenew(membership)}
                            disabled={isProcessing}
                            className="text-xs px-3 py-1.5 rounded-lg bg-bg border border-surface-hover text-text-secondary hover:text-text-primary font-body disabled:opacity-40"
                          >
                            Renovar
                          </button>
                        )}
                        {secondaryAction && (
                          <button
                            onClick={() => handleUpdateStatus(membership, secondaryAction.status)}
                            disabled={isProcessing}
                            className="text-xs px-3 py-1.5 rounded-lg border font-body disabled:opacity-40"
                            style={{
                              color: 'var(--color-effort)',
                              borderColor: 'var(--color-effort)',
                              backgroundColor: 'var(--color-effort)1A',
                            }}
                          >
                            {isProcessing ? '...' : secondaryAction.label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Tarjetas — móvil */}
        <div className="md:hidden divide-y divide-surface-hover">
          {memberships.map((membership) => {
            const secondaryAction = getSecondaryAction(membership)
            const isProcessing = processingId === membership.id
            return (
              <div key={membership.id} className="px-4 py-4 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-primary font-medium">{membership.profiles?.full_name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{membership.profiles?.email}</p>
                  </div>
                  <MembershipStatusBadge status={membership.status} />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-text-secondary font-body">
                    {planLabels[membership.plan_type]}
                  </span>
                  <span className="text-xs text-text-secondary font-body">·</span>
                  <span className="text-xs text-text-secondary font-body">
                    Vence {formatDate(membership.end_date)}
                  </span>
                  <AppAccessBadge access={membership.app_access} />
                </div>

                <div className="flex gap-2 mt-1">
                  {membership.status !== 'cancelled' && (
                    <button
                      onClick={() => handleRenew(membership)}
                      disabled={isProcessing}
                      className="flex-1 text-xs py-2 rounded-lg bg-bg border border-surface-hover text-text-secondary font-body disabled:opacity-40"
                    >
                      Renovar
                    </button>
                  )}
                  {secondaryAction && (
                    <button
                      onClick={() => handleUpdateStatus(membership, secondaryAction.status)}
                      disabled={isProcessing}
                      className="flex-1 text-xs py-2 rounded-lg border font-body disabled:opacity-40"
                      style={{
                        color: 'var(--color-effort)',
                        borderColor: 'var(--color-effort)',
                        backgroundColor: 'var(--color-effort)1A',
                      }}
                    >
                      {isProcessing ? '...' : secondaryAction.label}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showCreateModal && (
        <CreateMembershipModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </DashboardLayout>
  )
}

export default Memberships