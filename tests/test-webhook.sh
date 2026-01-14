#!/bin/bash
# tests/test-webhook.sh
# Test script for Strapi webhook endpoint

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_URL="${WEBHOOK_URL:-http://localhost:4321/api/webhooks/strapi-content}"
WEBHOOK_SECRET="${STRAPI_WEBHOOK_SECRET}"

if [ -z "$WEBHOOK_SECRET" ]; then
  echo -e "${RED}Error: STRAPI_WEBHOOK_SECRET is not set${NC}"
  echo "Please set the environment variable or add it to .env"
  exit 1
fi

echo -e "${YELLOW}Testing Strapi Webhook Endpoint${NC}"
echo "URL: $WEBHOOK_URL"
echo ""

# Test 1: Article update
echo -e "${YELLOW}Test 1: Article Update${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d '{
    "event": "entry.update",
    "model": "article",
    "entry": {
      "id": 123,
      "slug": "control-plane-for-modern-service-providers",
      "updatedAt": "2026-02-05T10:00:00.000Z"
    }
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Success${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Failed (HTTP $HTTP_STATUS)${NC}"
  echo "$BODY"
fi
echo ""

# Test 2: Author update
echo -e "${YELLOW}Test 2: Author Update${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d '{
    "event": "entry.update",
    "model": "author",
    "entry": {
      "id": 5,
      "name": "Jane Doe",
      "updatedAt": "2026-02-05T10:00:00.000Z"
    }
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Success${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Failed (HTTP $HTTP_STATUS)${NC}"
  echo "$BODY"
fi
echo ""

# Test 3: Invalid secret (should fail)
echo -e "${YELLOW}Test 3: Invalid Secret (should fail with 401)${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: wrong-secret" \
  -d '{
    "event": "entry.update",
    "model": "article",
    "entry": {
      "id": 123,
      "slug": "test-article"
    }
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected (HTTP 401)${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Expected 401, got HTTP $HTTP_STATUS${NC}"
  echo "$BODY"
fi
echo ""

# Test 4: Missing secret header (should fail)
echo -e "${YELLOW}Test 4: Missing Secret Header (should fail with 401)${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "entry.update",
    "model": "article",
    "entry": {
      "id": 123,
      "slug": "test-article"
    }
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected (HTTP 401)${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Expected 401, got HTTP $HTTP_STATUS${NC}"
  echo "$BODY"
fi
echo ""

echo -e "${GREEN}All tests completed!${NC}"
