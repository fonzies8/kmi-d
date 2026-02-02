#!/bin/bash
# Admin Panel API Test Script

BASE_URL="http://localhost:3008/admin/api"
SESSION_COOKIE=""

echo "======================================"
echo "Admin Panel API Test"
echo "======================================"
echo ""

# Get session from login first
echo "[1] Testing login..."
curl -s -X POST http://localhost:3008/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' \
  -c cookies.txt -b cookies.txt | jq '.'
echo ""

# Test GET Products
echo "[2] Testing GET /api/products..."
curl -s -X GET $BASE_URL/products \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.products | length'
echo ""

# Test GET Services
echo "[3] Testing GET /api/services..."
curl -s -X GET $BASE_URL/services \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.services | length'
echo ""

# Test GET Homepage Cards
echo "[4] Testing GET /api/homepage-cards..."
curl -s -X GET $BASE_URL/homepage-cards \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.cards | length'
echo ""

# Test GET Settings
echo "[5] Testing GET /api/settings..."
curl -s -X GET $BASE_URL/settings \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq 'keys | length'
echo ""

echo "[Test Complete]"
