function MacroRing({ value, goal, color, label, size = 'sm' }) {
  const radius = size === 'lg' ? 36 : 28
  const strokeWidth = size === 'lg' ? 8 : 6
  const dimension = (radius + strokeWidth) * 2
  const circumference = 2 * Math.PI * radius
  const progress = goal > 0 ? Math.min(value / goal, 1) : 0
  const offset = circumference - progress * circumference

  const fontSize = size === 'lg' ? { value: 14, sub: 9 } : { value: 12, sub: 8 }
  const center = dimension / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="var(--color-surface-hover)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text
          x={center} y={center - 4}
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize={fontSize.value}
          fontWeight="700"
          fontFamily="Space Grotesk, sans-serif"
        >
          {Math.round(value)}
          {label !== 'Calorías' ? 'g' : ''}
        </text>
        <text
          x={center} y={center + fontSize.value - 2}
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          fontSize={fontSize.sub}
          fontFamily="Inter, sans-serif"
        >
          de {Math.round(goal)}{label !== 'Calorías' ? 'g' : ''}
        </text>
      </svg>
      <p className="text-xs text-text-secondary font-body">{label}</p>
    </div>
  )
}

export default MacroRing