import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthVisualPanel from '../components/auth/AuthVisualPanel'
import { loginRequest } from '../services/authService'
import { useAuthStore } from '../store/authStore'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginRequest(email, password)
      login(data.profile, data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      <AuthVisualPanel />

      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-2xl font-bold font-display text-strength mb-1">IronCore</h1>
          <p className="text-sm text-text-secondary font-body mb-8">Inicia sesión en tu cuenta</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-text-secondary font-body block mb-1.5">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                placeholder="nombre@correo.com"
              />
            </div>

            <div>
              <label className="text-sm text-text-secondary font-body block mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-surface border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                placeholder="contraseña"
              />
            </div>

            {error && (
              <p className="text-sm text-effort font-body">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 mt-2 disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-sm text-text-secondary font-body text-center mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-nutrition">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login