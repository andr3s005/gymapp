const muscleGroups = [
  { value: '', label: 'Todos' },
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'legs', label: 'Piernas' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'arms', label: 'Brazos' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'full_body', label: 'Cuerpo completo' },
]

function MuscleGroupFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {muscleGroups.map((group) => (
        <button
          key={group.value}
          onClick={() => onSelect(group.value)}
          className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${
            selected === group.value
              ? 'bg-strength text-bg border-strength font-medium'
              : 'bg-surface text-text-secondary border-surface-hover hover:text-text-primary'
          }`}
        >
          {group.label}
        </button>
      ))}
    </div>
  )
}

export default MuscleGroupFilter