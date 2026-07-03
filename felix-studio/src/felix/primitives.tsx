/**
 * Felix primitives — the component layer of the design system. Every screen
 * on the canvas is composed exclusively from these. They read only token CSS
 * variables (no hard-coded values), which is what lets a conversational token
 * change restyle the entire product at once.
 */
import { CSSProperties, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function FButton({
  children,
  variant = 'primary',
  small,
}: {
  children: ReactNode;
  variant?: Variant;
  small?: boolean;
}) {
  const base: CSSProperties = {
    fontFamily: 'var(--felix-font-body)',
    fontSize: small ? 'var(--felix-text-sm)' : 'var(--felix-text-base)',
    fontWeight: 600,
    padding: small
      ? 'var(--felix-space-1) var(--felix-space-3)'
      : 'var(--felix-space-2) var(--felix-space-4)',
    borderRadius: 'var(--felix-radius)',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'filter 120ms ease',
  };
  const variants: Record<Variant, CSSProperties> = {
    primary: {
      background: 'var(--felix-color-primary)',
      color: 'var(--felix-color-on-primary)',
    },
    secondary: {
      background: 'var(--felix-color-surface)',
      color: 'var(--felix-color-ink)',
      borderColor: 'var(--felix-color-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--felix-color-primary)',
    },
    danger: {
      background: 'var(--felix-color-danger)',
      color: '#FFFFFF',
    },
  };
  return (
    <button type="button" style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

export function FInput({
  label,
  placeholder,
  type = 'text',
}: {
  label?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label style={{ display: 'block' }}>
      {label && (
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--felix-font-body)',
            fontSize: 'var(--felix-text-sm)',
            fontWeight: 600,
            color: 'var(--felix-color-ink)',
            marginBottom: 'var(--felix-space-1)',
          }}
        >
          {label}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        readOnly
        style={{
          width: '100%',
          fontFamily: 'var(--felix-font-body)',
          fontSize: 'var(--felix-text-base)',
          padding: 'var(--felix-space-2) var(--felix-space-3)',
          borderRadius: 'var(--felix-radius)',
          border: '1px solid var(--felix-color-border)',
          background: 'var(--felix-color-surface)',
          color: 'var(--felix-color-ink)',
        }}
      />
    </label>
  );
}

export function FCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: 'var(--felix-color-surface)',
        border: '1px solid var(--felix-color-border)',
        borderRadius: 'var(--felix-radius-lg)',
        boxShadow: 'var(--felix-shadow)',
        padding: 'var(--felix-space-6)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function FBadge({
  children,
  tone = 'primary',
}: {
  children: ReactNode;
  tone?: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
}) {
  const colors: Record<string, string> = {
    primary: 'var(--felix-color-primary)',
    positive: 'var(--felix-color-positive)',
    warning: 'var(--felix-color-warning)',
    danger: 'var(--felix-color-danger)',
    neutral: 'var(--felix-color-muted)',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--felix-font-body)',
        fontSize: 'var(--felix-text-sm)',
        fontWeight: 600,
        color: colors[tone],
        background: 'color-mix(in srgb, currentColor 12%, transparent)',
        padding: 'calc(var(--felix-space-1) * 0.6) var(--felix-space-2)',
        borderRadius: 'var(--felix-radius-full)',
      }}
    >
      {children}
    </span>
  );
}

export function FHeading({
  children,
  level = 1,
}: {
  children: ReactNode;
  level?: 1 | 2 | 3;
}) {
  const sizes = {
    1: 'var(--felix-text-3xl)',
    2: 'var(--felix-text-2xl)',
    3: 'var(--felix-text-xl)',
  };
  const Tag = (`h${level}`) as 'h1' | 'h2' | 'h3';
  return (
    <Tag
      style={{
        fontFamily: 'var(--felix-font-display)',
        fontSize: sizes[level],
        fontWeight: 600,
        color: 'var(--felix-color-ink)',
        lineHeight: 1.15,
        margin: 0,
      }}
    >
      {children}
    </Tag>
  );
}

export function FText({
  children,
  muted,
  small,
}: {
  children: ReactNode;
  muted?: boolean;
  small?: boolean;
}) {
  return (
    <p
      style={{
        fontFamily: 'var(--felix-font-body)',
        fontSize: small ? 'var(--felix-text-sm)' : 'var(--felix-text-base)',
        color: muted ? 'var(--felix-color-muted)' : 'var(--felix-color-ink)',
        lineHeight: 1.6,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

export function FDivider() {
  return (
    <hr
      style={{
        border: 0,
        borderTop: '1px dashed var(--felix-color-border)',
        margin: 'var(--felix-space-4) 0',
      }}
    />
  );
}

export function FAvatar({ initials }: { initials: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'calc(var(--felix-space-8) * 1.1)',
        height: 'calc(var(--felix-space-8) * 1.1)',
        borderRadius: 'var(--felix-radius-full)',
        background: 'var(--felix-color-primary-soft)',
        color: 'var(--felix-color-primary)',
        fontFamily: 'var(--felix-font-body)',
        fontWeight: 700,
        fontSize: 'var(--felix-text-sm)',
      }}
    >
      {initials}
    </span>
  );
}

export function FStat({ label, value, delta }: { label: string; value: string; delta?: string }) {
  const positive = delta && !delta.startsWith('-');
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--felix-font-body)',
          fontSize: 'var(--felix-text-sm)',
          color: 'var(--felix-color-muted)',
          marginBottom: 'var(--felix-space-1)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--felix-font-display)',
          fontSize: 'var(--felix-text-2xl)',
          fontWeight: 600,
          color: 'var(--felix-color-ink)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          style={{
            fontFamily: 'var(--felix-font-body)',
            fontSize: 'var(--felix-text-sm)',
            fontWeight: 600,
            color: positive ? 'var(--felix-color-positive)' : 'var(--felix-color-danger)',
            marginTop: 'var(--felix-space-1)',
          }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
