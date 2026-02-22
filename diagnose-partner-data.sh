#!/bin/bash

echo "======================================"
echo "Partner Data Loading - Diagnosis Tool"
echo "======================================"
echo ""

echo "Step 1: Check database file exists"
if [ -f "data/db.json" ]; then
    echo "✓ data/db.json exists"
    PARTNER_COUNT=$(grep -c '"id": "partner-' data/db.json || echo "0")
    echo "  Partners in database: $PARTNER_COUNT"
    echo ""
    echo "  Partner IDs:"
    grep -o '"id": "partner-[^"]*"' data/db.json | sed 's/"id": "/  - /' | sed 's/"//'
else
    echo "✗ data/db.json NOT FOUND"
fi

echo ""
echo "Step 2: Instructions for manual testing"
echo "======================================"
echo ""
echo "1. Open DevTools (F12)"
echo "2. Go to Application/Storage → Local Storage"
echo "3. Find key 'angotour_auth'"
echo "4. Copy the partner ID from there"
echo "5. Go to Console tab"
echo "6. Run this command:"
echo "   fetch('/api/partners/{COPIED_ID}').then(r => r.json()).then(d => console.log(d))"
echo ""
echo "7. Check if the API returns the partner data or 404 error"
echo ""
echo "Step 3: Expected vs Actual"
echo "======================================"
echo ""
echo "Expected flow:"
echo "  1. Login → Partner login API returns { id: 'partner-xxx-xxx', companyName: '...', ... }"
echo "  2. ID stored in localStorage as 'angotour_auth'"
echo "  3. Dashboard calls GET /api/partners/partner-xxx-xxx"
echo "  4. API finds partner and returns full data"
echo ""
echo "If you see 'Partner not found' error:"
echo "  - Check if the ID in localStorage matches a partner in db.json"
echo "  - Try logging in again to get fresh ID"
echo "  - Check browser console for [v0] debug logs"
echo ""
