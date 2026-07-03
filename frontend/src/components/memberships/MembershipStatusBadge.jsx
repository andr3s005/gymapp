const statusConfig = {
  active: { label: 'Activa', color: 'var(--color-strength)', bg: 'var(--color-strength)' },
  grace_period: { label: 'Periodo gracia', color: 'var(--color-effort)', bg: 'var(--color-effort)' },
  expired: { label: 'Vencida', color: 'var(--color-effort)', bg: 'var(--color-effort)' },
  frozen: { label: 'Pausada', color: 'var(--color-nutrition)', bg: 'var(--color-nutrition)' },
  cancelled: { label: 'Cancelada', color: '#8A8F98', bg: '#8A8F98' },
}

function MembershipStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.cancelled

  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full font-body"
      style={{
        color: config.color,
        backgroundColor: `${config.bg}1A`,
      }}
    >
      {config.label}
    </span>
  )
}

export default MembershipStatusBadge