import pytest
from app.ingestion.router import IngestionRouter
from app.models.domain import RawParsedDocument

@pytest.fixture
def router() -> IngestionRouter:
    return IngestionRouter()

def test_spreadsheet_ingestion(router: IngestionRouter) -> None:
    doc = router.ingest("tests/fixtures/data.csv")
    assert isinstance(doc, RawParsedDocument)
    assert doc.mime_type == "text/csv"
    assert len(doc.content) == 2
    assert doc.content[0]["equipment_tag"] == "P-204"
    assert doc.provenance_base.confidence == 1.0

def test_text_ingestion(router: IngestionRouter) -> None:
    doc = router.ingest("tests/fixtures/normal.txt")
    assert isinstance(doc, RawParsedDocument)
    assert "P-204" in doc.content
    assert doc.provenance_base.confidence == 1.0

def test_empty_file(router: IngestionRouter) -> None:
    with pytest.raises(ValueError, match="is empty"):
        router.ingest("tests/fixtures/empty.txt")

def test_prompt_injection_defense(router: IngestionRouter) -> None:
    with pytest.raises(ValueError, match="Prompt injection attempt detected"):
        router.ingest("tests/fixtures/adversarial.txt")
        
def test_provenance_survival(router: IngestionRouter) -> None:
    """The single most important test: Provenance survives ingestion."""
    doc = router.ingest("tests/fixtures/normal.txt")
    assert doc.provenance_base is not None
    assert doc.provenance_base.document_id == doc.document_id
    assert doc.provenance_base.confidence <= 1.0
