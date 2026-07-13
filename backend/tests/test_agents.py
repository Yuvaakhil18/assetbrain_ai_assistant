import pytest
from app.agents.copilot import ExpertCopilotAgent
from app.agents.maintenance import MaintenanceAgent
from app.agents.compliance import ComplianceAgent
from app.retrieval.engine import GraphRetrievalEngine
from app.graph.loader import GraphLoader

@pytest.fixture
def copilot() -> ExpertCopilotAgent:
    loader = GraphLoader()
    engine = GraphRetrievalEngine(loader)
    return ExpertCopilotAgent(engine)
    
@pytest.fixture
def maintenance() -> MaintenanceAgent:
    return MaintenanceAgent()
    
@pytest.fixture
def compliance() -> ComplianceAgent:
    return ComplianceAgent()

def test_copilot_vague_query_trap(copilot: ExpertCopilotAgent) -> None:
    """Test that the Copilot refuses to speculate when there's no match, using the exact prompt response."""
    res = copilot.query("hey")
    assert res.confidence == 0.0
    assert len(res.citations) == 0
    assert res.answer == "What asset or procedure would you like to ask about?"

def test_copilot_golden_answers(copilot: ExpertCopilotAgent) -> None:
    """Test 5 Golden Answers against the seed corpus."""
    qa_pairs = [
        # 1. Asset search
        ("What is the discharge pressure trip setpoint for Pump P-204?", "8.4 bar", "P&ID-204-Rev3"),
        # 2. History search
        ("Who fixed the boiler overheating and what was replaced?", "bearing", "WO-88213"),
        # 3. Regulatory search
        ("What is the standard procedure before maintenance?", "lockout", "node_doc_sop_1"),
        # 4. Another history phrasing
        ("What was the alignment verified to for the WO?", "0.05mm", "WO-88213"),
        # 5. Another compliance phrasing
        ("Which act governs the LOTO procedure?", "Factory Act", "node_doc_sop_1")
    ]
    
    for query, expected_text, expected_citation in qa_pairs:
        res = copilot.query(query)
        assert res.confidence > 0.1  # Must pass the 0.2 threshold in engine
        assert expected_text.lower() in res.answer.lower()
        assert expected_citation in res.citations

def test_maintenance_approval_gate(maintenance: MaintenanceAgent) -> None:
    """Strictly test the approval gate logic."""
    proposal = maintenance.propose_action("Pump P-204 leaking")
    assert proposal.status == "PENDING"
    
    with pytest.raises(PermissionError, match="must be APPROVED"):
        maintenance.execute_action(proposal)
        
    proposal.status = "APPROVED"
    assert maintenance.execute_action(proposal) is True
    assert proposal.status == "EXECUTED"  # type: ignore

def test_compliance_gap_flagging(compliance: ComplianceAgent) -> None:
    """Test that missing compliance steps are flagged with citations."""
    flags = compliance.check_procedure("Just turn the wrench.", "node_proc_1")
    assert len(flags) == 1
    assert flags[0].severity == "CRITICAL"
    assert "Factory Act" in flags[0].regulation_reference
    assert flags[0].procedure_node_id == "node_proc_1"
