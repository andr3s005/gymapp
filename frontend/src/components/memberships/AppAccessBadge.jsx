const accessConfig = {
  full: { label: 'Completo', color: 'var(--color-nutrition)' },
  limited: { label: 'Limitado', color: '#8A8F98' },
  none: { label: 'Sin acceso', color: 'var(--color-effort)' },
}

function AppAccessBadge({ access }) {
  const config = accessConfig[access] || accessConfig.none

  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full font-body"
      style={{
        color: config.color,
        backgroundColor: `${config.color}1A`,
      }}
    >
      {config.label}
    </span>
  )
}

export default AppAccessBadge