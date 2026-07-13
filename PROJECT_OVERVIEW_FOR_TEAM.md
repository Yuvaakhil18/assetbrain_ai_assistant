# Unified Asset Reasoning Layer — Project Overview
### For the team — read this before touching code

---

## 1. What we're building, in one paragraph

An AI system that reads a plant's messy pile of documents — engineering
drawings, maintenance work orders, safety procedures, inspection reports,
regulatory filings — and turns them into a single thing a technician or
engineer can actually ask questions to, on their phone, and get an answer
that shows exactly where it came from. If the system isn't sure, it says so.
If it wants to recommend an action, it asks a human to approve it first. It
never just guesses and sounds confident about it.

This is our submission for **ET AI Hackathon, Problem Statement 8: AI for
Industrial Knowledge Intelligence — Unified Asset & Operations Brain.**

---

## 2. The actual problem (not a guess — this is from the official brief)

- Engineers and technicians in asset-heavy industries spend **~35% of their
  working hours** just searching for information or recreating documents
  that already exist somewhere (McKinsey, 2024).
- A typical large Indian plant runs across **7–12 disconnected document
  systems** — drawings in one place, work orders in another, procedures in a
  third, inspection records in a fourth, regulatory paperwork scattered
  across email (NASSCOM-EY).
- That fragmentation is directly responsible for **18–22% of unplanned
  downtime** in Indian heavy industry (BIS Research) — people make decisions
  without the full picture because the full picture is scattered across
  systems that don't talk to each other.
- **~25% of India's experienced industrial engineers retire within the next
  decade.** A lot of what they know was never written down anywhere. Once
  they leave, that knowledge is just gone.

None of this is a "we need a better search bar" problem. It's a knowledge
problem — and a safety problem, since a technician working from incomplete
information on a real piece of equipment is a real risk, not an abstract one.

---

## 3. Our core idea, and why we believe it'll actually work

**The obvious approach is "build a chatbot that RAGs over the PDFs."** We
looked into why that's not good enough, and there's real published evidence
for it, not just our opinion:

- Bosch — a real industrial company, not a startup pitching us — published
  research describing exactly this: they built a standard RAG pipeline
  (split documents into chunks, embed them, search a vector database) for
  maintenance question-answering, and it had real accuracy and retrieval
  problems.
- A peer-reviewed 2025 paper on "GraphRAG" for manufacturing document Q&A
  showed that retrieving through a **knowledge graph** — where documents are
  connected to each other by what they're actually about (an asset, a fault,
  a fix, a regulation), not just by text similarity — measurably
  outperforms flat chunk-and-embed RAG on both retrieval and answer quality.
- A 2026 industrial-AI benchmark (AssetOpsBench) found that even top LLM
  agents only hit **~65% accuracy** on real maintenance reasoning tasks when
  working off flat document stores. That's a real ceiling, and it's the
  reason we're not just wrapping a chatbot around a PDF folder.

**So our bet is: build the knowledge layer as a graph, not a vector store.**
Every document gets parsed into entities (equipment, faults, fixes, people,
dates, regulations) and relationships between them, and the AI answers
questions by walking that graph, not just by finding similar-sounding text.

**Second bet: connect the "tribal knowledge" gap, don't just capture it.**
There are already startups that let technicians record informal tips and
fixes. What none of them evidently do is connect that informal knowledge
back into the *same graph* as the formal work orders and manuals, so it
shows up automatically at the exact moment it's relevant. That's our
differentiation — not "we capture tribal knowledge" (that's been done), but
"a technician's undocumented fix from six months ago surfaces automatically
next to the official work order, with both cited."

**Third bet: recommend, never auto-execute.** Every major industrial AI
vendor we researched (IBM Maximo, SAP, Siemens, ABB, Oracle) keeps a human
approval step before any AI-suggested action actually happens, even in their
2026 releases. We're doing the same, on purpose — not because we couldn't
build auto-execution, but because it's the right call for anything touching
real equipment, and it's also what a technically literate judge will expect
to see done correctly.

---

## 4. How the pieces fit together

```
Documents in (PDF manuals, P&IDs, work orders, spreadsheets, email,
informal technician notes)
        │
        ▼
INGESTION — reads each document, keeps track of exactly where every
piece of text/image came from (which file, which page)
        │
        ▼
EXTRACTION — pulls out entities (equipment tags, process parameters,
regulatory references, people, dates) and the relationships between
them, checks everything against our fixed schema so nothing weird
sneaks into the graph
        │
        ▼
KNOWLEDGE GRAPH — the actual "brain." Every node remembers where it
came from. This is what makes citations possible later.
        │
        ▼
RETRIEVAL — when someone asks a question, this walks the graph
(sometimes multiple hops — "what fixed similar faults before, and who
found it") instead of just doing a text-similarity search
        │
        ▼
THREE AGENTS, all built on top of retrieval:
  • Expert Knowledge Copilot — answers questions, always with citations
    and a confidence level, never states something it can't point to
  • Maintenance / RCA Agent — proposes root-cause analysis and next
    actions, with evidence — but never executes anything by itself
  • Compliance Agent — checks procedures/inspections against
    regulations (Factory Act, OISD, PESO, etc.) and flags gaps
        │
        ▼
UI — mobile-first (field technicians are the primary users, not
desk-bound engineers), shows every answer with tappable citations and
every recommendation with a visible approve/reject step
```

---

## 5. What's already been designed (so nobody re-does this from scratch)

- **Research phase**: we went deep on what IBM Maximo, SAP, Siemens
  Teamcenter, Palantir Foundry, and others actually do and don't do today,
  and on the academic literature behind graph-based retrieval. This is where
  the "graph beats flat RAG" bet and the "connect tribal knowledge" angle
  came from — they're evidence-backed, not invented for the pitch.
- **Architecture**: the node/edge schema (Asset, Fault, Fix, Document,
  Technician, WorkOrder, RegulatoryRequirement, InspectionRecord), the
  provenance-tracking approach, and the ingestion → graph → retrieval →
  answer pipeline are all defined — see `PS8_Master_Prompts_Opus.md`,
  Phase 1.
- **Business impact model**: an interactive calculator (`ImpactCalculator.jsx`)
  that estimates annual value using the brief's own cited stats (35%
  search-time, 18–22% fragmentation-driven downtime) as defaults, with every
  assumption clearly labeled as either "from the cited research" or "our
  estimate — adjust this." Use this to build the ROI slide for the pitch
  deck — don't make up a number separately.
- **UI direction** (`ProductUIMockup.jsx`): a working, interactive mockup of
  both the mobile field-technician view and the desktop engineer view,
  already showing the citation-chip interaction, the approval-gate flow, and
  a compliance-gap alert. Build the real UI to match this, not from scratch.

### Design system quick reference (already decided — implement, don't redesign)

| Token | Value | Use |
|---|---|---|
| Background | `#FBF7EF → #F3ECDF → #E9DFCC` (warm beige gradient) | App background |
| Glass surface | `rgba(255,255,255,0.58–0.8)` + `blur(24px) saturate(160%)` | Cards, panels |
| Border | `rgba(28,27,24,0.10)` | Card edges |
| Text primary | `#1C1B18` (ink) | Body text |
| Text secondary | `#6E6A61` (warm grey) | Labels, captions |
| Brand / primary accent / verified | `#013E37` (deep pine green) | Buttons, selected states, AND the "verified/high-confidence" badge — deliberately doubled up, since green already reads as "confirmed" |
| Butter accent | `#FFEFB3` | Sparing highlight only — badge pills, a glow behind hero numbers. Not a background, not a status color |
| Needs approval | `#B4832E` (ochre) | Recommendation cards |
| Compliance gap / risk | `#A8503B` (muted brick) | Alerts |

Color is never the only signal — every status color is paired with an icon
and a text label. This isn't a style choice, it's an accessibility
requirement (colorblind users, and it's also just clearer for everyone under
time pressure on a plant floor).

---

## 6. What's still open / not yet decided

- Exact graph database choice (Neo4j vs. a lighter in-memory option for the
  demo) — see Phase 1 of the build prompts, this needs a team decision
  during that phase, not before.
- How much of the "Lessons Learned & Failure Intelligence Engine" (one of
  the five illustrative build areas in the brief) we attempt — currently
  scoped as a stretch goal only, see `PS8_Master_Prompts_Opus.md` Phase 0.
- Real seed corpus — we need actual sample documents (or realistic
  synthetic ones) covering P&IDs, work orders, and a handful of informal
  "tribal knowledge" notes. Someone should own building this corpus early,
  since every other phase depends on it.

---

## 7. How to actually use the other files

- **`PS8_Master_Prompts_Opus.md`** — paste each phase into Antigravity, in
  order, as a separate turn. This is the actual build instructions for
  Claude Opus. Don't skip phases or paste multiple at once.
- **`ImpactCalculator.jsx`** and **`ProductUIMockup.jsx`** — reference
  implementations / specs. The real app should match their design and logic,
  not necessarily reuse the exact files verbatim.

---

## 8. How this maps to how we'll actually be judged

The organizers gave six named criteria, with no published weighting between
them, plus a note that jury decisions are final — so there's no appeals
process to plan around, just a clear presentation to aim for.

| Criterion | Where it comes from in our build |
|---|---|
| Relevance to Problem Statement | Directly targets the brief's own cited gaps — the entity types, formats, and India-specific compliance context (Factory Act, OISD, PESO) all come from the official document, not assumed |
| Innovation & Creativity | The tribal-knowledge-fused-with-structured-graph angle — the thing incumbents and existing point solutions both miss (see Section 3) |
| Technical Implementation | Graph-based retrieval (evidenced advantage over flat chunk-and-embed RAG), multi-hop reasoning, provenance tracked end-to-end, approval-gate enforced in code |
| Business Viability | Impact Calculator, grounded in the brief's own cited research (McKinsey/NASSCOM-EY/BIS Research), with every assumption labeled as sourced vs. our own estimate |
| Presentation & Clarity | Mobile-first UI, tap-to-expand citations, the 3-minute demo script in Phase 9 of the build prompts, the judging-criteria mapping slide |
| Impact & Scalability | Incremental ingestion design, indexed graph queries, explicit "what changes at 10x corpus size" answer — addressed in Phase 1 and Phase 8 of the build prompts |

If a feature you're building doesn't map to one of these six rows, it's
probably not worth the time — check before you build it. And since there's
no published weighting, don't over-invest in one row at the expense of the
others; a build that visibly touches all six, even briefly, beats one that's
excellent on two and silent on the rest.
