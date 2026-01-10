'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    error: <AlertCircle className="text-red-600" size={20} />,
    success: <CheckCircle className="text-green-600" size={20} />,
    info: <Info className="text-blue-600" size={20} />,
  }

  const bgColors = {
    error: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <div
      className={`fixed top-20 right-4 z-[70] max-w-md p-4 border rounded-lg shadow-lg animate-slide-in ${bgColors[type]}`}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <p className="flex-1 text-sm text-gray-800">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
          aria-label="Закрыть"
        >
          <X size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}

