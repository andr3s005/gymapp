import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { getFoodsRequest } from '../../services/nutritionService'

function AddFoodModal({ mealType, onClose, onAdd }) {
  const [search, setSearch] = useState('')
  const [foods, setFoods] = useState([])
  const [selected, setSelected] = useState(null)
  const [quantity, setQuantity] = useState(100)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (search.length < 2) {
      setFoods([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await getFoodsRequest({ search })
        setFoods(data.foods)
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Calcular preview de macros según cantidad
  const preview = selected ? {
    calories: (selected.calories_per_100g * quantity / 100).toFixed(1),
    protein: (selected.protein_g * quantity / 100).toFixed(1),
    carbs: (selected.carbs_g * quantity / 100).toFixed(1),
    fat: (selected.fat_g * quantity / 100).toFixed(1),
  } : null

  async function handleAdd() {
    if (!selected || !quantity) return
    setLoading(true)
    try {
      await onAdd({
        food_id: selected.id,
        quantity_g: Number(quantity),
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-text-primary text-lg">
            Agregar alimento
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alimento... (mín. 2 caracteres)"
            className="w-full bg-bg border border-surface-hover rounded-lg pl-9 pr-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
            autoFocus
          />
        </div>

        {searching && (
          <p className="text-xs text-text-secondary font-body mb-2">Buscando...</p>
        )}

        {foods.length > 0 && !selected && (
          <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 mb-4">
            {foods.map((food) => (
              <div
                key={food.id}
                onClick={() => setSelected(food)}
                className="px-3 py-2.5 rounded-lg cursor-pointer bg-bg border border-surface-hover hover:border-strength transition-colors"
              >
                <p className="text-sm text-text-primary font-medium">{food.name}</p>
                {food.brand && (
                  <p className="text-xs text-text-secondary">{food.brand}</p>
                )}
                <p className="text-xs text-text-secondary mt-0.5">
                  {food.calories_per_100g} kcal · {food.protein_g}g prot por 100g
                </p>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="mb-4">
            <div className="flex items-center justify-between bg-bg border border-strength rounded-lg px-3 py-2.5 mb-3">
              <div>
                <p className="text-sm text-text-primary font-medium">{selected.name}</p>
                <p className="text-xs text-text-secondary">{selected.calories_per_100g} kcal por 100g</p>
              </div>
              <button
                onClick={() => { setSelected(null); setSearch('') }}
                className="text-text-secondary hover:text-text-primary ml-3"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mb-3">
              <label className="text-sm text-text-secondary font-body block mb-1.5">
                Cantidad (gramos)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
              />
            </div>

            {preview && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Calorías', value: preview.calories, unit: 'kcal', color: 'text-strength' },
                  { label: 'Proteína', value: preview.protein, unit: 'g', color: 'text-strength' },
                  { label: 'Carbos', value: preview.carbs, unit: 'g', color: 'text-nutrition' },
                  { label: 'Grasa', value: preview.fat, unit: 'g', color: 'text-effort' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="bg-bg rounded-lg p-2 text-center">
                    <p className={`text-sm font-bold font-display ${color}`}>{value}{unit}</p>
                    <p className="text-xs text-text-secondary font-body mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-bg border border-surface-hover text-text-primary font-body text-sm rounded-lg py-2.5"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!selected || !quantity || loading}
            className="flex-1 bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-40"
          >
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddFoodModal