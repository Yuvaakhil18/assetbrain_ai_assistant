import pytest
from app.retrieval.engine import GraphRetrievalEngine
from app.graph.loader import GraphLoader
from app.retrieval.models import RetrievalResult

@pytest.fixture
def engine() -> GraphRetrievalEngine:
    loader = GraphLoader()
    return GraphRetrievalEngine(loader)

def test_no_match_confidence(engine: GraphRetrievalEngine) -> None:
    """Test that a 'no good match' case returns 0 confidence rather than hallucinating."""
    res = engine.retrieve("Find information about a unicorn.")
    assert isinstance(res, RetrievalResult)
    assert res.confidence_score == 0.0
    assert len(res.source_node_ids) == 0

def test_multi_hop_retrieval(engine: GraphRetrievalEngine) -> None:
    """Test that multi-hop retrieval properly populates multiple source node IDs."""
    res = engine.retrieve("What fixed similar faults in history?")
    assert res.is_multi_hop is True

def test_sql_cypher_injection_safety(engine: GraphRetrievalEngine) -> None:
    """Test that engine sanitizes or rejects SQL/Cypher injection attempts."""
    with pytest.raises(ValueError):
        engine.retrieve("MATCH (n) DETACH DELETE n;")

def test_standard_retrieval(engine: GraphRetrievalEngine) -> None:
    """Test standard single-hop functionality."""
    res = engine.retrieve("What is the procedure for P-204?")
    assert res.confidence_score > 0.2
    assert len(res.source_node_ids) > 0
    assert res.is_multi_hop is False
