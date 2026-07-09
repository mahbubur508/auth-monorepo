'use client';

import Link from 'next/link';

type Step = {
  n: number;
  label: string;
};

const STEPS: Step[] = [
  { n: 1, label: 'Register' },
  { n: 2, label: 'Verify' },
  { n: 3, label: 'Access' },
  { n: 4, label: 'Recover' },
];

const ANGLES: Record<number, number> = { 1: 0, 2: 90, 3: 180, 4: 270 };

function Dial({ step }: { step: number }) {
  const angle = ANGLES[step] ?? 0;
  const ticks = Array.from({ length: 24 });

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full">
        <circle cx="80" cy="80" r="76" fill="none" stroke="#282E3A" strokeWidth="1.5" />
        {ticks.map((_, i) => {
          const a = (i / ticks.length) * 360;
          const isMajor = i % 6 === 0;
          const r1 = isMajor ? 62 : 68;
          const r2 = 76;
          const rad = (a * Math.PI) / 180;
          const x1 = 80 + r1 * Math.sin(rad);
          const y1 = 80 - r1 * Math.cos(rad);
          const x2 = 80 + r2 * Math.sin(rad);
          const y2 = 80 - r2 * Math.cos(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? '#8A6C36' : '#282E3A'}
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}
        <circle cx="80" cy="80" r="46" fill="#0B0D11" stroke="#282E3A" strokeWidth="1" />
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '80px 80px', transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
          <line x1="80" y1="80" x2="80" y2="40" stroke="#E3C077" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="40" r="4" fill="#E3C077" />
        </g>
        <circle cx="80" cy="80" r="5" fill="#C99A46" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
        <span className="font-mono text-[10px] tracking-widest2 text-brass">STEP</span>
        <span className="font-display text-2xl text-ivory">0{step}</span>
      </div>
    </div>
  );
}

export function AuthShell({
  step,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  step: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left — dark control panel */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden bg-vault px-8 py-10 lg:w-[42%] lg:px-14 lg:py-16">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: 'radial-gradient(circle, #E3C077 0%, transparent 70%)' }}
        />

        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brass" />
          <span className="font-display text-lg tracking-tight text-ivory">Keystone</span>
        </Link>

        <div className="my-10 flex flex-col gap-8 lg:my-0">
          <Dial step={step} />
          <div>
            <p className="font-mono text-xs tracking-widest2 text-brass">{eyebrow}</p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-ivory lg:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-ivory/60">
              {subtitle}
            </p>
          </div>
        </div>

        <ol className="flex flex-col gap-3">
          {STEPS.map((s) => {
            const state = s.n < step ? 'done' : s.n === step ? 'active' : 'idle';
            return (
              <li key={s.n} className="flex items-center gap-3">
                <span
                  className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px]',
                    state === 'active' && 'bg-brass text-vault-deep',
                    state === 'done' && 'border border-brass/60 text-brass',
                    state === 'idle' && 'border border-vault-line text-ivory/30',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {state === 'done' ? '✓' : `0${s.n}`}
                </span>
                <span
                  className={[
                    'font-body text-sm',
                    state === 'active' && 'text-ivory',
                    state === 'done' && 'text-ivory/60',
                    state === 'idle' && 'text-ivory/30',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Right — ivory form card */}
      <div className="flex w-full flex-1 items-center justify-center bg-ivory px-6 py-14 lg:px-16">
        <div className="w-full max-w-sm animate-rise">
          {children}
          {footer && <div className="mt-8 text-center font-body text-sm text-ink-soft">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
