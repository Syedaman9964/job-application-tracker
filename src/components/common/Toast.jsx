import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null

  const Icon = type === 'error' ? AlertCircle : type === 'info' ? Info : CheckCircle2

  return (
    <div
      className={`toast-notification toast-${type}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} className="toast-icon" />
      <span className="toast-text">{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss message"
      >
        <X size={14} />
      </button>
    </div>
  )
}
