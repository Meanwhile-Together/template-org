#!/bin/bash
# Deploy to Railway from current working directory
# This script uses Terraform outputs to link and deploy to Railway

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Railway Deployment${NC}"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    echo "Installing Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
    export PATH="$HOME/.railway/bin:$PATH"
fi

# Check if RAILWAY_TOKEN is set
if [ -z "${RAILWAY_TOKEN:-}" ]; then
    echo -e "${RED}❌ RAILWAY_TOKEN not set${NC}"
    echo "Please set: export RAILWAY_TOKEN='your-token'"
    exit 1
fi

# Get Railway service ID from Terraform outputs
cd "$SCRIPT_DIR"
echo -e "${BLUE}📋 Getting Railway service ID from Terraform...${NC}"

SERVICE_ID=$(terraform output -raw railway_service_id 2>/dev/null || echo "")
PROJECT_ID=$(terraform output -raw railway_project_id 2>/dev/null || echo "")

if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
    echo -e "${RED}❌ Could not get Railway service ID from Terraform outputs${NC}"
    echo "Make sure you've run 'terraform apply' first"
    exit 1
fi

echo -e "${GREEN}✅ Found Railway service: $SERVICE_ID${NC}"
echo -e "${GREEN}✅ Found Railway project: $PROJECT_ID${NC}"
echo ""

# Navigate to project root
cd "$PROJECT_ROOT"

# Check if .railway directory exists (already linked)
if [ -d ".railway" ]; then
    echo -e "${BLUE}ℹ️  Directory already linked to Railway${NC}"
    # Check if it's linked to the correct service
    LINKED_SERVICE=$(cat .railway/service 2>/dev/null || echo "")
    if [ "$LINKED_SERVICE" != "$SERVICE_ID" ]; then
        echo -e "${YELLOW}⚠️  Linked to different service. Re-linking...${NC}"
        rm -rf .railway
    else
        echo -e "${GREEN}✅ Already linked to correct service${NC}"
    fi
fi

# Link directory to Railway service if not already linked
if [ ! -d ".railway" ]; then
    echo -e "${BLUE}🔗 Linking directory to Railway service...${NC}"
    
    # Use Railway CLI to link (more reliable than manual .railway creation)
    railway link --service "$SERVICE_ID" --project "$PROJECT_ID" 2>/dev/null || {
        # Fallback: create .railway directory manually
        mkdir -p .railway
        echo "$SERVICE_ID" > .railway/service
        echo "$PROJECT_ID" > .railway/project
        echo -e "${GREEN}✅ Linked to Railway service: $SERVICE_ID${NC}"
    }
else
    # Verify link is correct
    LINKED_SERVICE=$(cat .railway/service 2>/dev/null || echo "")
    if [ "$LINKED_SERVICE" != "$SERVICE_ID" ]; then
        echo -e "${YELLOW}⚠️  Re-linking to correct service...${NC}"
        rm -rf .railway
        railway link --service "$SERVICE_ID" --project "$PROJECT_ID" 2>/dev/null || {
            mkdir -p .railway
            echo "$SERVICE_ID" > .railway/service
            echo "$PROJECT_ID" > .railway/project
        }
    fi
    echo -e "${GREEN}✅ Linked to Railway service: $SERVICE_ID${NC}"
fi

# Build the project first
echo ""
echo -e "${BLUE}🔨 Building project...${NC}"
npm run build:server || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Deploy to Railway
echo -e "${BLUE}🚀 Deploying to Railway...${NC}"
echo "Service ID: $SERVICE_ID"
echo "Project ID: $PROJECT_ID"
echo "Working directory: $PROJECT_ROOT"
echo ""

# Set Railway environment variables for CLI
export RAILWAY_SERVICE="$SERVICE_ID"
export RAILWAY_PROJECT="$PROJECT_ID"

# Use Railway CLI to deploy from current directory
# Railway will detect the project structure and deploy accordingly
railway up || {
    echo -e "${YELLOW}⚠️  Railway CLI deployment failed, trying alternative method...${NC}"
    
    # Alternative: Use Railway API to trigger deployment
    echo "Attempting deployment via Railway API..."
    
    # Note: Railway API deployment is more complex and requires additional setup
    # For now, just show instructions
    echo -e "${YELLOW}Please check:${NC}"
    echo "1. Railway CLI is properly authenticated: railway login"
    echo "2. Service ID is correct: $SERVICE_ID"
    echo "3. Try manually: railway up --service $SERVICE_ID"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your application should be live on Railway shortly."
echo "Check your Railway dashboard for the deployment status."
