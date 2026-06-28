import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthVisualPanel from '../components/auth/AuthVisualPanel'
import { registerRequest } from '../services/authService'
import { useAuthStore } from '../store/authStore'

function Register() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    height_cm: '',
    weight_kg: '',
    birth_date: '',
    gender: '',
    goal: '',
  })

  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleNextStep(e) {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password || !formData.full_name) {
      setError('Completa todos los campos para continuar')
      return
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setStep(2)
  }

  async function handleFinalSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await registerRequest({
        ...formData,
        height_cm: formData.height_cm ? Number(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
      })

      // Tu backend de registro no devuelve un token, así que hacemos login automático después
      login(data.profile, data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      <AuthVisualPanel />

      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-2xl font-bold font-display text-strength mb-1">GymApp</h1>
          <p className="text-sm text-text-secondary font-body mb-2">Crea tu cuenta</p>

          <div className="flex gap-2 mb-8">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-strength' : 'bg-surface-hover'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-strength' : 'bg-surface-hover'}`} />
          </div>

          {step === 1 && (
            <form onSubmit={handleNextStep} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-text-secondary font-body block mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  required
                  className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                  placeholder="Andrés Soto"
                />
              </div>

              <div>
                <label className="text-sm text-text-secondary font-body block mb-1.5">Correo</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                  placeholder="nombre@correo.com"
                />
              </div>

              <div>
                <label className="text-sm text-text-secondary font-body block mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              {error && <p className="text-sm text-effort font-body">{error}</p>}

              <button
                type="submit"
                className="bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 mt-2"
              >
                Continuar
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-text-secondary font-body block mb-1.5">Altura (cm)</label>
                  <input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => updateField('height_cm', e.target.value)}
                    className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary font-body block mb-1.5">Peso (kg)</label>
                  <input
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) => updateField('weight_kg', e.target.value)}
                    className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                    placeholder="75"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary font-body block mb-1.5">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => updateField('birth_date', e.target.value)}
                  className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                />
              </div>

              <div>
                <label className="text-sm text-text-secondary font-body block mb-1.5">Género</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                >
                  <option value="">Selecciona...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-text-secondary font-body block mb-1.5">Objetivo</label>
                <select
                  value={formData.goal}
                  onChange={(e) => updateField('goal', e.target.value)}
                  className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                >
                  <option value="">Selecciona...</option>
                  <option value="lose_fat">Perder grasa</option>
                  <option value="gain_muscle">Ganar músculo</option>
                  <option value="maintain">Mantener</option>
                  <option value="improve_endurance">Mejorar resistencia</option>
                </select>
              </div>

              {error && <p className="text-sm text-effort font-body">{error}</p>}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-surface border border-surface-hover text-text-primary font-bold font-body text-sm rounded-lg py-2.5"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-60"
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </div>
            </form>
          )}

          <p className="text-sm text-text-secondary font-body text-center mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-nutrition">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register