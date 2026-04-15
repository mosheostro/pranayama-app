interface DanaMethod { id: string; label: string; value: string; href: string; }
interface DanaPanelProps { title: string; body: string; methods: DanaMethod[]; }

export function DanaPanel({ title, body, methods }: DanaPanelProps) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 16, paddingBottom: 32 }}>
      {/* Heart icon */}
      <div className="font-serif" style={{ fontSize: '3.5rem', color: 'var(--accent)', marginBottom: 16, lineHeight: 1 }}>♡</div>

      <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
        {title}
      </h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: '0 auto 24px' }}>
        {body}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {methods.map(m => (
          <a key={m.id} href={m.href}
            target={m.href.startsWith('http') ? '_blank' : undefined}
            rel={m.href.startsWith('http') ? 'noreferrer' : undefined}
            style={{
              padding: '14px 18px',
              borderRadius: 14,
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              boxShadow: 'var(--shadow)',
              transition: 'opacity .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--muted)', fontWeight: 600 }}>
              {m.label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
              {m.value}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
