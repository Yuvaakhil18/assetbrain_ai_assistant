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

## 4. System Architecture & Design

The system operates via a strict unidirectional pipeline where data maintains full provenance from ingestion to inference. 

### Data Flow & Architecture

![System Architecture](docs/images/system_architecture.png)

![Data Flow Pipeline](docs/images/data_flow_diagram.png)

<details>
<summary>View as Mermaid (GitHub only)</summary>

```mermaid
flowchart TD
    subgraph Ingestion["1. Ingestion Layer"]
        A1[PDF/Docs] --> B1(Text/Vision Parser)
        A2[Scanned P&IDs] --> B2(Multimodal Vision Parser)
        A3[Spreadsheets] --> B3(Schema-Aware Parser)
        A4[Emails/Notes] --> B4(Text Parser)
    end
    
    subgraph Extraction["2. Extraction & Structuring"]
        B1 & B2 & B3 & B4 --> C(Entity/Relation Extractor)
        C --> D{Schema Validator}
        D -- Invalid --> E[DLQ / Audit Log]
        D -- Valid --> F(Graph Loader)
    end

    subgraph Knowledge["3. Knowledge Graph (The Brain)"]
        F --> G[(Graph Database)]
        G -.->|Indexes| H[(Vector Store / Text Index)]
    end

    subgraph Retrieval["4. GraphRAG Layer"]
        I[User Query] --> J(Query Planner / Router)
        J --> K(Graph Traversal & Vector Search)
        K --> L[Sub-graph + Provenance Metadata]
    end

    subgraph Agents["5. Agentic Layer"]
        L --> M[Expert Copilot Agent]
        L --> N[Maintenance/RCA Agent]
        L --> O[Compliance Agent]
    end

    subgraph UI["6. Client / UI"]
        M --> P1[Answer with Citations]
        N --> P2[Recommendation Card + Approval Gate]
        O --> P3[Compliance Alert]
        P1 & P2 & P3 --> Q[Mobile-First Frontend]
    end
```
</details>

### Core Components Explanation

1. **Ingestion & Extraction:** Processes unstructured PDFs, P&IDs, and informal technician notes. It uses multimodal LLMs to accurately parse complex schematics that standard OCR fails to interpret. It extracts entities and relationships strictly against a rigid industrial schema to prevent hallucinated entity bloat.
2. **Knowledge Graph (The Core):** Instead of relying purely on vector embeddings, the system stores relationships deterministically in a Graph Database (Neo4j). This ensures that querying `(Asset {tag: 'P-204'})-[:HAS_FAULT]->(Fault)` remains O(1) or O(log N) latency even at massive scale.
3. **Retrieval Engine (GraphRAG):** Traverses the graph to resolve multi-hop queries (e.g., "Find all recurring faults on Pump P-204 and check if the latest fix complies with OISD regulations"). Every subgraph extracted carries full provenance (Document ID, Page Number) ensuring responses are completely traceable.
4. **Agentic Layer:** 
    - *Expert Copilot Agent:* Handles user Q&A, formatting answers with strict citations based on retrieved sub-graphs.
    - *Maintenance/RCA Agent:* Proposes Root Cause Analyses and next actions, culminating in a mandatory human approval gate.
    - *Compliance Agent:* Audits proposed procedures against statutory regulations (Factory Act, PESO, etc.) acting as an automated safety layer.

### System Interaction Flow

![System Interaction Flow](docs/images/system_interaction_flow.png)

<details>
<summary>View as Mermaid (GitHub only)</summary>

```mermaid
sequenceDiagram
    actor Tech as Field Technician
    participant UI as Mobile Frontend
    participant API as FastAPI Backend
    participant Graph as Knowledge Graph
    participant Agent as AI Agent Layer
    
    Tech->>UI: Queries asset information (e.g., "Manual for FT-200 pump")
    UI->>API: POST /api/chat {query}
    API->>Graph: Traverse graph & execute vector search
    Graph-->>API: Return relevant Sub-graph & Provenance Metadata
    API->>Agent: Synthesize answer using strict context
    Agent-->>API: Structured Response (Answer, Citations, Actions)
    API-->>UI: JSON payload
    UI-->>Tech: Displays Chat Bubble, Citations, & Interactive Cards
```
</details>

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

### Deployment (Vercel Edge & Serverless)
We utilize a unified Vercel deployment strategy. The repository is structured as a monorepo where Vercel natively builds the React frontend as static assets and hosts the FastAPI backend as Serverless Functions (`/api/*`).

![Deployment Architecture](docs/images/deployment_architecture.png)

<details>
<summary>View as Mermaid (GitHub only)</summary>

```mermaid
flowchart LR
    User([Mobile / Web Client]) -->|HTTPS| Edge[Vercel Edge Network]
    
    subgraph Vercel[Vercel Platform]
        UI[React / Vite Frontend\nStatic Assets]
        API[FastAPI Serverless Function\nPython Backend]
    end
    
    Edge -->|Routes /| UI
    Edge -->|Routes /api/*| API
    
    API -.->|Query| GraphDB[(Neo4j Knowledge Graph)]
    API -.->|Prompt| LLM[LLM / GenAI Layer]
```
</details>

---

## 8. Reference Documentation
- **Architecture & Design:** `docs/ARCHITECTURE.md`
- **Design System & UI Mockups:** `ProductUIMockup.jsx`
- **Business Impact Model:** `ImpactCalculator.jsx`
- **Security & Quality:** `SECURITY.md`, `QUALITY_REPORT.md`
