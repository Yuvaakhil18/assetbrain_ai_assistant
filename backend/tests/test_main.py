from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root() -> None:
    response = client.get("/")
    assert response.status_code == 200

def test_chat_pipeline_unrelated_queries() -> None:
    """Regression Test 5: Confirm pipeline returns different responses for unrelated queries."""
    res1 = client.post("/api/chat", json={"query": "What is the pressure limit?"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert "8.4 bar" in data1["answer"]
    assert "P&ID-204-Rev3" in data1["citations"]

    res2 = client.post("/api/chat", json={"query": "Who fixed the boiler?"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert "bearing" in data2["answer"]
    assert "WO-88213" in data2["citations"]
    
    assert data1["answer"] != data2["answer"]

def test_chat_pipeline_low_info() -> None:
    """Test 'no good match' fallback."""
    res = client.post("/api/chat", json={"query": "hey"})
    data = res.json()
    assert data["confidence"] == 0.0
    assert "What asset or procedure" in data["answer"]
