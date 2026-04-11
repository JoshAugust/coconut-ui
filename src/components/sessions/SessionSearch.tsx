import { useState, useCallback, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SessionSearchProps {
  onSearch: (query: string) => void
}

export function SessionSearch({ onSearch }: SessionSearchProps) {
  const [query, setQuery] = useState('')

  const debouncedSearch = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>
      return (value: string) => {
        clearTimeout(timer)
        timer = setTimeout(() => onSearch(value), 300)
      }
    })(),
    [onSearch]
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sessions..."
        className="w-full pl-9 pr-8 outline-none rounded-lg"
        style={{
          height: '36px',
          fontSize: '12px',
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)'
          e.target.style.boxShadow = '0 0 0 3px var(--color-primary-muted)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border-subtle)'
          e.target.style.boxShadow = 'none'
        }}
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            padding: '2px',
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
