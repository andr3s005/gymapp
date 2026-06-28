function MetricCard({ label, value, sublabel, accentColor, style }) {
  return (
    <div
      className="absolute bg-bg border border-surface-hover rounded-xl px-4 py-3 w-44"
      style={style}
    >
      <p className="text-xs text-text-secondary font-body">{label}</p>
      <p className="text-2xl font-bold font-display mt-1" style={{ color: accentColor }}>
        {value}
      </p>
      <p className="text-xs text-text-secondary font-body mt-0.5">{sublabel}</p>
    </div>
  )
}

function AuthVisualPanel() {
  return (
    <div className="relative hidden lg:flex lg:flex-col overflow-hidden bg-surface border-r border-surface-hover px-10 py-12">

      <div className="relative" style={{ height: '440px' }}>
        <MetricCard
          label="Press de banca"
          value="82.5 kg"
          sublabel="+5kg esta semana"
          accentColor="var(--color-strength)"
          style={{ top: '0px', left: '0px' }}
        />
        <MetricCard
          label="Esfuerzo percibido"
          value="8 / 10"
          sublabel="Sesión de hoy"
          accentColor="var(--color-effort)"
          style={{ top: '170px', left: '50px' }}
        />
        <MetricCard
          label="Proteína hoy"
          value="128 g"
          sublabel="de 150g meta"
          accentColor="var(--color-nutrition)"
          style={{ top: '340px', left: '0px' }}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-bold font-display text-text-primary leading-tight">
          Tu progreso,<br />medido de verdad.
        </h2>
        <p className="text-sm text-text-secondary font-body mt-3 max-w-xs leading-relaxed">
          Entrenamiento, nutrición y composición corporal en un solo lugar.
        </p>
      </div>

    </div>
  )
}

export default AuthVisualPanel