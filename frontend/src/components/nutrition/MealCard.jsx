import { Plus, Trash2 } from 'lucide-react'

const mealConfig = {
  breakfast: { label: 'Desayuno', emoji: '🌅' },
  lunch: { label: 'Comida', emoji: '☀️' },
  dinner: { label: 'Cena', emoji: '🌙' },
  snack: { label: 'Snack', emoji: '🍎' },
}

function MealCard({ mealType, log, onAdd, onRemove }) {
  const config = mealConfig[mealType]
  const items = log?.nutrition_log_items || []
  const totalCalories = log?.total_calories || 0

  return (
    <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-hover">
        <div className="flex items-center gap-2">
          <span>{config.emoji}</span>
          <p className="font-display font-bold text-text-primary text-sm">{config.label}</p>
          {totalCalories > 0 && (
            <span className="text-xs text-text-secondary font-body">
              · {Math.round(totalCalories)} kcal
            </span>
          )}
        </div>
        <button
          onClick={() => onAdd(mealType)}
          className="flex items-center gap-1 bg-strength text-bg text-xs font-bold font-body px-2.5 py-1.5 rounded-lg"
        >
          <Plus size={11} />
          Agregar
        </button>
      </div>

      <div className="divide-y divide-surface-hover">
        {items.length === 0 ? (
          <p className="text-xs text-text-secondary font-body text-center py-4">
            Sin registros todavía
          </p>
        ) : (
          items.map((item) => {
            const name = item.foods?.name || item.recipes?.name || 'Alimento'
            const protein = item.protein_g || 0

            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-2.5 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{name}</p>
                  <p className="text-xs text-text-secondary font-body mt-0.5">
                    {item.quantity_g}g · {Math.round(protein)}g prot
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <p className="text-sm font-bold text-strength font-display">
                    {Math.round(item.calories)} kcal
                  </p>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-text-secondary hover:text-effort opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MealCard