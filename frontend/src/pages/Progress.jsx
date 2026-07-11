import { useState, useEffect, useRef } from 'react'
import { Plus, Upload } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import AddMeasurementModal from '../components/progress/AddMeasurementModal'
import MeasurementChart from '../components/progress/MeasurementChart'
import ProgressPhotoCard from '../components/progress/ProgressPhotoCard'
import {
  getMeasurementsRequest,
  createMeasurementRequest,
  deleteMeasurementRequest,
  getPhotosRequest,
  createPhotoRequest,
  updatePhotoPrivacyRequest,
  deletePhotoRequest,
  getUploadUrlRequest,
} from '../services/progressService'

const measurementLabels = {
  weight_kg: { label: 'Peso', unit: 'kg', color: 'text-strength' },
  waist_cm: { label: 'Cintura', unit: 'cm', color: 'text-nutrition' },
  bicep_cm: { label: 'Bícep', unit: 'cm', color: 'text-strength' },
  body_fat_pct: { label: '% Grasa', unit: '%', color: 'text-effort' },
}

function Progress() {
  const [tab, setTab] = useState('measurements')
  const [measurements, setMeasurements] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedAngle, setSelectedAngle] = useState('front')
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [measureData, photoData] = await Promise.all([
        getMeasurementsRequest(20),
        getPhotosRequest(),
      ])
      setMeasurements(measureData.measurements)
      setPhotos(photoData.photos)
    } catch (err) {
      console.error('Error cargando progreso:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateMeasurement(data) {
    await createMeasurementRequest(data)
    await loadData()
  }

  async function handleDeleteMeasurement(id) {
    if (!confirm('¿Eliminar esta medición?')) return
    await deleteMeasurementRequest(id)
    setMeasurements((prev) => prev.filter((m) => m.id !== id))
  }

  async function handleUploadPhoto(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      // 1. Obtener URL firmada del backend
      const { upload_url, public_url } = await getUploadUrlRequest(
        file.name,
        file.type
      )

      // 2. Subir la imagen directamente a Supabase Storage
      await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      // 3. Guardar la referencia en la base de datos
      await createPhotoRequest({
        photo_url: public_url,
        angle: selectedAngle,
        is_shared_with_coach: false,
      })

      await loadData()
    } catch (err) {
      console.error('Error subiendo foto:', err)
      alert('Error al subir la foto, intenta de nuevo')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  async function handleToggleShare(photoId, isShared) {
    await updatePhotoPrivacyRequest(photoId, isShared)
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, is_shared_with_coach: isShared } : p
      )
    )
  }

  async function handleDeletePhoto(photoId) {
    if (!confirm('¿Eliminar esta foto?')) return
    await deletePhotoRequest(photoId)
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  // Última medición para las tarjetas de resumen
  const latest = measurements[0]
  const first = measurements[measurements.length - 1]

  function getDiff(key) {
    if (!latest || !first || latest.id === first.id) return null
    const diff = Number(latest[key]) - Number(first[key])
    if (isNaN(diff) || diff === 0) return null
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
  }

  return (
    <DashboardLayout>
      <div className="px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">Progreso</h1>
            <p className="text-sm text-text-secondary font-body mt-0.5">
              Tu evolución física en el tiempo
            </p>
          </div>
          {tab === 'measurements' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-strength text-bg text-xs font-bold font-body px-4 py-2 rounded-lg"
            >
              <Plus size={13} />
              Registrar medidas
            </button>
          )}
          {tab === 'photos' && (
            <div className="flex items-center gap-3">
              <select
                value={selectedAngle}
                onChange={(e) => setSelectedAngle(e.target.value)}
                className="bg-surface border border-surface-hover text-text-secondary text-xs px-3 py-2 rounded-lg focus:outline-none font-body"
              >
                <option value="front">Frente</option>
                <option value="side">Lateral</option>
                <option value="back">Espalda</option>
              </select>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-1.5 bg-strength text-bg text-xs font-bold font-body px-4 py-2 rounded-lg disabled:opacity-60"
              >
                <Upload size={13} />
                {uploadingPhoto ? 'Subiendo...' : 'Subir foto'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadPhoto}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface border border-surface-hover rounded-xl p-1 w-fit mb-6">
          {[
            { key: 'measurements', label: 'Medidas' },
            { key: 'photos', label: 'Fotos' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-5 py-2 rounded-lg font-body transition-colors ${
                tab === t.key
                  ? 'bg-bg text-text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-text-secondary text-sm font-body">Cargando...</p>
        ) : tab === 'measurements' ? (
          <div className="flex flex-col gap-6">
            {/* Tarjetas de resumen */}
            {latest && (
              <div className="grid grid-cols-4 gap-3.5">
                {Object.entries(measurementLabels).map(([key, config]) => {
                  const value = latest[key]
                  const diff = getDiff(key)
                  if (!value) return null
                  return (
                    <div key={key} className="bg-surface border border-surface-hover rounded-xl p-4">
                      <p className="text-xs text-text-secondary font-body">{config.label}</p>
                      <p className={`text-2xl font-bold font-display mt-1.5 ${config.color}`}>
                        {value} {config.unit}
                      </p>
                      {diff && (
                        <p className="text-xs text-text-secondary font-body mt-1">
                          {diff}{config.unit} desde inicio
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Gráfica */}
            {measurements.length > 0 && (
              <MeasurementChart measurements={measurements} />
            )}

            {/* Historial */}
            {measurements.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary text-sm font-body">
                  Sin medidas registradas todavía
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-strength text-sm font-body mt-2"
                >
                  Registra tus primeras medidas
                </button>
              </div>
            ) : (
              <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-surface-hover">
                  <p className="font-display font-bold text-text-primary text-sm">Historial</p>
                </div>
                <div className="divide-y divide-surface-hover">
                  {measurements.map((m) => (
                    <div key={m.id} className="px-6 py-3 flex items-center justify-between group">
                      <p className="text-sm text-text-secondary font-body">
                        {new Date(m.measured_at).toLocaleDateString('es-MX', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-4">
                        {m.weight_kg && (
                          <span className="text-sm text-text-primary font-body">
                            {m.weight_kg} kg
                          </span>
                        )}
                        {m.waist_cm && (
                          <span className="text-sm text-text-primary font-body">
                            C: {m.waist_cm} cm
                          </span>
                        )}
                        {m.bicep_cm && (
                          <span className="text-sm text-text-primary font-body">
                            B: {m.bicep_cm} cm
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteMeasurement(m.id)}
                          className="text-text-secondary hover:text-effort opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Pestaña de fotos
          <div>
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary text-sm font-body">
                  Sin fotos de progreso todavía
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-strength text-sm font-body mt-2"
                >
                  Sube tu primera foto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {photos.map((photo) => (
                  <ProgressPhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={handleDeletePhoto}
                    onToggleShare={handleToggleShare}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMeasurementModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreateMeasurement}
        />
      )}
    </DashboardLayout>
  )
}

export default Progress