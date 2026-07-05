/**
 * Block renderers — how each section of the product is composed from Felix
 * primitives. Fully props-driven: every visible string comes from block.props
 * (written by the copywriter or the designer), never from code. Renderers are
 * surface-aware: the same block adapts its layout between web and native.
 */
import { CSSProperties } from 'react';
import { Home, Menu, Search, User } from 'lucide-react';
import {
  FAvatar,
  FBadge,
  FButton,
  FCard,
  FDivider,
  FHeading,
  FInput,
  FStat,
  FText,
} from '../felix/primitives';
import { Block, SurfaceType } from '../engine/types';

type RenderCtx = { surface: Exclude<SurfaceType, 'chat'> };

function pad(ctx: RenderCtx): CSSProperties {
  return ctx.surface === 'native'
    ? { padding: 'var(--felix-space-6) var(--felix-space-4)' }
    : { padding: 'var(--felix-space-8) var(--felix-space-8)' };
}

function Navbar({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const p = block.props;
  if (ctx.surface === 'native') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--felix-space-3) var(--felix-space-4)',
          borderBottom: '1px solid var(--felix-color-border)',
          background: 'var(--felix-color-surface)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--felix-font-display)',
            fontWeight: 700,
            fontSize: 'var(--felix-text-lg)',
            color: 'var(--felix-color-ink)',
          }}
        >
          {p.brand}
        </span>
        <Menu size={18} style={{ color: 'var(--felix-color-muted)' }} />
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--felix-space-3) var(--felix-space-8)',
        borderBottom: '1px solid var(--felix-color-border)',
        background: 'var(--felix-color-surface)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--felix-font-display)',
          fontWeight: 700,
          fontSize: 'var(--felix-text-lg)',
          color: 'var(--felix-color-ink)',
        }}
      >
        {p.brand}
      </span>
      <div style={{ display: 'flex', gap: 'var(--felix-space-4)', alignItems: 'center' }}>
        {(p.links ?? []).map((item) => (
          <span
            key={item}
            style={{
              fontFamily: 'var(--felix-font-body)',
              fontSize: 'var(--felix-text-sm)',
              color: 'var(--felix-color-muted)',
            }}
          >
            {item}
          </span>
        ))}
        {p.ctaLabel && <FButton small>{p.ctaLabel}</FButton>}
      </div>
    </div>
  );
}

function Hero({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const p = block.props;
  return (
    <div style={{ ...pad(ctx), textAlign: 'center', paddingTop: 'calc(var(--felix-space-8) * 1.5)' }}>
      {p.badge && (
        <div style={{ marginBottom: 'var(--felix-space-3)' }}>
          <FBadge>{p.badge}</FBadge>
        </div>
      )}
      <FHeading level={1}>{p.headline}</FHeading>
      <div style={{ maxWidth: '52ch', margin: 'var(--felix-space-3) auto var(--felix-space-6)' }}>
        <FText muted>{p.subhead}</FText>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--felix-space-2)',
          justifyContent: 'center',
          flexDirection: ctx.surface === 'native' ? 'column' : 'row',
          alignItems: 'center',
        }}
      >
        {p.primaryCta && <FButton>{p.primaryCta}</FButton>}
        {p.secondaryCta && <FButton variant="secondary">{p.secondaryCta}</FButton>}
      </div>
    </div>
  );
}

function Features({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const items = block.props.items ?? [];
  return (
    <div
      style={{
        ...pad(ctx),
        display: 'grid',
        gridTemplateColumns: ctx.surface === 'native' ? '1fr' : `repeat(${Math.min(3, items.length || 1)}, 1fr)`,
        gap: 'var(--felix-space-4)',
      }}
    >
      {items.map((f) => (
        <FCard key={f.title}>
          <FHeading level={3}>{f.title}</FHeading>
          <div style={{ marginTop: 'var(--felix-space-2)' }}>
            <FText muted small>{f.body}</FText>
          </div>
        </FCard>
      ))}
    </div>
  );
}

function Stats({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const stats = block.props.stats ?? [];
  return (
    <div
      style={{
        ...pad(ctx),
        display: 'grid',
        gridTemplateColumns: ctx.surface === 'native' ? 'repeat(2, 1fr)' : `repeat(${Math.min(4, stats.length || 1)}, 1fr)`,
        gap: 'var(--felix-space-4)',
      }}
    >
      {stats.map((s) => (
        <FCard key={s.label} style={ctx.surface === 'native' ? { padding: 'var(--felix-space-4)' } : undefined}>
          <FStat label={s.label} value={s.value} delta={s.delta} />
        </FCard>
      ))}
    </div>
  );
}

function Form({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const p = block.props;
  return (
    <div style={{ ...pad(ctx), display: 'flex', justifyContent: 'center' }}>
      <FCard style={{ width: '100%', maxWidth: 420 }}>
        <FHeading level={2}>{p.title}</FHeading>
        <div style={{ display: 'grid', gap: 'var(--felix-space-3)', marginTop: 'var(--felix-space-4)' }}>
          {(p.fields ?? []).map((f) => (
            <FInput key={f.label} label={f.label} placeholder={f.placeholder} type={f.type ?? 'text'} />
          ))}
          <FButton>{p.submitLabel ?? 'Submit'}</FButton>
          {p.footnote && <FText muted small>{p.footnote}</FText>}
        </div>
      </FCard>
    </div>
  );
}

function Pricing({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const tiers = block.props.tiers ?? [];
  return (
    <div
      style={{
        ...pad(ctx),
        display: 'grid',
        gridTemplateColumns: ctx.surface === 'native' ? '1fr' : `repeat(${Math.min(3, tiers.length || 1)}, 1fr)`,
        gap: 'var(--felix-space-4)',
        alignItems: 'stretch',
      }}
    >
      {tiers.map((t) => (
        <FCard
          key={t.name}
          style={t.featured ? { borderColor: 'var(--felix-color-primary)', borderWidth: 2 } : undefined}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--felix-space-2)', height: '100%' }}>
            {t.featured && <div><FBadge>Most popular</FBadge></div>}
            <FHeading level={3}>{t.name}</FHeading>
            <div style={{ fontFamily: 'var(--felix-font-display)', fontSize: 'var(--felix-text-2xl)', color: 'var(--felix-color-ink)' }}>
              {t.price}
            </div>
            <FText muted small>{t.blurb}</FText>
            <div style={{ marginTop: 'auto', paddingTop: 'var(--felix-space-3)' }}>
              <FButton variant={t.featured ? 'primary' : 'secondary'}>{t.cta}</FButton>
            </div>
          </div>
        </FCard>
      ))}
    </div>
  );
}

function Testimonial({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const p = block.props;
  const initials = (p.author ?? 'A A')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div style={{ ...pad(ctx), display: 'flex', justifyContent: 'center' }}>
      <FCard style={{ maxWidth: 560, textAlign: 'center' }}>
        <FText>{p.quote}</FText>
        <FDivider />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--felix-space-2)' }}>
          <FAvatar initials={initials} />
          <div style={{ textAlign: 'left' }}>
            <FText small>{p.author}</FText>
            <FText muted small>{p.role}</FText>
          </div>
        </div>
      </FCard>
    </div>
  );
}

function Table({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const p = block.props;
  const drift = block.overrides ?? {};
  const columns = p.columns ?? [];
  const rows = p.rows ?? [];

  if (ctx.surface === 'native') {
    // Tables become stacked cards on a phone.
    return (
      <div style={{ ...pad(ctx), display: 'grid', gap: 'var(--felix-space-2)' }}>
        {rows.map((r, i) => (
          <FCard key={i} style={{ padding: 'var(--felix-space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--felix-space-2)' }}>
              <div>
                <FText small>{r.cells[0]}</FText>
                <FText muted small>{r.cells.slice(1).join(' · ')}</FText>
              </div>
              {r.badge && <FBadge tone={r.badge.tone}>{r.badge.label}</FBadge>}
            </div>
          </FCard>
        ))}
      </div>
    );
  }

  return (
    <div style={pad(ctx)}>
      <FCard
        style={{
          padding: 0,
          overflow: 'hidden',
          ...(drift.background ? { background: drift.background } : {}),
          ...(drift.radius !== undefined ? { borderRadius: drift.radius } : {}),
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--felix-font-body)', fontSize: 'var(--felix-text-sm)' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--felix-color-muted)' }}>
              {columns.map((h) => (
                <th key={h} style={{ padding: 'var(--felix-space-3) var(--felix-space-4)', borderBottom: '1px solid var(--felix-color-border)', fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.cells.map((c, j) => (
                  <td
                    key={j}
                    style={{
                      padding: 'var(--felix-space-3) var(--felix-space-4)',
                      borderBottom: '1px solid var(--felix-color-border)',
                      color: j === 0 ? 'var(--felix-color-ink)' : 'var(--felix-color-muted)',
                    }}
                  >
                    {c}
                  </td>
                ))}
                <td style={{ padding: 'var(--felix-space-3) var(--felix-space-4)', borderBottom: '1px solid var(--felix-color-border)' }}>
                  {r.badge && <FBadge tone={r.badge.tone}>{r.badge.label}</FBadge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FCard>
      {block.overrides && (
        <div
          style={{
            marginTop: 'var(--felix-space-2)',
            fontFamily: 'var(--felix-font-body)',
            fontSize: 'var(--felix-text-sm)',
            color: 'var(--felix-color-warning)',
          }}
        >
          ⚠ This block carries hard-coded overrides — run an audit or say “fix drift”.
        </div>
      )}
    </div>
  );
}

function Cta({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const p = block.props;
  return (
    <div style={pad(ctx)}>
      <FCard
        style={{
          background: 'var(--felix-color-primary-soft)',
          borderColor: 'transparent',
          textAlign: 'center',
        }}
      >
        <FHeading level={2}>{p.headline}</FHeading>
        <div style={{ margin: 'var(--felix-space-3) 0 var(--felix-space-4)' }}>
          <FText muted>{p.subhead}</FText>
        </div>
        {p.primaryCta && <FButton>{p.primaryCta}</FButton>}
      </FCard>
    </div>
  );
}

function Footer({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const p = block.props;
  if (ctx.surface === 'native') {
    // A footer on a phone is a tab bar.
    const tabs = [
      { icon: Home, label: 'Home' },
      { icon: Search, label: 'Browse' },
      { icon: User, label: 'Account' },
    ];
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: 'var(--felix-space-2) var(--felix-space-4)',
          borderTop: '1px solid var(--felix-color-border)',
          background: 'var(--felix-color-surface)',
        }}
      >
        {tabs.map(({ icon: Icon, label }, i) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Icon size={18} style={{ color: i === 0 ? 'var(--felix-color-primary)' : 'var(--felix-color-muted)' }} />
            <span
              style={{
                fontFamily: 'var(--felix-font-body)',
                fontSize: '10px',
                color: i === 0 ? 'var(--felix-color-primary)' : 'var(--felix-color-muted)',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        padding: 'var(--felix-space-6) var(--felix-space-8)',
        borderTop: '1px solid var(--felix-color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <FText muted small>{p.fineprint}</FText>
      <div style={{ display: 'flex', gap: 'var(--felix-space-3)' }}>
        {(p.links ?? []).map((l) => (
          <FText key={l} muted small>{l}</FText>
        ))}
      </div>
    </div>
  );
}

export function BlockRenderer({ block, surface = 'web' }: { block: Block; surface?: SurfaceType }) {
  const ctx: RenderCtx = { surface: surface === 'chat' ? 'web' : surface };
  switch (block.kind) {
    case 'navbar': return <Navbar block={block} ctx={ctx} />;
    case 'hero': return <Hero block={block} ctx={ctx} />;
    case 'features': return <Features block={block} ctx={ctx} />;
    case 'stats': return <Stats block={block} ctx={ctx} />;
    case 'form': return <Form block={block} ctx={ctx} />;
    case 'pricing': return <Pricing block={block} ctx={ctx} />;
    case 'testimonial': return <Testimonial block={block} ctx={ctx} />;
    case 'table': return <Table block={block} ctx={ctx} />;
    case 'cta': return <Cta block={block} ctx={ctx} />;
    case 'footer': return <Footer block={block} ctx={ctx} />;
  }
}
