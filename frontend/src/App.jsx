function App() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 font-body">
      <h1 className="text-4xl font-display font-bold text-strength">
        GymApp
      </h1>
      <p className="text-text-secondary">Sistema de gestión de gimnasio</p>
      <div className="flex gap-3 mt-4">
        <span className="px-3 py-1 rounded-full bg-surface text-strength text-sm">Fuerza</span>
        <span className="px-3 py-1 rounded-full bg-surface text-effort text-sm">Esfuerzo</span>
        <span className="px-3 py-1 rounded-full bg-surface text-nutrition text-sm">Nutrición</span>
      </div>
    </div>
  )
}

export default App