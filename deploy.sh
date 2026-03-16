#!/bin/bash
set -e

PROJECT_ID="precise-office-485714-i8"
REGION="me-central1"
SERVICE_NAME="arqos-bot"

echo "═══════════════════════════════════════"
echo "  ARQOS v2.1 — Cloud Run Deployment"
echo "═══════════════════════════════════════"

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "▸ Enabling APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com --quiet

# Build and deploy from source (simpler than manual Docker build)
echo "▸ Building & deploying to Cloud Run (5-8 min)..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production" \
  --quiet

# Get URL
URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')

echo ""
echo "═══════════════════════════════════════"
echo "  ✓ ARQOS DEPLOYED SUCCESSFULLY"
echo "  URL: $URL"
echo "═══════════════════════════════════════"
echo ""
echo "Next: Map realco.ai domain →"
echo "https://console.cloud.google.com/run/domains?project=$PROJECT_ID"
