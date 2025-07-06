const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`flex justify-center items-center py-8 ${className}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-primary`}></div>
    </div>
  )
}

export default Loader