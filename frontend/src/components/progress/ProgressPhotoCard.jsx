import { Trash2, Eye, EyeOff } from 'lucide-react'

const angleLabels = {
  front: 'Frente',
  side: 'Lateral',
  back: 'Espalda',
}

function ProgressPhotoCard({ photo, onDelete, onToggleShare }) {
  return (
    <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden group">
      <div className="relative aspect-square bg-bg">
        <img
          src={photo.photo_url}
          alt={`Foto ${angleLabels[photo.angle]}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => onToggleShare(photo.id, !photo.is_shared_with_coach)}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            title={photo.is_shared_with_coach ? 'Dejar de compartir con coach' : 'Compartir con coach'}
          >
            {photo.is_shared_with_coach
              ? <Eye size={16} className="text-white" />
              : <EyeOff size={16} className="text-white" />
            }
          </button>
          <button
            onClick={() => onDelete(photo.id)}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-effort/60 flex items-center justify-center transition-colors"
          >
            <Trash2 size={16} className="text-white" />
          </button>
        </div>
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-text-primary font-body">
            {angleLabels[photo.angle]}
          </p>
          <p className="text-xs text-text-secondary font-body mt-0.5">
            {new Date(photo.taken_at).toLocaleDateString('es-MX', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
        {photo.is_shared_with_coach && (
          <span className="text-xs text-nutrition bg-nutrition/10 px-2 py-0.5 rounded-full font-body">
            Compartida
          </span>
        )}
      </div>
    </div>
  )
}

export default ProgressPhotoCard