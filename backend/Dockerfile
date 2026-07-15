FROM python:3.10-slim

WORKDIR /app

# Copy dependency files
COPY pyproject.toml .
# Install dependencies
RUN pip install .

# Copy the application source code
COPY . .

# Cloud Run sets the PORT environment variable
ENV PORT=8000
EXPOSE $PORT

# Command to run the application
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
