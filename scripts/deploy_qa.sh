#!/bin/bash
set -eu

# deploy_qa.sh
# Builds the site and syncs dist/ to the QA bucket (qa.smeltwaarde.co.za),
# overwrites robots.txt so QA is never indexed, and invalidates CloudFront.

BUCKET="${BUCKET:-qa.smeltwaarde.ncah.co.za}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-E3SM6RG0SN86W4}"
AWS_PROFILE="${AWS_PROFILE:-ambro}"
AWS_REGION="${AWS_REGION:-af-south-1}"
DIST_DIR="dist"

echo "Building and deploying to s3://$BUCKET/ (QA, profile: $AWS_PROFILE)..."
npm run build
node scripts/generate-en-index.cjs
aws s3 sync "$DIST_DIR/" "s3://$BUCKET/" \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --delete
printf 'User-agent: *\nDisallow: /\n' | aws s3 cp - "s3://$BUCKET/robots.txt" \
  --content-type text/plain \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION"
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --profile "$AWS_PROFILE" \
  --query "Invalidation.Id" --output text
echo "QA deployment complete: https://qa.smeltwaarde.co.za/"
