#!/bin/bash
# verify-deploy.sh — Post-deploy health check for MejoraApp
#
# Usage: ./scripts/verify-deploy.sh [URL]
# Default URL: https://app.mejoraok.com

set -euo pipefail

URL="${1:-https://app.mejoraok.com}"
MAX_RETRIES=3
RETRY_DELAY=10

echo "🔍 Verifying deployment at: $URL"
echo ""

# ── Check 1: HTTP Status ───────────────────────────────────────
echo "━━━ Check 1: HTTP Status ━━━"
for i in $(seq 1 $MAX_RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$URL" 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "✅ HTTP $STATUS — OK (attempt $i)"
    break
  fi
  echo "⚠️  HTTP $STATUS — attempt $i/$MAX_RETRIES"
  if [ "$i" -lt "$MAX_RETRIES" ]; then
    echo "   Retrying in ${RETRY_DELAY}s..."
    sleep $RETRY_DELAY
  else
    echo "❌ Health check failed after $MAX_RETRIES attempts"
    exit 1
  fi
done

# ── Check 2: HTML Content ──────────────────────────────────────
echo ""
echo "━━━ Check 2: HTML Content ━━━"
BODY=$(curl -s --max-time 15 "$URL" 2>/dev/null)

if echo "$BODY" | grep -q "MejoraApp"; then
  echo "✅ Contains 'MejoraApp' title"
else
  echo "⚠️  Missing 'MejoraApp' in response body"
fi

if echo "$BODY" | grep -q "root"; then
  echo "✅ Contains React root element"
else
  echo "❌ Missing React root element"
  exit 1
fi

if echo "$BODY" | grep -q "src="; then
  echo "✅ Contains script references"
else
  echo "⚠️  Missing script references"
fi

# ── Check 3: Security Headers ──────────────────────────────────
echo ""
echo "━━━ Check 3: Security Headers ━━━"
HEADERS=$(curl -sI --max-time 15 "$URL" 2>/dev/null)

check_header() {
  local name="$1"
  local expected="$2"
  if echo "$HEADERS" | grep -qi "$name"; then
    echo "✅ $name present"
  else
    echo "⚠️  $name missing"
  fi
}

check_header "X-Content-Type-Options" "nosniff"
check_header "X-Frame-Options" "DENY"
check_header "Referrer-Policy" "strict-origin"
check_header "Permissions-Policy" "camera"

# ── Check 4: Static Assets ─────────────────────────────────────
echo ""
echo "━━━ Check 4: Static Assets ━━━"
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL/robots.txt" 2>/dev/null || echo "000")
if [ "$ROBOTS_STATUS" = "200" ]; then
  echo "✅ /robots.txt — OK"
else
  echo "⚠️  /robots.txt — HTTP $ROBOTS_STATUS"
fi

MANIFEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL/manifest.json" 2>/dev/null || echo "000")
if [ "$MANIFEST_STATUS" = "200" ]; then
  echo "✅ /manifest.json — OK"
else
  echo "⚠️  /manifest.json — HTTP $MANIFEST_STATUS"
fi

# ── Check 5: SPA Routing ───────────────────────────────────────
echo ""
echo "━━━ Check 5: SPA Routing ━━━"
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL/auth" 2>/dev/null || echo "000")
if [ "$AUTH_STATUS" = "200" ]; then
  echo "✅ /auth route — OK (SPA fallback working)"
else
  echo "⚠️  /auth route — HTTP $AUTH_STATUS"
fi

# ── Summary ─────────────────────────────────────────────────────
echo ""
echo "━━━ Summary ━━━"
echo "✅ Deployment verified at $URL"
echo "   Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
