$ErrorActionPreference = "Stop"

$PROJECT_NAME = "assetbrain"
$RESOURCE_GROUP = "rg-$PROJECT_NAME-$(Get-Random -Minimum 1000 -Maximum 9999)"
$LOCATION = "eastus"
$REGISTRY_NAME = "acr$PROJECT_NAME$(Get-Random -Minimum 1000 -Maximum 9999)"
$ENV_NAME = "cae-$PROJECT_NAME"

Write-Host "========================================="
Write-Host "Starting Deployment to Azure Container Apps"
Write-Host "Resource Group: $RESOURCE_GROUP"
Write-Host "Location: $LOCATION"
Write-Host "Registry: $REGISTRY_NAME"
Write-Host "========================================="

$AZ = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

Write-Host "`n[1/4] Creating Resource Group and Container Registry..."
& $AZ group create --name $RESOURCE_GROUP --location $LOCATION --output none
& $AZ acr create --resource-group $RESOURCE_GROUP --name $REGISTRY_NAME --sku Basic --admin-enabled true --output none

# Get ACR credentials
$ACR_USERNAME = & $AZ acr credential show --name $REGISTRY_NAME --query "username" -o tsv
$ACR_PASSWORD = & $AZ acr credential show --name $REGISTRY_NAME --query "passwords[0].value" -o tsv

Write-Host "`n[2/4] Creating Container Apps Environment..."
& $AZ containerapp env create --name $ENV_NAME --resource-group $RESOURCE_GROUP --location $LOCATION --output none

Write-Host "`n[3/4] Deploying Backend..."
Set-Location .\backend
Write-Host "Building backend image..."
& $AZ acr build --registry $REGISTRY_NAME --image backend:latest .

Write-Host "Deploying backend app..."
& $AZ containerapp create --name "$PROJECT_NAME-backend" --resource-group $RESOURCE_GROUP `
    --environment $ENV_NAME --image "$REGISTRY_NAME.azurecr.io/backend:latest" `
    --registry-server "$REGISTRY_NAME.azurecr.io" --registry-username $ACR_USERNAME --registry-password $ACR_PASSWORD `
    --target-port 8000 --ingress external --query "properties.configuration.ingress.fqdn" -o tsv | Set-Variable BACKEND_FQDN
Set-Location ..

$BACKEND_URL = "https://$BACKEND_FQDN"

if (-not $BACKEND_FQDN) {
    Write-Error "Failed to retrieve Backend URL after deployment."
    exit 1
}

Write-Host "Backend successfully deployed at: $BACKEND_URL"

Write-Host "`n[4/4] Deploying Frontend..."
Set-Location .\frontend
Write-Host "Building frontend image..."
& $AZ acr build --registry $REGISTRY_NAME --image frontend:latest --build-arg VITE_API_URL=$BACKEND_URL .

Write-Host "Deploying frontend app..."
& $AZ containerapp create --name "$PROJECT_NAME-frontend" --resource-group $RESOURCE_GROUP `
    --environment $ENV_NAME --image "$REGISTRY_NAME.azurecr.io/frontend:latest" `
    --registry-server "$REGISTRY_NAME.azurecr.io" --registry-username $ACR_USERNAME --registry-password $ACR_PASSWORD `
    --target-port 8080 --ingress external --query "properties.configuration.ingress.fqdn" -o tsv | Set-Variable FRONTEND_FQDN
Set-Location ..

$FRONTEND_URL = "https://$FRONTEND_FQDN"

Write-Host "`n========================================="
Write-Host "Deployment Complete! 🎉"
Write-Host "Frontend URL: $FRONTEND_URL"
Write-Host "Backend URL:  $BACKEND_URL"
Write-Host "========================================="
