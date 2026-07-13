import React, { useState, useMemo } from 'react';

// ---- Design tokens (liquid glass / Apple-inspired) ----
const T = {
  bg: 'radial-gradient(circle at 20% 0%, #FBF7EF 0%, #F3ECDF 45%, #E9DFCC 100%)',
  glass: 'rgba(255,255,255,0.58)',
  glassBorder: 'rgba(28,27,24,0.10)',
  glassBorderHi: 'rgba(28,27,24,0.24)',
  text: '#1C1B18',
  textDim: '#6E6A61',
  signal: '#013E37',   // grounded / verified — matches brand green
  amber: '#B4832E',    // needs review
  coral: '#A8503B',    // risk / gap
  blue: '#013E37',     // primary accent — deep pine green
  butter: '#FFEFB3',   // warm highlight accent (sparing use)
  ink: '#1C1B18',      // pure ink, for phone bezel / high-contrast chrome only
};

function GlassCard({ children, style = {}, className = '' }) {
  return (
    <div
      className={className}
      style={{
        background: T.glass,
        border: `1px solid ${T.glassBorder}`,
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderRadius: 20,
        boxShadow: '0 8px 28px rgba(28,27,24,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, suffix = '', sourceNote }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <label style={{ fontSize: 13, color: T.textDim, fontWeight: 500, letterSpacing: 0.2 }}>{label}</label>
        <span style={{ fontSize: 15, color: T.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{
          width: '100%',
          accentColor: T.blue,
          height: 4,
          cursor: 'pointer',
        }}
      />
      {sourceNote && (
        <div style={{ fontSize: 11, color: 'rgba(141,150,168,0.7)', marginTop: 6, lineHeight: 1.4 }}>
          {sourceNote}
        </div>
      )}
    </div>
  );
}

function StatChip({ value, label, tone = T.blue }) {
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: tone, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 4, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function fmtINRCr(n) {
  // n in rupees -> crore, 1 crore = 10,000,000
  const cr = n / 1e7;
  if (cr >= 100) return `₹${(cr / 100).toFixed(2)} Arab`;
  return `₹${cr.toFixed(2)} Cr`;
}
function fmtHours(n) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function ImpactCalculator() {
  // --- Inputs, defaults anchored to the cited problem-statement stats ---
  const [headcount, setHeadcount] = useState(400);           // technicians/engineers who search for info
  const [hourlyCost, setHourlyCost] = useState(900);         // fully loaded INR/hr
  const [searchTimePct, setSearchTimePct] = useState(35);    // McKinsey 2024: 35% of working hours
  const [searchReductionPct, setSearchReductionPct] = useState(40); // assumption, adjustable

  const [downtimeHoursYear, setDowntimeHoursYear] = useState(1200); // plant unplanned downtime hrs/yr
  const [costPerDowntimeHour, setCostPerDowntimeHour] = useState(250000); // INR/hr, adjustable
  const [fragmentationPct, setFragmentationPct] = useState(20); // BIS Research: 18-22% attributable to fragmentation
  const [fragReductionPct, setFragReductionPct] = useState(35); // assumption, adjustable

  const workingHoursYear = 2080;

  const searchSavingsINR = useMemo(() => {
    const hoursSearchingPerPerson = workingHoursYear * (searchTimePct / 100);
    const hoursRecoveredPerPerson = hoursSearchingPerPerson * (searchReductionPct / 100);
    return hoursRecoveredPerPerson * hourlyCost * headcount;
  }, [headcount, hourlyCost, searchTimePct, searchReductionPct]);

  const downtimeSavingsINR = useMemo(() => {
    const fragAttributedHours = downtimeHoursYear * (fragmentationPct / 100);
    const hoursAvoided = fragAttributedHours * (fragReductionPct / 100);
    return hoursAvoided * costPerDowntimeHour;
  }, [downtimeHoursYear, costPerDowntimeHour, fragmentationPct, fragReductionPct]);

  const totalSavings = searchSavingsINR + downtimeSavingsINR;
  const hoursRecoveredTotal = (workingHoursYear * (searchTimePct / 100) * (searchReductionPct / 100)) * headcount;

  return (
    <div
      style={{
        minHeight: '100%',
        background: T.bg,
        padding: '28px 18px 40px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Inter, sans-serif",
        color: T.text,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11.5, color: T.blue, letterSpacing: 0.6, fontWeight: 600,
            textTransform: 'uppercase', marginBottom: 10,
            background: `${T.butter}66`, border: `1px solid ${T.butter}`,
            padding: '5px 12px 5px 10px', borderRadius: 999,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: T.signal }} />
            Business Impact Model — illustrative, evidence-anchored
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6, margin: 0, lineHeight: 1.15 }}>
            What fragmented industrial knowledge is actually costing you
          </h1>
          <p style={{ color: T.textDim, fontSize: 14.5, marginTop: 10, lineHeight: 1.6, maxWidth: 620 }}>
            Defaults are drawn from the cited problem-statement research (McKinsey, NASSCOM-EY, BIS Research).
            Adjust every slider to your own plant's numbers before presenting — treat this as a model to defend
            with your own data, not a guaranteed figure.
          </p>
        </div>

        {/* Top-line result */}
        <GlassCard style={{ padding: '26px 24px', marginBottom: 20, background: `linear-gradient(135deg, ${T.butter}40, ${T.glass})`, borderColor: `${T.butter}` }}>
          <div style={{ fontSize: 12.5, color: T.textDim, fontWeight: 500, marginBottom: 6 }}>
            Estimated annual value unlocked
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1, color: T.text, lineHeight: 1 }}>
            {fmtINRCr(totalSavings)}
            <span style={{ fontSize: 15, color: T.textDim, fontWeight: 500, marginLeft: 10 }}>/ year</span>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 22, flexWrap: 'wrap', borderTop: `1px solid ${T.glassBorder}`, paddingTop: 20 }}>
            <StatChip value={fmtINRCr(searchSavingsINR)} label="from reclaimed search / rework time" tone={T.blue} />
            <StatChip value={fmtINRCr(downtimeSavingsINR)} label="from avoided fragmentation-driven downtime" tone={T.signal} />
            <StatChip value={`${fmtHours(hoursRecoveredTotal)} hrs`} label="engineer/technician hours recovered per year" tone={T.amber} />
          </div>
        </GlassCard>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {/* Search time card */}
          <GlassCard style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Time lost searching &amp; recreating</h2>
            <p style={{ fontSize: 12.5, color: T.textDim, margin: '0 0 18px', lineHeight: 1.5 }}>
              McKinsey (2024): professionals in asset-intensive industries spend ~35% of working hours
              searching for information or recreating existing documents.
            </p>
            <Slider label="Technicians / engineers covered" value={headcount} min={20} max={5000} step={20}
              onChange={setHeadcount} />
            <Slider label="Fully-loaded cost per hour" value={hourlyCost} min={200} max={3000} step={50}
              onChange={setHourlyCost} suffix=" ₹/hr" />
            <Slider label="Share of time spent searching / clarifying" value={searchTimePct} min={10} max={50} step={1}
              onChange={setSearchTimePct} suffix="%" sourceNote="Default 35% — McKinsey 2024 global survey, asset-intensive industries." />
            <Slider label="Assumed reduction with unified knowledge layer" value={searchReductionPct} min={10} max={70} step={5}
              onChange={setSearchReductionPct} suffix="%" sourceNote="Your assumption — not sourced from the PS; keep conservative for a defensible pitch." />
          </GlassCard>

          {/* Downtime card */}
          <GlassCard style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Unplanned downtime from fragmentation</h2>
            <p style={{ fontSize: 12.5, color: T.textDim, margin: '0 0 18px', lineHeight: 1.5 }}>
              BIS Research: document/system fragmentation contributes to 18–22% of unplanned downtime
              events in Indian heavy industry.
            </p>
            <Slider label="Total unplanned downtime hours / year" value={downtimeHoursYear} min={50} max={8000} step={50}
              onChange={setDowntimeHoursYear} suffix=" hrs" />
            <Slider label="Cost per downtime hour" value={costPerDowntimeHour} min={10000} max={2000000} step={10000}
              onChange={setCostPerDowntimeHour} suffix=" ₹/hr" sourceNote="Plant/line-specific — pull from your own outage cost data if available." />
            <Slider label="Share attributable to fragmentation" value={fragmentationPct} min={5} max={30} step={1}
              onChange={setFragmentationPct} suffix="%" sourceNote="Default 20% — midpoint of BIS Research's 18–22% range." />
            <Slider label="Assumed reduction with unified knowledge layer" value={fragReductionPct} min={10} max={70} step={5}
              onChange={setFragReductionPct} suffix="%" sourceNote="Your assumption — not sourced from the PS; keep conservative for a defensible pitch." />
          </GlassCard>
        </div>

        {/* Context strip */}
        <GlassCard style={{ padding: '18px 22px', marginTop: 18 }}>
          <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.7 }}>
            <strong style={{ color: T.text }}>Additional context, not modeled numerically above:</strong> the
            average large Indian plant operates across 7–12 disconnected document systems (NASSCOM-EY), and an
            estimated 25% of India's experienced industrial engineers and operators will retire within the next
            decade, taking undocumented operational knowledge with them (problem-statement context). Consider
            citing these as the *why now* framing in your pitch, separate from the quantified model above.
          </div>
        </GlassCard>

        <div style={{ fontSize: 11, color: 'rgba(141,150,168,0.6)', marginTop: 16, textAlign: 'center' }}>
          Not financial advice — an illustrative planning model for your pitch deck. Validate assumptions against
          your own plant data before presenting hard numbers to judges or stakeholders.
        </div>
      </div>
    </div>
  );
}
