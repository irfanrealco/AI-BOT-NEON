#!/bin/bash
# Auto-setup for Cloud Shell — runs on open
set -e
echo "═══════════════════════════════════════"
echo "  ARQOS v2.0 — Auto Deploy Setup"
echo "═══════════════════════════════════════"
gcloud config set project precise-office-485714-i8
echo "Project set. Run: bash deploy.sh"
