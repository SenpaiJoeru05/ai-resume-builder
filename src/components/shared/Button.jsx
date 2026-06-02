export function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
  const baseStyles = 'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed',
    outline: 'border-2 border-slate-300 text-slate-700 hover:border-slate-400 focus:ring-slate-500 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
