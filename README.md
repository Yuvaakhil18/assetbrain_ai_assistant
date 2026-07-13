# Unified Asset Reasoning Layer — Product Requirements Document (PRD)

**Status:** Active | **Target:** ET AI Hackathon (Problem Statement 8) | **Version:** 1.0

---

## 1. Executive Summary & Vision

In asset-heavy industries (manufacturing, energy, chemicals), critical knowledge is siloed. Engineering drawings (P&IDs), maintenance work orders, safety procedures, inspection reports, and regulatory filings reside in 7-12 disconnected systems. This fragmentation forces engineers to spend ~35% of their time searching for information and drives 18-22% of unplanned downtime due to uninformed decision-making. 

**Our Vision:** To build an AI-powered "Operations Brain" that ingests these heterogeneous, messy documents and constructs a singular, verifiable Knowledge Graph. This provides technicians with a mobile-first interface to query complex, multi-hop operational questions and receive deterministic, cited answers, ultimately recapturing lost productivity and preventing catastrophic failures.

---

## 2. Problem Statement (The "Why")

1. **Information Fragmentation:** Plant knowledge is scattered across ERPs (SAP, Maximo), EDMS, and physical paper. 
2. **The "Tribal Knowledge" Gap:** With 25% of the experienced workforce retiring this decade, unwritten operational insights are being lost permanently.
3. **The Hallucination Risk:** Standard Generative AI (LLMs with Vector RAG) is insufficient for industrial applications. A hallucinated torque spec or compliance step can result in equipment damage or safety incidents. Precision and provenance are non-negotiable.

---

## 3. Product Principles

- **Graph over Vector:** We reject standard flat RAG. We parse entities (Assets, Faults, Fixes, Regulations) and map their deterministic relationships into a Knowledge Graph. This ensures $O(1)$ precision on complex queries.
- **Traceable Provenance:** Every node in the graph remembers its source document and page number. The AI never asserts a fact without a direct, tappable citation.
- **Recommend, Never Auto-Execute:** For anything touching real equipment, the AI proposes actions (RCA, Work Orders) but strictly enforces a human-in-the-loop approval gate.
- **Mobile-First for the Frontline:** The primary persona is a field technician under time pressure, not a desk-bound engineer. The UI must be highly accessible, with distinct color-coding and iconography.

---

## 4. System Architecture

The architecture operates in a unidirectional ingestion-to-retrieval pipeline:

1. **Ingestion & Extraction:** Processes unstructured PDFs, P&IDs, and informal technician notes. Extracts entities and relationships against a rigid industrial schema.
2. **Knowledge Graph (The Core):** Stores the mapped relationships (`Asset -> HAS_FAULT -> RESOLVED_BY -> Fix`). 
3. **Retrieval Engine:** Traverses the graph to resolve multi-hop queries (e.g., "Find all recurring faults on Pump P-204 and check if the latest fix complies with OISD regulations").
4. **Agentic Layer:** 
    - *Expert Copilot Agent:* Handles Q&A with strict citations.
    - *Maintenance Agent:* Proposes Root Cause Analyses and next actions.
    - *Compliance Agent:* Audits proposed procedures against statutory regulations (Factory Act, PESO, etc.).

---

## 5. Key Use Cases

### Use Case 1: Rapid Troubleshooting
- **User:** Field Technician
- **Scenario:** A seal leak on a critical pump.
- **Action:** Technician queries the system.
- **System Response:** Returns the OEM manual's recommended fix, cross-referenced with a retired engineer's handwritten note from two years ago detailing a specific quirk of this installation.

### Use Case 2: Regulatory Compliance Auditing
- **User:** Plant Manager / Safety Officer
- **Scenario:** Approving a work order for a high-pressure vessel.
- **Action:** System intercepts the proposed work order.
- **System Response:** The Compliance Agent flags a missing mandatory inspection step required by the Factory Act, preventing a regulatory violation.

---

## 6. Success Metrics & ROI

- **Search Time Reduction:** Recapture 2.5 hours per technician/shift (from the current 35% baseline).
- **Downtime Mitigation:** Reduce unplanned downtime by bridging the information gaps that cause 18-22% of failures.
- **Knowledge Retention:** Quantifiable capture of undocumented "tribal knowledge" into the permanent institutional graph.

---

## 7. Setup & Deployment (Engineering Guide)

### Backend (Python/FastAPI)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn main:app --reload
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

### Deployment (Google Cloud Run)
We utilize a containerized deployment strategy targeting Google Cloud Run for serverless scalability. See `implementation_plan.md` for full Docker and orchestration details.

---

## 8. Reference Documentation
- **Architecture & Design:** `docs/ARCHITECTURE.md`
- **Design System & UI Mockups:** `ProductUIMockup.jsx`
- **Business Impact Model:** `ImpactCalculator.jsx`
- **Security & Quality:** `SECURITY.md`, `QUALITY_REPORT.md`
