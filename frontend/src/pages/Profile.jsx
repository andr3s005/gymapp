import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuthStore } from '../store/authStore'
import { updateProfileRequest, updatePasswordRequest } from '../services/authService'

const goalLabels = {
  lose_fat: 'Perder grasa',
  gain_muscle: 'Ganar músculo',
  maintain: 'Mantener',
  improve_endurance: 'Mejorar resistencia',
}

const genderLabels = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-hover last:border-0">
      <span className="text-xs text-text-secondary font-body">{label}</span>
      {highlight ? (
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-strength/10 text-strength font-body">
          {value}
        </span>
      ) : (
        <span className="text-sm text-text-primary font-medium font-body">{value || '—'}</span>
      )}
    </div>
  )
}

function InputField({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label className="text-sm text-text-secondary font-body block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
      />
    </div>
  )
}

function Profile() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [heightCm, setHeightCm] = useState(user?.height_cm || '')
  const [weightKg, setWeightKg] = useState(user?.weight_kg || '')
  const [birthDate, setBirthDate] = useState(user?.birth_date || '')
  const [gender, setGender] = useState(user?.gender || '')
  const [goal, setGoal] = useState(user?.goal || '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  function formatDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function handleCancelProfile() {
    setFullName(user?.full_name || '')
    setHeightCm(user?.height_cm || '')
    setWeightKg(user?.weight_kg || '')
    setBirthDate(user?.birth_date || '')
    setGender(user?.gender || '')
    setGoal(user?.goal || '')
    setProfileError('')
    setProfileSuccess('')
    setEditingProfile(false)
  }

  function handleCancelPassword() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordSuccess('')
    setEditingPassword(false)
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      const data = await updateProfileRequest({
        full_name: fullName,
        height_cm: heightCm || null,
        weight_kg: weightKg || null,
        birth_date: birthDate || null,
        gender: gender || null,
        goal: goal || null,
      })
      setUser(data.profile)
      setProfileSuccess('Perfil actualizado correctamente')
      setTimeout(() => {
        setEditingProfile(false)
        setProfileSuccess('')
      }, 1500)
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Error al actualizar el perfil')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    setPasswordLoading(true)
    try {
      await updatePasswordRequest({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordSuccess('Contraseña actualizada correctamente')
      setTimeout(() => {
        handleCancelPassword()
      }, 1500)
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Error al cambiar la contraseña')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleLogoutAll() {
    if (!confirm('¿Cerrar sesión en todos los dispositivos? Tendrás que volver a iniciar sesión.')) return
    logout()
  }

  return (
    <DashboardLayout>
      <div className="px-10 py-8">
        <h1 className="text-2xl font-bold font-display text-text-primary mb-1">Mi perfil</h1>
        <p className="text-sm text-text-secondary font-body mb-6">
          Actualiza tu información personal y preferencias
        </p>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-7">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shrink-0"
            style={{ background: 'var(--color-nutrition)', color: 'var(--color-bg)' }}
          >
            {initials}
          </div>
          <div>
            <p className="font-display font-bold text-text-primary text-lg">{user?.full_name}</p>
            <p className="text-sm text-text-secondary font-body">{user?.email}</p>
            <p className="text-xs text-text-secondary font-body mt-0.5 capitalize">
              {user?.role}{user?.specialty ? ` · ${user.specialty}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Información personal */}
          <div className="bg-surface border border-surface-hover rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-text-primary text-base">
                Información personal
              </h2>
              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 text-xs text-text-secondary border border-surface-hover px-3 py-1.5 rounded-lg hover:border-strength hover:text-strength transition-colors font-body"
                >
                  <Pencil size={12} />
                  Editar
                </button>
              ) : (
                <button
                  onClick={handleCancelProfile}
                  className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-effort transition-colors font-body"
                >
                  <X size={14} />
                  Cancelar
                </button>
              )}
            </div>

            {!editingProfile ? (
              <div>
                <InfoRow label="Nombre completo" value={user?.full_name} />
                <InfoRow label="Altura" value={user?.height_cm ? `${user.height_cm} cm` : null} />
                <InfoRow label="Peso" value={user?.weight_kg ? `${user.weight_kg} kg` : null} />
                <InfoRow label="Género" value={genderLabels[user?.gender]} />
                <InfoRow label="Fecha de nacimiento" value={formatDate(user?.birth_date)} />
                <InfoRow label="Objetivo" value={goalLabels[user?.goal]} highlight={!!user?.goal} />
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                <InputField label="Nombre completo" value={fullName} onChange={setFullName} placeholder="Tu nombre" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Altura (cm)" type="number" value={heightCm} onChange={setHeightCm} placeholder="175" />
                  <InputField label="Peso (kg)" type="number" value={weightKg} onChange={setWeightKg} placeholder="75" />
                </div>
                <InputField label="Fecha de nacimiento" type="date" value={birthDate} onChange={setBirthDate} />
                <div>
                  <label className="text-sm text-text-secondary font-body block mb-1.5">Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                  >
                    <option value="">Selecciona...</option>
                    {Object.entries(genderLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-secondary font-body block mb-1.5">Objetivo</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                  >
                    <option value="">Selecciona...</option>
                    {Object.entries(goalLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {profileError && <p className="text-sm text-effort font-body">{profileError}</p>}
                {profileSuccess && <p className="text-sm text-strength font-body">{profileSuccess}</p>}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-60"
                >
                  {profileLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            )}
          </div>

          {/* Seguridad */}
          <div className="bg-surface border border-surface-hover rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-text-primary text-base">Seguridad</h2>
              {!editingPassword ? (
                <button
                  onClick={() => setEditingPassword(true)}
                  className="flex items-center gap-1.5 text-xs text-text-secondary border border-surface-hover px-3 py-1.5 rounded-lg hover:border-strength hover:text-strength transition-colors font-body"
                >
                  <Pencil size={12} />
                  Cambiar
                </button>
              ) : (
                <button
                  onClick={handleCancelPassword}
                  className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-effort transition-colors font-body"
                >
                  <X size={14} />
                  Cancelar
                </button>
              )}
            </div>

            {!editingPassword ? (
              <div>
                <InfoRow label="Contraseña" value="••••••••" />
                <InfoRow label="Correo electrónico" value={user?.email} />
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                <InputField
                  label="Contraseña actual"
                  type="password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <InputField
                  label="Nueva contraseña"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                <InputField
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                />

                {passwordError && <p className="text-sm text-effort font-body">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-strength font-body">{passwordSuccess}</p>}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-60"
                >
                  {passwordLoading ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
              </form>
            )}

            {/* Zona de peligro */}
            <div className="mt-6 pt-5 border-t border-surface-hover">
              <p className="text-xs text-effort font-bold mb-1">Zona de peligro</p>
              <p className="text-xs text-text-secondary font-body mb-3">
                Estas acciones son permanentes y no se pueden deshacer.
              </p>
              <button
                onClick={handleLogoutAll}
                className="text-xs px-3 py-2 rounded-lg border font-body transition-colors"
                style={{
                  color: 'var(--color-effort)',
                  borderColor: 'var(--color-effort)',
                  backgroundColor: 'var(--color-effort)1A',
                }}
              >
                Cerrar sesión en todos los dispositivos
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile