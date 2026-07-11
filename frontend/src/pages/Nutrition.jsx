import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import MacroRing from '../components/nutrition/MacroRing'
import MealCard from '../components/nutrition/MealCard'
import AddFoodModal from '../components/nutrition/AddFoodModal'
import {
  getNutritionLogsRequest,
  getDailySummaryRequest,
  addNutritionLogRequest,
  removeNutritionLogItemRequest,
  getWaterLogRequest,
  logWaterRequest,
} from '../services/nutritionService'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

// Metas diarias por defecto — más adelante se pueden personalizar por usuario
const DEFAULT_GOALS = {
  calories: 2200,
  protein_g: 150,
  carbs_g: 275,
  fat_g: 73,
  water_ml: 2000,
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function formatDateLabel(date) {
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function Nutrition() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })
  const [waterLog, setWaterLog] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeMeal, setActiveMeal] = useState(null)

  const dateStr = formatDate(currentDate)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [logsData, summaryData, waterData] = await Promise.all([
        getNutritionLogsRequest(dateStr),
        getDailySummaryRequest(dateStr),
        getWaterLogRequest(dateStr),
      ])
      setLogs(logsData.logs)
      setSummary(summaryData.summary)
      setWaterLog(waterData.total_ml || 0)
    } catch (err) {
      console.error('Error cargando nutrición:', err)
    } finally {
      setLoading(false)
    }
  }, [dateStr])

  useEffect(() => {
    loadData()
  }, [loadData])

  function goToPreviousDay() {
  setCurrentDate((prev) => {
    const d = new Date(prev)
    d.setDate(d.getDate() - 1)
    return d
  })
}

    function goToNextDay() {
    setCurrentDate((prev) => {
        const d = new Date(prev)
        d.setDate(d.getDate() + 1)
        return d
    })
    }

  function getLogForMeal(mealType) {
    return logs.find((l) => l.meal_type === mealType) || null
  }

  async function handleAddFood(mealType, foodData) {
    await addNutritionLogRequest({
      meal_type: mealType,
      ...foodData,
    })
    await loadData()
  }

  async function handleRemoveItem(logItemId) {
    await removeNutritionLogItemRequest(logItemId)
    await loadData()
  }

  async function handleLogWater(amount) {
    await logWaterRequest(amount)
    const waterData = await getWaterLogRequest(dateStr)
    setWaterLog(waterData.total_ml || 0)
  }

  const isToday = formatDate(new Date()) === dateStr

  return (
    <DashboardLayout>
      <div className="px-10 py-8">

        {/* Header con navegación de fechas */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">Nutrición</h1>
            <p className="text-sm text-text-secondary font-body mt-0.5 capitalize">
              {formatDateLabel(currentDate)}
              {isToday && <span className="text-strength ml-2">· Hoy</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousDay}
              className="bg-surface border border-surface-hover text-text-secondary hover:text-text-primary text-sm px-4 py-2 rounded-lg font-body transition-colors"
            >
              ‹ Ayer
            </button>
            {!isToday && (
              <button
                onClick={goToNextDay}
                className="bg-surface border border-surface-hover text-text-secondary hover:text-text-primary text-sm px-4 py-2 rounded-lg font-body transition-colors"
              >
                Mañana ›
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-text-secondary text-sm font-body">Cargando...</p>
        ) : (
          <>
            {/* Dashboard de macros */}
            <div className="bg-surface border border-surface-hover rounded-2xl p-6 mb-5">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="border-r border-surface-hover pr-4 flex justify-center">
                  <MacroRing
                    value={summary.calories}
                    goal={DEFAULT_GOALS.calories}
                    color="var(--color-strength)"
                    label="Calorías"
                    size="lg"
                  />
                </div>
                <div className="flex justify-center">
                  <MacroRing
                    value={summary.protein_g}
                    goal={DEFAULT_GOALS.protein_g}
                    color="var(--color-strength)"
                    label="Proteína"
                  />
                </div>
                <div className="flex justify-center">
                  <MacroRing
                    value={summary.carbs_g}
                    goal={DEFAULT_GOALS.carbs_g}
                    color="var(--color-nutrition)"
                    label="Carbos"
                  />
                </div>
                <div className="flex justify-center">
                  <MacroRing
                    value={summary.fat_g}
                    goal={DEFAULT_GOALS.fat_g}
                    color="var(--color-effort)"
                    label="Grasas"
                  />
                </div>
              </div>
            </div>

            {/* Hidratación */}
            <div className="bg-surface border border-surface-hover rounded-xl px-5 py-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">💧</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary font-display">Hidratación</p>
                  <p className="text-xs font-body mt-0.5" style={{ color: 'var(--color-nutrition)' }}>
                    {waterLog} ml de {DEFAULT_GOALS.water_ml} ml
                  </p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-surface-hover rounded-full mb-3">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(waterLog / DEFAULT_GOALS.water_ml * 100, 100)}%`,
                    backgroundColor: 'var(--color-nutrition)',
                  }}
                />
              </div>
              {isToday && (
                <div className="flex gap-2">
                  {[250, 500, 750].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleLogWater(amount)}
                      className="flex-1 text-xs py-2 rounded-lg font-body transition-colors border"
                      style={{
                        color: 'var(--color-nutrition)',
                        borderColor: 'var(--color-nutrition)',
                        backgroundColor: 'var(--color-nutrition)1A',
                      }}
                    >
                      +{amount}ml
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid de comidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MEAL_TYPES.map((mealType) => (
                <MealCard
                  key={mealType}
                  mealType={mealType}
                  log={getLogForMeal(mealType)}
                  onAdd={(meal) => setActiveMeal(meal)}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {activeMeal && (
        <AddFoodModal
          mealType={activeMeal}
          onClose={() => setActiveMeal(null)}
          onAdd={(foodData) => handleAddFood(activeMeal, foodData)}
        />
      )}
    </DashboardLayout>
  )
}

export default Nutrition