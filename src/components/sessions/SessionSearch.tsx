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
        className="absolute left-2.5 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--color-text-muted)' }}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sessions..."
        className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md outline-none"
        style={{
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-subtle)')}
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
