from abc import ABC, abstractmethod
from app.models.domain import RawParsedDocument
import os

class DocumentParser(ABC):
    """Base interface for all document parsers."""
    
    @abstractmethod
    def parse(self, filepath: str) -> RawParsedDocument:
        """Parse a file into a structured representation."""
        pass

    def _validate_file(self, filepath: str) -> None:
        """Common file validation logic."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File {filepath} not found.")
        if os.path.getsize(filepath) == 0:
            raise ValueError(f"File {filepath} is empty.")
