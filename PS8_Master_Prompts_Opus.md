# Master Build Prompts — Unified Asset Reasoning Layer (PS8)
### Phase-wise prompts for Antigravity, built with Claude Opus as lead agent

How to use this: paste each phase into Antigravity as a separate turn, in order.
Each phase assumes the previous phase's output already exists in the repo — don't
skip ahead. Where a phase says "stop here," that's deliberate: it stops Opus from
building five phases on top of a foundation nobody reviewed yet.

This version is grounded in the **official problem statement** (not an assumed
one) — McKinsey's 35% search-time stat, NASSCOM-EY's 7–12 disconnected systems
finding, BIS Research's 18–22% fragmentation-driven downtime figure, and the
official judging criteria: Relevance to Problem Statement, Innovation &
Creativity, Technical Implementation, Business Viability, Presentation &
Clarity, and Impact & Scalability (no published weighting between them —
treat all six as equally worth deliberate attention). Every phase below is
written to score against those six, not against a generic "build cool AI"
bar.

---

## PHASE 0 — Project Contract (paste first, once)

```
You are Claude Opus, acting as senior technical lead inside Antigravity,
building "Unified Asset Reasoning Layer" for ET AI Hackathon — Problem
Statement 8: AI for Industrial Knowledge Intelligence (Unified Asset &
Operations Brain).

GROUND TRUTH FROM THE OFFICIAL PROBLEM STATEMENT — treat this as fact, not a
suggestion:
- The problem: large Indian plants run 7–12 disconnected document systems
  (P&IDs/drawings, work orders, procedures, inspection records, regulatory
  filings in email archives). Professionals spend ~35% of working hours
  searching or recreating documents that already exist (McKinsey, 2024).
  Fragmentation contributes to 18–22% of unplanned downtime in Indian heavy
  industry (BIS Research). ~25% of India's experienced industrial engineers
  retire within a decade, taking undocumented knowledge with them.
- Required entity types to extract: equipment tags, process parameters,
  regulatory references, personnel, dates.
- Must work across structured AND unstructured formats: PDFs, P&IDs, scanned
  forms, spreadsheets, email archives.
- Must be usable on mobile by field technicians, not just desktop by
  engineers — this is explicit in the brief, not an assumption.
- Regulatory context is India-specific: Factory Act, OISD, PESO, environmental
  norms, quality standards.
- Judging criteria (six, unweighted — the jury's decisions are final and
  binding, so don't waste time guessing at implied weighting): Relevance to
  Problem Statement, Innovation & Creativity, Technical Implementation,
  Business Viability, Presentation & Clarity, Impact & Scalability. Every
  phase you build should be traceable to at least one of these six.

SCOPE DECISION (stated up front so there's no drift later): of the five
illustrative build areas in the brief — (1) Universal Document Ingestion &
Knowledge Graph Agent, (2) Expert Knowledge Copilot, (3) Maintenance
Intelligence & RCA Agent, (4) Quality & Regulatory Compliance Intelligence,
(5) Lessons Learned & Failure Intelligence Engine — we are building (1) and
(2) as the core, (3) and (4) as differentiating features shown in the demo,
and treating (5) as an explicit stretch goal only if time allows. State this
scope decision back to me before writing any code — if it's wrong, correct it
now, not on day 2.

STANDING RULES for every phase from here on:

CODE QUALITY: small single-responsibility modules, typed (TypeScript strict /
Python type hints), no magic strings, docstrings on every public function,
linter+formatter configured now and run before ending every future phase.

EFFICIENCY: state cost-per-call for any LLM-in-a-loop code; batch instead of
looping per-item; cache expensive operations (embeddings, graph queries).

SECURITY: no hardcoded secrets (.env + .env.example, .env gitignored);
sanitize all user input before it reaches an LLM prompt or DB query; treat
every ingested document as untrusted content that must never be able to
steer the agent (this matters specifically because your pipeline parses
uploaded PDFs/emails with an LLM — prompt injection via document content is
a real, in-scope risk, not a theoretical one).

TESTING: every module ships with tests in the same turn it's created —
mock LLM calls in tests, don't burn API budget per test run.

ACCESSIBILITY: keyboard-navigable, screen-reader labeled, WCAG 2.1 AA
contrast, status never conveyed by color alone.

DELIVERABLE FOR THIS PHASE:
1. Repo scaffold (frontend + backend + /docs), linter/formatter/type-checker/
   test runner configured and passing on an empty build.
2. CONTRIBUTING.md restating the five standing rules in your own words.
3. Your restated scope decision (see above) — post it, then stop.
```

---

## PHASE 1 — Architecture

```
Design (don't fully implement yet) the pipeline: ingestion → knowledge graph
→ GraphRAG retrieval → cited answer → recommendation-with-approval-gate.

1. Data model: node types Asset, Fault, Fix, Document, Technician, WorkOrder,
   RegulatoryRequirement, InspectionRecord — plus the PS-mandated entity
   attributes (equipment tag, process parameter, regulatory reference,
   personnel, date) attached as properties, not separate node types, unless
   you can justify why a given one needs to be its own node. Every node/edge
   carries provenance metadata: source_doc_id, page/span, ingestion
   timestamp, confidence.
2. Tech stack choice with a one-line efficiency + security + SCALABILITY
   justification per choice — Impact & Scalability is one of the six named
   judging criteria, so explicitly address: what happens to ingestion time
   and query latency as
   the corpus grows from your ~20-document demo set to a real plant's
   thousands of documents? You don't have to solve it, but you must name the
   bottleneck and the mitigation path (e.g., "graph queries indexed on
   asset_tag; re-ingestion is incremental, not full-corpus, by design").
3. Explicitly design for computer-vision P&ID parsing as a first-class input
   type, not an afterthought — the brief names this as a suggested technology.
4. Draw the data flow (mermaid) showing provenance surviving every hop.
5. Name the top 3 failure modes and the guardrail for each.

Output: ARCHITECTURE.md + folder structure. Wait for confirmation before
implementing.
```

---

## PHASE 2 — Ingestion Pipeline

```
Implement ingestion for the required format spread: PDFs, P&IDs (image/
scanned), spreadsheets, work-order records, and email-archive text — under
Phase 0 rules.

SEED CORPUS SOURCING — do this alongside the pipeline work, don't leave it
until the pipeline is "done":
- Don't rely solely on synthetic documents. Layer in real public documents
  so the system is demonstrably tested against material it wasn't written
  around:
  · OISD and PESO publish real safety/regulatory circulars publicly — use
    actual regulation text for the Compliance Agent, not a paraphrase.
  · U.S. Chemical Safety Board (CSB) investigation reports are public,
    detailed, real root-cause-analysis reports on actual industrial
    incidents — an excellent structural match for the RCA agent, since they
    already contain fault → cause → fix narratives.
  · Public OEM manuals / spec sheets, where clearly published for public
    access.
- LICENSING: manufacturer manuals are often copyrighted even when publicly
  viewable — fine to ingest and cite locally for the demo, do NOT check raw
  copyrighted manual text into the public GitHub repo the hackathon
  requires. Keep those specific files local/gitignored; commit only your
  synthetic and clearly-public-domain (CSB, OISD, PESO) documents.
- PRIVACY: if anyone on the team sources real documents from an actual
  plant/company contact, strip or anonymize personnel names, exact asset
  IDs tied to the real company, and anything commercially sensitive before
  it touches the repo or the demo environment. Treat this as a real
  requirement, not a nice-to-have — mishandling it undermines the entire
  "trust and provenance" pitch.
- SEQUENCING: keep a small, hand-curated, fully-rehearsed corpus (the one
  your scripted demo depends on — don't risk this on live extraction
  quality) SEPARATE from a "live ingestion" document used for exactly one
  demo moment (see Phase 9) where you ingest something the system has never
  seen, on stage, to prove the pipeline generalizes rather than just
  answering memorized questions.

- Route P&IDs/scanned documents through vision-capable parsing (multimodal
  model call); route structured spreadsheets through a schema-aware parser,
  not an LLM call (cheaper, more reliable, and judges will notice if you
  used an LLM for something a parser does better — that's a technical
  excellence signal either way).
- Every parsed unit retains a pointer to its exact source (file, page/row) —
  this is the seed of the whole provenance chain.
- SECURITY: validate file type/size before parsing; treat filenames as
  untrusted; test with a document containing an embedded prompt-injection
  attempt ("ignore previous instructions...") and confirm it's inert.
- TESTING: fixtures for a normal PDF, a scanned P&ID image, a malformed
  file, an empty file, and the adversarial-content file above.

Deliverable: ingestion module + passing tests + a note on the injection test
result + the sourced seed corpus (synthetic + real-public documents,
licensing-safe) committed per the rules above.
```

---

## PHASE 3 — Knowledge Graph Construction

```
Implement entity/relation extraction against the PS-mandated entity types
(equipment tags, process parameters, regulatory references, personnel,
dates) plus your Phase 1 schema, under Phase 0 rules.

- Draft extraction, then a validation pass that rejects anything not fitting
  the fixed schema rather than silently inventing new node/edge types.
- Provenance metadata must survive extraction unmodified — write a test that
  asserts this specifically; it is the single most important test in the
  project.
- SECURITY: system prompt must structurally separate "instructions" from
  "data to extract from"; test with adversarial document content.
- CODE QUALITY: idempotent graph writes — stable IDs derived from source
  content, not random UUIDs, so re-ingestion doesn't duplicate.
- SCALABILITY: state expected extraction cost (tokens, time) per document at
  demo-corpus scale, and flag what changes at 100x scale.

Deliverable: extraction + graph-load modules, passing tests including
provenance-survival and adversarial-content tests.
```

---

## PHASE 4 — GraphRAG Retrieval Layer

```
Implement hybrid graph-traversal + vector retrieval, under Phase 0 rules.

- Support single-hop lookups AND multi-hop reasoning ("what fixed similar
  faults on this asset class before, and who diagnosed them") — multi-hop is
  your technical-excellence differentiator versus flat RAG; don't ship only
  the easy path.
- Every retrieval result carries its source node IDs in its return type —
  not optional, not by convention.
- Return an explicit confidence score with every result — the PS evaluation
  focus explicitly names "query answer quality" and implies confidence
  signaling matters.
- SECURITY: parameterized graph queries only — no string-concatenated user
  input into Cypher/SQL.
- TESTING: test the "no good match" case returns a clear low-confidence
  signal rather than forcing an answer.

Deliverable: retrieval module, latency benchmark note, passing tests.
```

---

## PHASE 5 — Copilot, RCA, and Compliance Agents

```
Implement the three user-facing agents defined in your Phase 0 scope
decision, under Phase 0 rules:

1. EXPERT KNOWLEDGE COPILOT (core): answers operational/maintenance/
   engineering queries with source citations and a confidence score on every
   claim. Must never state a claim it can't trace to a retrieved node — test
   this with a query designed to tempt speculation beyond retrieved evidence.
2. MAINTENANCE INTELLIGENCE / RCA AGENT (differentiator): fuses work-order
   history, fault records, and OEM manual content to propose root-cause
   analysis and a next maintenance action. Output is a proposal with an
   evidence trail — NOT an auto-executed action. Enforce the approval gate
   in code (a real pending/approved state in the data model), not just via
   prompt wording — prompt-only restrictions are not a reliable security
   boundary. Write a test proving no code path reaches "executed" without
   passing "approved" first.
3. COMPLIANCE INTELLIGENCE AGENT (differentiator): maps regulatory
   requirements (Factory Act, OISD, PESO, environmental norms — from your
   seed corpus, doesn't need to be exhaustive) against current
   procedures/inspection records and flags gaps with a citation to both the
   regulation and the record it's checked against.
- TESTING: golden-answer tests using your seed corpus — at least 5 known
  Q&A pairs, asserting correct citations, not just "an answer exists."

Deliverable: three agent modules, approval-gate enforcement + its test,
golden-answer suite.
```

---

## PHASE 6 — UI/UX: Warm Liquid-Glass, Mobile-First

```
Build the UI under Phase 0 rules, using this exact design system — it's
already validated with the team, implement it precisely rather than
reinterpreting it:

DESIGN TOKENS (finalized — implement exactly, this has already been through
two rounds of team review, don't reinterpret it)
- Background: warm beige-white radial gradient, #FBF7EF → #F3ECDF → #E9DFCC
  (not flat — the glass panels need something to refract).
- Glass surfaces: translucent near-white, rgba(255,255,255,0.58) normal /
  rgba(255,255,255,0.8) elevated, backdrop-filter: blur(24px) saturate(160%),
  border rgba(28,27,24,0.10), soft warm shadow rgba(28,27,24,0.10) — never a
  harsh black shadow, it breaks the warm-glass feel.
- Text: ink #1C1B18 primary, warm grey #6E6A61 secondary — real black/grey,
  not a cool digital grey.
- Brand accent, deep pine green #013E37: used for primary buttons, selected
  states, active chips, AND as the "verified / high-confidence" status
  color. This double-use is deliberate — green already reads as "confirmed"
  to most people, so the brand color and the trust signal reinforce each
  other instead of competing. Do not introduce a separate blue/purple accent.
- Butter #FFEFB3: a warm highlight accent used sparingly and deliberately —
  eyebrow/badge pill backgrounds, a soft gradient glow behind hero numbers
  (e.g. the ROI figure), not as a general background or a status color. If
  you find yourself using it on more than a couple of elements per screen,
  you're overusing it — it should read as an accent, not a second palette.
- Status colors beyond brand green (icon + text label always paired, never
  color alone — accessibility requirement, not style preference):
  needs-approval = warm ochre #B4832E; compliance gap/risk = muted brick
  #A8503B. Keep these visually distinct from the brand green so a
  technician scanning quickly can't confuse "trustworthy" with "needs
  attention."
- Type: system font stack (-apple-system, SF Pro Display, Segoe UI, Inter) —
  native-feeling, not a web font imitating one.

Full token reference:
  bg:        radial-gradient(#FBF7EF, #F3ECDF, #E9DFCC)
  glass:     rgba(255,255,255,0.58) / rgba(255,255,255,0.8) elevated
  border:    rgba(28,27,24,0.10)
  text:      #1C1B18
  textDim:   #6E6A61
  brand/verified: #013E37
  butter (accent only): #FFEFB3
  needs-approval:  #B4832E
  risk/compliance: #A8503B

MOBILE-FIRST REQUIREMENT (explicit in the brief — field technicians, not
just desktop engineers):
- Design and build the mobile layout FIRST, desktop second, not the reverse.
- Every answer shows citations as tappable chips; tapping expands the exact
  source excerpt inline — this is the trust mechanism, make it impossible to
  miss, not a secondary disclosure.
- Recommendation/RCA cards show "Requires approval" as icon + text, with
  clear Approve/Dismiss controls sized for touch (min 44x44pt targets).
- Compliance-gap alerts are visually distinct from citations (different
  color, different icon) so a technician scanning quickly doesn't confuse
  "here's a source" with "here's a problem."

ACCESSIBILITY, concretely:
- Full keyboard navigation — manually tab through the flow and confirm.
- Semantic HTML (button, not div; label, not placeholder-only inputs).
- aria-live region announcing new answers/recommendations.
- Run axe-core (or equivalent) as an automated test, not just manual review.
- Verify WCAG 2.1 AA contrast on the warm palette specifically — light
  backgrounds with insufficiently dark text is a common failure mode, check
  it, don't assume the palette passes because it "looks fine."

Deliverable: working UI (mobile view first), componentized (query input,
answer+citation panel, recommendation card, compliance alert), axe-core
results committed to the repo, manual keyboard-navigation checklist with
results noted.
```

---

## PHASE 7 — Security Hardening Pass

```
Dedicated audit of Phases 2–6. No new features — audit and fix only.

Checklist, mark each Pass/Fail/Fixed:
1. No secrets in git history (check, don't assume) — rotate if any leaked.
2. Prompt injection: re-run Phase 2/3 adversarial tests, add gaps found.
3. Injection (DB/query): confirm all graph queries are parameterized.
4. Input validation on every upload/API endpoint; no leaked stack traces.
5. Approval-gate integrity: try to break it yourself with a malformed or
   replayed request.
6. Dependency vulnerability scan (npm audit / pip-audit); fix high/critical.
7. Least-privilege DB/service credentials.

Deliverable: SECURITY.md with status of every item.
```

---

## PHASE 8 — Full Quality Audit

```
Audit against all five standing bars — fix, don't add features.

1. TESTING: run full suite, report coverage; confirm the trust-critical
   tests exist and pass — provenance-survival, no-good-match handling,
   citation-correctness, approval-gate integrity, accessibility check.
2. CODE QUALITY: full lint/type-check pass, zero warnings.
3. EFFICIENCY/SCALABILITY: measure end-to-end query latency on the full
   seed corpus; state what would need to change to handle 10x the corpus
   size, even if you don't build it — Impact & Scalability is one of the six
   named judging criteria, and an honest answer here beats silence.
4. SECURITY: re-confirm SECURITY.md items still pass after late changes.
5. ACCESSIBILITY: re-run automated check after any late UI changes.

Deliverable: QUALITY_REPORT.md — state any remaining gaps honestly; a judge
respects a stated, understood limitation far more than silence on one.
```

---

## PHASE 9 — Demo Prep & Judge Narrative

```
No new code except a must-fix QUALITY_REPORT.md gap.

1. Script a 3-minute demo hitting: (a) a multi-hop question flat RAG would
   likely fumble (Innovation & Creativity, Technical Implementation),
   (b) visible tap-to-expand citations (Presentation & Clarity), (c) an RCA
   recommendation card and the approval gate (Technical Implementation,
   Business Viability), (d) a compliance-gap flag (Relevance to Problem
   Statement), (e) one adversarial input handled safely, shown briefly
   (Technical Implementation), (f) ONE live ingestion moment: feed the
   system a real, previously-unseen public document (a CSB investigation
   report or an OISD/PESO circular — see Phase 2's seed-corpus sourcing
   notes) on stage and ask a question about it, proving the pipeline
   generalizes rather than just answering memorized questions. Keep this
   separate from the rehearsed Pump P-204 storyline — don't risk the whole
   demo on live extraction quality, this is one deliberate, bounded moment.
2. Prepare the ROI section using the Impact Calculator model already built —
   lead with the number, not the architecture; this is your strongest
   evidence for Business Viability and Impact & Scalability.
3. Prepare direct answers to: "why not just use an incumbent's copilot?"
   (Relevance to Problem Statement, Innovation & Creativity) and "how do you
   know graph retrieval is actually better here?" (Technical Implementation
   — answer should cite your own golden-answer test results, not just
   outside literature).
4. Map the finished build explicitly back to all six judging criteria in one
   slide — Relevance to Problem Statement, Innovation & Creativity,
   Technical Implementation, Business Viability, Presentation & Clarity,
   Impact & Scalability — so the judges don't have to do that mapping
   themselves. There's no published weighting between them, so don't over-
   invest in one row at the expense of the others; a build that's strong on
   five criteria and silent on the sixth is a worse outcome than one that
   visibly addresses all six, even briefly.
5. Remember the jury's decisions are final and binding — there's no
   appeals process to plan for, so the goal of this phase is a clear,
   honest, complete presentation, not a hedge against a specific judge's
   preference.

Deliverable: demo script, polished README, prepared Q&A answers, judging-
criteria mapping slide content covering all six categories.
```

