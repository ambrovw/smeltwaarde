#!/bin/bash
set -eu

# deploy_s3.sh
# Zero-argument deploy script. Uploads built site (dist/) to S3 bucket using local AWS profile 'ambro'.
# This is intentionally non-interactive: run it with no arguments.

PROFILE="ambro"
REGION="af-south-1"
BUCKET="smeltwaarde.ncah.co.za"
DIST_DIR="dist"

echo "Building and deploying to s3://$BUCKET/..."
npm run build
aws s3 sync "$DIST_DIR/" "s3://$BUCKET/" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --delete
echo "Deployment complete."
