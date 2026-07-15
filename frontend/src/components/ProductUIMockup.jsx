import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, ShieldAlert, Search, Mic, ChevronRight, X, Smartphone, Monitor } from 'lucide-react';

const T = {
  bg: 'radial-gradient(circle at 15% -10%, #FBF7EF 0%, #F3ECDF 55%, #E9DFCC 100%)',
  glass: 'rgba(255,255,255,0.58)',
  glassStrong: 'rgba(255,255,255,0.8)',
  border: 'rgba(28,27,24,0.10)',
  borderHi: 'rgba(28,27,24,0.24)',
  text: '#1C1B18',
  dim: '#6E6A61',
  signal: '#013E37',   // grounded / verified — matches brand green
  amber: '#B4832E',
  coral: '#A8503B',
  blue: '#013E37',     // primary accent — deep pine green
  butter: '#FFEFB3',   // warm highlight accent (sparing use)
  ink: '#1C1B18',      // pure ink, for phone bezel / high-contrast chrome only
};

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Inter, sans-serif";

function Glass({ children, style = {}, strong = false }) {
  return (
    <div style={{
      background: strong ? T.glassStrong : T.glass,
      border: `1px solid ${T.border}`,
      backdropFilter: 'blur(22px) saturate(160%)',
      WebkitBackdropFilter: 'blur(22px) saturate(160%)',
      borderRadius: 18,
      boxShadow: '0 6px 20px rgba(28,27,24,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function ConfidenceBadge({ level }) {
  const map = {
    high: { color: T.signal, label: 'High confidence', icon: <CheckCircle2 size={13} /> },
    review: { color: T.amber, label: 'Needs review', icon: <AlertTriangle size={13} /> },
  };
  const s = map[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, color: s.color,
      background: `${s.color}1A`, border: `1px solid ${s.color}40`,
      padding: '3px 9px', borderRadius: 999,
    }}>
      {s.icon}{s.label}
    </span>
  );
}

function CitationChip({ doc, page, onClick, active }) {
  return (
    <button
      onClick={onClick}
      aria-label={`View source: ${doc}, page ${page}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11.5, color: active ? '#fff' : T.dim,
        background: active ? `${T.blue}14` : 'rgba(28,27,24,0.045)',
        border: `1px solid ${active ? T.blue : T.border}`,
        padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        transition: 'all 0.15s ease',
      }}
    >
      <FileText size={11} />{doc} · p.{page}
    </button>
  );
}

const SOURCE_DETAIL = {
  'P&ID-204-Rev3': { text: '"...pump P-204 discharge pressure trip setpoint revised to 8.4 bar per vendor bulletin VB-2291..."', date: 'Rev 3, Mar 2025' },
  'WO-88213': { text: '"...bearing housing overheating, replaced DE bearing, verified alignment within 0.05mm..."', date: 'Closed, 14 Jan 2026' },
  'Tribal note — R. Iyer': { text: '"...if it trips again within a week after bearing change, check the coupling grease — that\'s what actually got it last time, not the bearing."', date: 'Logged, 2 Feb 2026' },
};

function MobileView() {
  const [activeCitation, setActiveCitation] = useState(null);
  const [approvalState, setApprovalState] = useState('pending');

  return (
    <div style={{
      width: 340, borderRadius: 44, padding: 10,
      background: 'linear-gradient(160deg, #3c3c3c, #161616)',
      boxShadow: '0 30px 60px rgba(28,27,24,0.28)',
    }}>
      <div style={{
        borderRadius: 34, overflow: 'hidden', background: T.bg,
        height: 660, display: 'flex', flexDirection: 'column',
        fontFamily: FONT, color: T.text,
      }}>
        {/* Status bar */}
        <div style={{ padding: '14px 20px 8px', fontSize: 12, color: T.dim, display: 'flex', justifyContent: 'space-between' }}>
          <span>9:41</span><span>Plant Floor · Unit 4</span>
        </div>

        <div style={{ padding: '4px 18px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Ask the Asset Brain</div>
          <div style={{ fontSize: 12, color: T.dim, marginTop: 2 }}>Cited answers · works offline-first</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* User query bubble */}
          <div style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
            <Glass style={{ padding: '10px 14px', background: `${T.blue}0F`, border: `1px solid ${T.blue}28` }}>
              <span style={{ fontSize: 13.5 }}>Pump P-204 tripped again — what fixed it last time?</span>
            </Glass>
          </div>

          {/* Answer card */}
          <Glass strong style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.4 }}>Answer</span>
              <ConfidenceBadge level="high" />
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: '0 0 12px' }}>
              Last trip (14 Jan) was a DE bearing overheat, resolved by bearing replacement + alignment check.
              A technician's field note flags that if it trips again within a week, check the <strong>coupling
              grease</strong> — that was the real cause last time, not the bearing itself.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <CitationChip doc="WO-88213" page="1" active={activeCitation === 'WO-88213'}
                onClick={() => setActiveCitation(activeCitation === 'WO-88213' ? null : 'WO-88213')} />
              <CitationChip doc="Tribal note — R. Iyer" page="1" active={activeCitation === 'Tribal note — R. Iyer'}
                onClick={() => setActiveCitation(activeCitation === 'Tribal note — R. Iyer' ? null : 'Tribal note — R. Iyer')} />
            </div>
            {activeCitation && (
              <div style={{
                marginTop: 10, padding: '10px 12px', borderRadius: 12,
                background: 'rgba(28,27,24,0.045)', border: `1px solid ${T.border}`,
                fontSize: 12, color: T.dim, lineHeight: 1.5,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ color: T.text }}>{activeCitation}</strong>
                  <button onClick={() => setActiveCitation(null)} aria-label="Close source preview"
                    style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer' }}>
                    <X size={13} />
                  </button>
                </div>
                <div style={{ fontStyle: 'italic' }}>{SOURCE_DETAIL[activeCitation].text}</div>
                <div style={{ marginTop: 4, fontSize: 10.5 }}>{SOURCE_DETAIL[activeCitation].date}</div>
              </div>
            )}
          </Glass>

          {/* Recommendation / approval card */}
          <Glass style={{ padding: 16, border: `1px solid ${T.amber}55` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <AlertTriangle size={14} color={T.amber} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.amber, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Recommended action — requires approval
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 12px' }}>
              Inspect and re-grease coupling on P-204 before next trip window (within 5 days).
            </p>
            {approvalState === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setApprovalState('approved')}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: T.signal, color: '#F6F1E4', fontWeight: 700, fontSize: 13,
                  }}>Approve</button>
                <button onClick={() => setApprovalState('rejected')}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(28,27,24,0.05)', color: T.text, fontWeight: 600, fontSize: 13,
                    border: `1px solid ${T.border}`,
                  }}>Dismiss</button>
              </div>
            )}
            {approvalState === 'approved' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.signal, fontSize: 13, fontWeight: 600 }}>
                <CheckCircle2 size={15} /> Approved — work order created
              </div>
            )}
            {approvalState === 'rejected' && (
              <div style={{ color: T.dim, fontSize: 13 }}>Dismissed — no action taken</div>
            )}
          </Glass>

          {/* Compliance gap alert */}
          <Glass style={{ padding: '12px 14px', border: `1px solid ${T.coral}55` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <ShieldAlert size={14} color={T.coral} />
              <span style={{ fontSize: 12.5, color: T.text }}>
                Inspection record for P-204 overdue against OISD schedule — <strong>4 days</strong>
              </span>
            </div>
          </Glass>
        </div>

        {/* Input bar */}
        <div style={{ padding: 14 }}>
          <Glass style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={15} color={T.dim} />
            <span style={{ fontSize: 13, color: T.dim, flex: 1 }}>Ask about any asset...</span>
            <Mic size={15} color={T.blue} />
          </Glass>
        </div>
      </div>
    </div>
  );
}

function DesktopView() {
  const [activeCitation, setActiveCitation] = useState('WO-88213');
  return (
    <div style={{
      width: '100%', maxWidth: 980, height: 600, borderRadius: 20, overflow: 'hidden',
      background: T.bg, display: 'flex', fontFamily: FONT, color: T.text,
      border: `1px solid ${T.border}`, boxShadow: '0 30px 60px rgba(28,27,24,0.20)',
    }}>
      {/* Left: graph/doc explorer */}
      <div style={{ width: 240, borderRight: `1px solid ${T.border}`, padding: 18, background: 'rgba(28,27,24,0.025)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
          Asset Graph
        </div>
        {['Pump P-204', 'Bearing Assy. B-11', 'Coupling C-04', 'WO-88213', 'P&ID-204-Rev3'].map((n, i) => (
          <div key={n} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10,
            marginBottom: 4, fontSize: 13, color: i === 0 ? T.text : T.dim,
            background: i === 0 ? 'rgba(28,27,24,0.055)' : 'transparent',
            cursor: 'pointer',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: i === 0 ? T.blue : T.dim }} />
            {n}
          </div>
        ))}
      </div>

      {/* Center: Q&A */}
      <div style={{ flex: 1, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Pump P-204 — recurring vibration fault</div>
          <div style={{ fontSize: 12.5, color: T.dim, marginTop: 2 }}>Multi-hop query across 3 source types</div>
        </div>
        <Glass strong style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: T.dim, fontWeight: 600, textTransform: 'uppercase' }}>Answer</span>
            <ConfidenceBadge level="high" />
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 14px' }}>
            Historical resolution was bearing replacement, but a technician field note (not in the formal
            work-order record) attributes true root cause to coupling grease degradation. Design spec confirms
            the trip setpoint was revised in P&ID Rev 3, which is consistent with tighter tolerance triggering
            earlier trips on the same underlying issue.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.keys(SOURCE_DETAIL).map((doc) => (
              <CitationChip key={doc} doc={doc} page="1" active={activeCitation === doc}
                onClick={() => setActiveCitation(doc)} />
            ))}
          </div>
        </Glass>
      </div>

      {/* Right: provenance panel */}
      <div style={{ width: 260, borderLeft: `1px solid ${T.border}`, padding: 18, background: 'rgba(28,27,24,0.025)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
          Source detail
        </div>
        {activeCitation && (
          <Glass style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{activeCitation}</div>
            <div style={{ fontSize: 12.5, color: T.dim, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8 }}>
              {SOURCE_DETAIL[activeCitation].text}
            </div>
            <div style={{ fontSize: 11, color: T.dim }}>{SOURCE_DETAIL[activeCitation].date}</div>
          </Glass>
        )}
      </div>
    </div>
  );
}

export default function ProductUIMockup() {
  const [mode, setMode] = useState('mobile');
  return (
    <div style={{
      minHeight: '100%', background: T.bg, padding: '32px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: FONT,
    }}>
      <div style={{ marginBottom: 22, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: T.blue,
          letterSpacing: 0.6, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10,
          background: `${T.butter}66`, border: `1px solid ${T.butter}`, padding: '5px 12px 5px 10px', borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: T.signal }} />
          UI Direction — liquid glass
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, margin: 0, letterSpacing: -0.4 }}>
          Field-first, cited, and honest about confidence
        </h1>
        <div style={{ display: 'inline-flex', gap: 6, marginTop: 16, padding: 4, borderRadius: 999, background: 'rgba(28,27,24,0.04)', border: `1px solid ${T.border}` }}>
          <button onClick={() => setMode('mobile')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 999, border: 'none',
            cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
            background: mode === 'mobile' ? T.blue : 'transparent', color: mode === 'mobile' ? '#fff' : T.dim,
          }}><Smartphone size={13} /> Field technician (mobile)</button>
          <button onClick={() => setMode('desktop')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 999, border: 'none',
            cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
            background: mode === 'desktop' ? T.blue : 'transparent', color: mode === 'desktop' ? '#fff' : T.dim,
          }}><Monitor size={13} /> Engineer (desktop)</button>
        </div>
      </div>
      {mode === 'mobile' ? <MobileView /> : <DesktopView />}
    </div>
  );
}
