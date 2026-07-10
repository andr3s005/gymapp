import { Check } from 'lucide-react'
import { useState } from 'react'

function SessionExerciseRow({ sessionExercise, sessionId, onUpdate }) {
  const [weight, setWeight] = useState(sessionExercise.weight_used_kg || '')
  const [reps, setReps] = useState(sessionExercise.reps_done || '')
  const [completed, setCompleted] = useState(sessionExercise.completed || false)
  const [saving, setSaving] = useState(false)

  async function handleToggleComplete() {
    setSaving(true)
    try {
      await onUpdate(sessionExercise.id, {
        reps_done: Number(reps) || 0,
        weight_used_kg: weight ? Number(weight) : null,
        completed: !completed,
      })
      setCompleted(!completed)
    } finally {
      setSaving(false)
    }
  }

  async function handleBlur() {
    if (!completed) return
    setSaving(true)
    try {
      await onUpdate(sessionExercise.id, {
        reps_done: Number(reps) || 0,
        weight_used_kg: weight ? Number(weight) : null,
        completed,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`grid gap-3 py-2.5 border-b border-surface-hover last:border-0 items-center ${
      completed ? 'opacity-60' : ''
    }`} style={{ gridTemplateColumns: '32px 1fr 80px 80px 44px' }}>
      <span className={`text-sm font-bold font-display ${completed ? 'text-strength' : 'text-text-secondary'}`}>
        {sessionExercise.set_number}
      </span>
      <span></span>
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={handleBlur}
        placeholder="—"
        className="bg-bg border border-surface-hover rounded-lg px-2 py-1.5 text-center text-sm text-text-primary font-body focus:outline-none focus:border-strength w-full"
      />
      <input
        type="number"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={handleBlur}
        placeholder="—"
        className="bg-bg border border-surface-hover rounded-lg px-2 py-1.5 text-center text-sm text-text-primary font-body focus:outline-none focus:border-strength w-full"
      />
      <button
        onClick={handleToggleComplete}
        disabled={saving}
        className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${
          completed
            ? 'bg-strength text-bg'
            : 'bg-surface-hover text-text-secondary hover:bg-strength/20 hover:text-strength'
        }`}
      >
        <Check size={14} strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default SessionExerciseRow