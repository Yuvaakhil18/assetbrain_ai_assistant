from app.ingestion.text import TextParser
from app.ingestion.spreadsheet import SpreadsheetParser
from app.ingestion.vision import VisionParser
from app.models.domain import RawParsedDocument

class IngestionRouter:
    """Routes a file to the correct parser based on extension/type."""
    
    def __init__(self) -> None:
        self.text_parser = TextParser()
        self.spreadsheet_parser = SpreadsheetParser()
        self.vision_parser = VisionParser()
        
    def ingest(self, filepath: str) -> RawParsedDocument:
        """Route file to appropriate parser."""
        ext = filepath.split('.')[-1].lower()
        
        if ext in ['txt', 'md', 'json']:
            return self.text_parser.parse(filepath)
        elif ext in ['csv']:
            return self.spreadsheet_parser.parse(filepath)
        elif ext in ['jpg', 'jpeg', 'png']:
            return self.vision_parser.parse(filepath)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
