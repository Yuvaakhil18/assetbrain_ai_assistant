import os
import sys

# Add the backend directory to the Python path so imports work
# We are now in frontend/api/[...catchall].py, so backend is at ../../backend
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app # type: ignore
