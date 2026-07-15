$ErrorActionPreference = "Stop"

$PROJECT_ID = "assetbrain-502304"
$REGION = "us-central1"

Write-Host "========================================="
Write-Host "Starting Deployment to Google Cloud Run"
Write-Host "Project ID: $PROJECT_ID"
Write-Host "========================================="

# Set project
Write-Host "`n[1/3] Setting project configuration..."
gcloud config set project $PROJECT_ID

# Enable required APIs if not already enabled
Write-Host "`n[2/3] Deploying Backend..."
Set-Location .\backend
# Deploy backend and capture URL
$BACKEND_URL = gcloud run deploy assetbrain-backend --source . --region $REGION --allow-unauthenticated --format="value(status.url)"
Set-Location ..

if (-not $BACKEND_URL) {
    Write-Error "Failed to retrieve Backend URL after deployment."
    exit 1
}

Write-Host "Backend successfully deployed at: $BACKEND_URL"

# Deploy frontend
Write-Host "`n[3/3] Deploying Frontend..."
Set-Location .\frontend
# Deploy frontend passing the backend URL as a build argument
gcloud run deploy assetbrain-frontend --source . --region $REGION --allow-unauthenticated --set-build-env-vars="VITE_API_URL=$BACKEND_URL"
Set-Location ..

Write-Host "`n========================================="
Write-Host "Deployment Complete!"
Write-Host "========================================="
