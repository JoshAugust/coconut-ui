// Coconut — Markdown Renderer
// Wraps react-markdown with remark-gfm and rehype-highlight

import React, { useCallback, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Check, Copy } from 'lucide-react'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') || ''
  const code = String(children).replace(/\n$/, '')

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="relative group my-3">
      {language && (
        <div
          className="absolute top-0 left-0 px-3 py-1 text-xs rounded-br-lg"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text-muted)',
          }}
        >
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text-secondary)',
        }}
        title="Copy code"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre
        className={className}
        style={{
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          paddingTop: language ? '2rem' : '1rem',
          overflowX: 'auto',
          fontSize: '0.875rem',
          lineHeight: '1.6',
        }}
      >
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}

const components: Components = {
  code({ className, children, ...props }) {
    const isBlock = className?.startsWith('language-') || String(children).includes('\n')
    if (isBlock) {
      return <CodeBlock className={className}>{children}</CodeBlock>
    }
    return (
      <code
        style={{
          background: 'var(--color-bg-tertiary)',
          padding: '0.15em 0.4em',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-primary)',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '0.875em',
        }}
        {...props}
      >
        {children}
      </code>
    )
  },
  a({ href, children, ...props }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
        {...props}
      >
        {children}
      </a>
    )
  },
  img({ src, alt, ...props }) {
    return (
      <img
        src={src}
        alt={alt || ''}
        style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', margin: '0.5rem 0' }}
        loading="lazy"
        {...props}
      />
    )
  },
  table({ children, ...props }) {
    return (
      <div className="overflow-x-auto my-3" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }} {...props}>
          {children}
        </table>
      </div>
    )
  },
  th({ children, ...props }) {
    return (
      <th
        className="px-3 py-2 text-left text-xs font-semibold"
        style={{
          backgroundColor: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-secondary)',
          borderBottom: '1px solid var(--color-border)',
        }}
        {...props}
      >
        {children}
      </th>
    )
  },
  td({ children, ...props }) {
    return (
      <td
        className="px-3 py-2"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        {...props}
      >
        {children}
      </td>
    )
  },
  blockquote({ children, ...props }) {
    return (
      <blockquote
        className="my-2 pl-4 italic"
        style={{
          borderLeft: '3px solid var(--color-primary)',
          color: 'var(--color-text-secondary)',
        }}
        {...props}
      >
        {children}
      </blockquote>
    )
  },
  h1({ children, ...props }) {
    return <h1 className="text-xl font-bold mt-4 mb-2" style={{ color: 'var(--color-text-primary)' }} {...props}>{children}</h1>
  },
  h2({ children, ...props }) {
    return <h2 className="text-lg font-semibold mt-3 mb-1.5" style={{ color: 'var(--color-text-primary)' }} {...props}>{children}</h2>
  },
  h3({ children, ...props }) {
    return <h3 className="text-base font-semibold mt-2 mb-1" style={{ color: 'var(--color-text-primary)' }} {...props}>{children}</h3>
  },
  ul({ children, ...props }) {
    return <ul className="list-disc pl-5 my-1.5 space-y-0.5" {...props}>{children}</ul>
  },
  ol({ children, ...props }) {
    return <ol className="list-decimal pl-5 my-1.5 space-y-0.5" {...props}>{children}</ol>
  },
  p({ children, ...props }) {
    return <p className="my-1.5 leading-relaxed" {...props}>{children}</p>
  },
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className} style={{ color: 'var(--color-text-primary)' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
