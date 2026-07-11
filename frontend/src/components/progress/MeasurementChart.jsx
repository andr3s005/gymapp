import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const metrics = [
  { key: 'weight_kg', label: 'Peso (kg)', color: 'var(--color-strength)' },
  { key: 'waist_cm', label: 'Cintura (cm)', color: 'var(--color-nutrition)' },
  { key: 'bicep_cm', label: 'Bícep (cm)', color: 'var(--color-strength)' },
  { key: 'body_fat_pct', label: '% Grasa', color: 'var(--color-effort)' },
  { key: 'chest_cm', label: 'Pecho (cm)', color: 'var(--color-nutrition)' },
  { key: 'hips_cm', label: 'Cadera (cm)', color: 'var(--color-effort)' },
  { key: 'thigh_cm', label: 'Muslo (cm)', color: 'var(--color-strength)' },
]

function MeasurementChart({ measurements }) {
  const [selectedMetric, setSelectedMetric] = useState('weight_kg')

  const metric = metrics.find((m) => m.key === selectedMetric)

  // Preparar datos para la gráfica (orden cronológico)
  const chartData = [...measurements]
    .reverse()
    .filter((m) => m[selectedMetric] !== null)
    .map((m) => ({
      date: new Date(m.measured_at).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
      }),
      value: Number(m[selectedMetric]),
    }))

  if (chartData.length < 2) {
    return (
      <div className="bg-surface border border-surface-hover rounded-xl p-6 text-center">
        <p className="text-text-secondary text-sm font-body">
          Necesitas al menos 2 registros para ver la gráfica de evolución
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-surface-hover rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="font-display font-bold text-text-primary text-sm">Evolución</p>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="bg-bg border border-surface-hover text-text-secondary text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-strength font-body"
        >
          {metrics.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '0.5px solid var(--color-surface-hover)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
            }}
            formatter={(value) => [`${value} ${metric.label.split('(')[1]?.replace(')', '') || ''}`, metric.label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={metric.color}
            strokeWidth={2.5}
            dot={{ fill: metric.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MeasurementChart