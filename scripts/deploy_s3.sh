#!/bin/bash
set -eu

# deploy_s3.sh
# Builds the site and syncs dist/ to an S3 bucket.
#
# Configure via environment variables (or edit the defaults below):
#   BUCKET       — target S3 bucket name (required)
#   AWS_PROFILE  — AWS CLI profile to use     (default: default)
#   AWS_REGION   — AWS region                 (default: us-east-1)

BUCKET="${BUCKET:-smeltwaarde.ncah.co.za}"
AWS_PROFILE="${AWS_PROFILE:-ambro}"
AWS_REGION="${AWS_REGION:-af-south-1}"
DIST_DIR="dist"

if [ -z "$BUCKET" ]; then
  echo "Error: BUCKET is not set." >&2
  echo "Usage: BUCKET=my-bucket AWS_PROFILE=my-profile AWS_REGION=eu-west-1 ./scripts/deploy_s3.sh" >&2
  exit 1
fi

echo "Building and deploying to s3://$BUCKET/ (profile: $AWS_PROFILE, region: $AWS_REGION)..."
npm run build
node scripts/generate-en-index.cjs
aws s3 sync "$DIST_DIR/" "s3://$BUCKET/" \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --delete
echo "Deployment complete."
