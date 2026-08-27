// Shared button.
//
// Three things were wrong before:
//  * `primary` was blue-600 while every page-level action in the app is
//    indigo-600 (8 files do it by hand), so the shared component was the
//    off-brand outlier.
//  * `ghost` was used on the landing page but never defined here, so
//    `variants[variant]` was undefined and that button rendered with no styling
//    at all.
//  * The base wasn't a flex container, so an icon passed as a child sat on the
//    text baseline instead of centred beside it.
export function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:shadow-none ' +
    'disabled:translate-y-0 whitespace-nowrap'

  const variants = {
    primary:
      'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 ' +
      'hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 ' +
      'focus-visible:ring-indigo-500 disabled:bg-slate-300 disabled:text-slate-500',
    secondary:
      'bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 ' +
      'hover:border-slate-400 hover:-translate-y-0.5 active:translate-y-0 ' +
      'focus-visible:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200',
    // Was missing entirely — used by "My Resumes" in the landing nav.
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 ' +
      'focus-visible:ring-slate-400 disabled:text-slate-300',
    outline:
      'border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 ' +
      'focus-visible:ring-slate-400 disabled:border-slate-200 disabled:text-slate-400',
    danger:
      'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 ' +
      'disabled:bg-slate-300 disabled:text-slate-500',
    success:
      'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500 ' +
      'disabled:bg-slate-300 disabled:text-slate-500',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  }

  // An unknown variant used to render an unstyled button; fall back visibly
  // instead, and say so in dev.
  const variantStyles = variants[variant] ?? variants.primary
  if (import.meta.env.DEV && !variants[variant]) {
    console.warn(`[Button] unknown variant "${variant}" — falling back to primary.`)
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizes[size] ?? sizes.md} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
