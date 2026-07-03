/**
 * Block renderers — how each section of the product is composed from Felix
 * primitives. These are the "recipes" the conversation assembles.
 */
import { CSSProperties } from 'react';
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
import { Block } from '../engine/types';

const section: CSSProperties = {
  padding: 'var(--felix-space-8) var(--felix-space-8)',
};

function Navbar() {
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
        Fieldnote
      </span>
      <div style={{ display: 'flex', gap: 'var(--felix-space-4)', alignItems: 'center' }}>
        {['Product', 'Pricing', 'Journal'].map((item) => (
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
        <FButton small>Get started</FButton>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div style={{ ...section, textAlign: 'center', paddingTop: 'calc(var(--felix-space-8) * 1.5)' }}>
      <div style={{ marginBottom: 'var(--felix-space-3)' }}>
        <FBadge>New — shared field journals</FBadge>
      </div>
      <FHeading level={1}>Notes that know where you were</FHeading>
      <div style={{ maxWidth: '52ch', margin: 'var(--felix-space-3) auto var(--felix-space-6)' }}>
        <FText muted>
          Fieldnote is a quiet little notebook for people who work outdoors — it stamps
          every entry with place, weather and light, then gets out of your way.
        </FText>
      </div>
      <div style={{ display: 'flex', gap: 'var(--felix-space-2)', justifyContent: 'center' }}>
        <FButton>Start your journal</FButton>
        <FButton variant="secondary">See it in action</FButton>
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { title: 'Place-aware', body: 'Every note remembers its coordinates, elevation and habitat.' },
    { title: 'Offline first', body: 'Write in the canyon; it syncs when you find a signal.' },
    { title: 'Shareable', body: 'Hand a trail journal to collaborators with one link.' },
  ];
  return (
    <div style={{ ...section, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--felix-space-4)' }}>
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

function Stats() {
  return (
    <div style={{ ...section, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--felix-space-4)' }}>
      <FCard><FStat label="Active journals" value="1,284" delta="+12%" /></FCard>
      <FCard><FStat label="Entries this week" value="9,412" delta="+4%" /></FCard>
      <FCard><FStat label="Places logged" value="317" delta="+9%" /></FCard>
      <FCard><FStat label="Sync failures" value="0.4%" delta="-0.2%" /></FCard>
    </div>
  );
}

function Form() {
  return (
    <div style={{ ...section, display: 'flex', justifyContent: 'center' }}>
      <FCard style={{ width: '100%', maxWidth: 420 }}>
        <FHeading level={2}>Create your account</FHeading>
        <div style={{ display: 'grid', gap: 'var(--felix-space-3)', marginTop: 'var(--felix-space-4)' }}>
          <FInput label="Name" placeholder="Ada Lovelace" />
          <FInput label="Email" placeholder="ada@example.com" type="email" />
          <FInput label="Password" placeholder="••••••••" type="password" />
          <FButton>Sign up</FButton>
          <FText muted small>Free for your first 100 entries. No card required.</FText>
        </div>
      </FCard>
    </div>
  );
}

function Pricing() {
  const tiers = [
    { name: 'Wanderer', price: '$0', blurb: '100 entries, one journal', cta: 'Start free', variant: 'secondary' as const },
    { name: 'Naturalist', price: '$8/mo', blurb: 'Unlimited entries, three journals', cta: 'Go Naturalist', variant: 'primary' as const, featured: true },
    { name: 'Expedition', price: '$24/mo', blurb: 'Teams, exports and priority sync', cta: 'Talk to us', variant: 'secondary' as const },
  ];
  return (
    <div style={{ ...section, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--felix-space-4)', alignItems: 'stretch' }}>
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
              <FButton variant={t.variant}>{t.cta}</FButton>
            </div>
          </div>
        </FCard>
      ))}
    </div>
  );
}

function Testimonial() {
  return (
    <div style={{ ...section, display: 'flex', justifyContent: 'center' }}>
      <FCard style={{ maxWidth: 560, textAlign: 'center' }}>
        <FText>
          “I stopped losing field notes to the bottom of my pack. Fieldnote is the first
          tool that fits the way I actually work outside.”
        </FText>
        <FDivider />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--felix-space-2)' }}>
          <FAvatar initials="RM" />
          <div style={{ textAlign: 'left' }}>
            <FText small>Rae Martinez</FText>
            <FText muted small>Field botanist, Sierra Nevada</FText>
          </div>
        </div>
      </FCard>
    </div>
  );
}

function Table({ block }: { block: Block }) {
  const rows = [
    { entry: 'Granite Pass, dawn survey', place: 'Yosemite NP', status: 'Synced', tone: 'positive' as const },
    { entry: 'Riparian transect #4', place: 'Merced River', status: 'Synced', tone: 'positive' as const },
    { entry: 'Owl call census', place: 'Crane Flat', status: 'Pending', tone: 'warning' as const },
    { entry: 'Meadow bloom photos', place: 'Tuolumne', status: 'Draft', tone: 'neutral' as const },
  ];
  const drift = block.overrides ?? {};
  return (
    <div style={section}>
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
              {['Entry', 'Place', 'Status'].map((h) => (
                <th key={h} style={{ padding: 'var(--felix-space-3) var(--felix-space-4)', borderBottom: '1px solid var(--felix-color-border)', fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.entry}>
                <td style={{ padding: 'var(--felix-space-3) var(--felix-space-4)', borderBottom: '1px solid var(--felix-color-border)', color: 'var(--felix-color-ink)' }}>
                  {r.entry}
                </td>
                <td style={{ padding: 'var(--felix-space-3) var(--felix-space-4)', borderBottom: '1px solid var(--felix-color-border)', color: 'var(--felix-color-muted)' }}>
                  {r.place}
                </td>
                <td style={{ padding: 'var(--felix-space-3) var(--felix-space-4)', borderBottom: '1px solid var(--felix-color-border)' }}>
                  <FBadge tone={r.tone}>{r.status}</FBadge>
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

function Cta() {
  return (
    <div style={{ ...section }}>
      <FCard
        style={{
          background: 'var(--felix-color-primary-soft)',
          borderColor: 'transparent',
          textAlign: 'center',
        }}
      >
        <FHeading level={2}>Take your notebook outside</FHeading>
        <div style={{ margin: 'var(--felix-space-3) 0 var(--felix-space-4)' }}>
          <FText muted>Start free, upgrade when the field does.</FText>
        </div>
        <FButton>Start your journal</FButton>
      </FCard>
    </div>
  );
}

function Footer() {
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
      <FText muted small>© 2026 Fieldnote. Made with Felix.</FText>
      <div style={{ display: 'flex', gap: 'var(--felix-space-3)' }}>
        {['Privacy', 'Terms', 'Contact'].map((l) => (
          <FText key={l} muted small>{l}</FText>
        ))}
      </div>
    </div>
  );
}

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.kind) {
    case 'navbar': return <Navbar />;
    case 'hero': return <Hero />;
    case 'features': return <Features />;
    case 'stats': return <Stats />;
    case 'form': return <Form />;
    case 'pricing': return <Pricing />;
    case 'testimonial': return <Testimonial />;
    case 'table': return <Table block={block} />;
    case 'cta': return <Cta />;
    case 'footer': return <Footer />;
  }
}
