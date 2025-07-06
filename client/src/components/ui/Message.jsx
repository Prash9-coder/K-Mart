const Message = ({ variant = 'info', children, dismissible = false, onDismiss }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 shadow-green-100'
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200 shadow-red-100'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800 border-yellow-200 shadow-yellow-100'
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-200 shadow-blue-100'
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={`p-4 mb-4 rounded-xl border shadow-lg ${getVariantClasses()} animate-scaleIn card-interactive relative`}>
      <div className="flex items-start">
        <span className="text-xl mr-3 animate-bounce-custom">{getIcon()}</span>
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="ml-3 text-gray-500 hover:text-gray-700 transition-colors duration-300 hover:scale-110"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default Message