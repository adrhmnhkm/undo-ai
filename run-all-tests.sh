#!/bin/bash
# Run All Tests

echo "🚀 Running All Week 1 Tests"
echo "==========================="
echo ""

# Test 1
echo "▶️  Running Test 1..."
bash test-1-burst.sh

# Wait a bit
sleep 2

# Test 3
echo "▶️  Running Test 3..."
bash test-3-compression.sh

# Test 2 instructions
echo ""
echo "▶️  Test 2 (Selective Restore) - Manual:"
echo ""
cat test-2-selective.sh | grep -A 20 "Step 1"

echo ""
echo "🎉 Automated tests complete!"
echo ""
echo "Next: Run Test 2 manually with:"
echo "   node dist/cli/index.js restore -i"
echo ""
