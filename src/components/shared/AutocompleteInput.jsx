import { useState, useRef, useEffect } from 'react'

// Text input with as-you-type suggestions from a local list. Fully controlled
// (value/onChange like a normal input) plus an optional onSelect when a
// suggestion is picked. Supports ↑/↓ to navigate, Enter to choose, Esc to close.
// Falls through to the caller's onKeyDown when not handling a dropdown key, so
// existing behaviours (e.g. Enter-to-add) keep working when nothing is highlighted.
export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder,
  className,
  wrapperClassName = '',
  onKeyDown,
  type = 'text',
  maxItems = 8,
}) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapRef = useRef(null)

  const raw = (value || '').trim()
  const q = raw.toLowerCase()
  const matches = q
    ? suggestions
        // match case-insensitively, but still surface a suggestion that only
        // differs in capitalization (e.g. typing "java" → suggests "Java")
        .filter((s) => s.toLowerCase().includes(q) && s !== raw)
        .slice(0, maxItems)
    : []

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const choose = (s) => {
    onChange(s)
    onSelect?.(s)
    setOpen(false)
    setHighlight(-1)
  }

  const handleKeyDown = (e) => {
    if (open && matches.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlight((h) => Math.min(h + 1, matches.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlight((h) => Math.max(h - 1, 0))
        return
      }
      if (e.key === 'Enter' && highlight >= 0) {
        e.preventDefault()
        choose(matches[highlight])
        return
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setHighlight(-1)
        return
      }
    }
    onKeyDown?.(e)
  }

  return (
    <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHighlight(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-auto py-1">
          {matches.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                // onMouseDown (not onClick) so selection happens before the input blur closes the list
                onMouseDown={(e) => {
                  e.preventDefault()
                  choose(s)
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  i === highlight ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
