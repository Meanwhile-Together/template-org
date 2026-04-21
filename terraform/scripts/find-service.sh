#!/bin/bash
# Query Railway API to find a service by name in a project
# Used by Terraform external data source
# Returns JSON: {"service_id": "..." } or {"service_id": ""}
#
# IMPORTANT: Requires RAILWAY_TOKEN to be an Account/Team token (not Project token)
# Get from: https://railway.app/account/tokens

set -e

# Railway API endpoint (use .app domain - .com redirects to .app)
RAILWAY_API="https://backboard.railway.com/graphql/v2"

# Read input JSON from stdin (Terraform external data source format)
eval "$(jq -r '@sh "PROJECT_ID=\(.project_id) SERVICE_NAME=\(.service_name) RAILWAY_TOKEN=\(.railway_token)"')"

# If no project ID, return empty
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ] || [ "$PROJECT_ID" = "" ]; then
  echo '{"service_id": ""}'
  exit 0
fi

# If no token, return empty (can't query API)
if [ -z "$RAILWAY_TOKEN" ] || [ "$RAILWAY_TOKEN" = "null" ]; then
  echo '{"service_id": ""}' >&2
  echo '{"service_id": ""}'
  exit 0
fi

# Query Railway GraphQL API for services in the project
QUERY='query($projectId: String!) { project(id: $projectId) { services { edges { node { id name } } } } }'

RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$QUERY\", \"variables\": {\"projectId\": \"$PROJECT_ID\"}}" \
  "$RAILWAY_API")

# Check for API errors
ERROR=$(echo "$RESPONSE" | jq -r '.errors[0].message // empty' 2>/dev/null || echo "")
if [ -n "$ERROR" ]; then
  echo "Railway API error: $ERROR" >&2
  echo '{"service_id": ""}'
  exit 0
fi

# Extract service ID by name
SERVICE_ID=$(echo "$RESPONSE" | jq -r --arg name "$SERVICE_NAME" \
  '.data.project.services.edges[] | select(.node.name == $name) | .node.id // empty' 2>/dev/null || echo "")

# Return JSON result
if [ -n "$SERVICE_ID" ] && [ "$SERVICE_ID" != "null" ]; then
  jq -n --arg id "$SERVICE_ID" '{"service_id": $id}'
else
  echo '{"service_id": ""}'
fi
