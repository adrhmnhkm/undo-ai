#!/bin/bash
# Test 1: Burst Detection (3+ files)

echo "🧪 Test 1: Burst Detection"
echo "=========================="
echo ""

# Cleanup
rm -f test-burst-*.ts 2>/dev/null

echo "Creating 3 test files..."
sleep 1

# Create 3 files rapidly
echo "export const test1 = 'hello';" > test-burst-1.ts
echo "export const test2 = 'world';" > test-burst-2.ts
echo "export const test3 = 'foo';" > test-burst-3.ts

echo "✅ Created 3 files"
echo ""
echo "Wait 3 seconds for debounce..."
sleep 3

echo ""
echo "📊 Check watcher output above for:"
echo "   - Should see: 📸 Snapshot saved (3 files changed)"
echo "   - Should see: Reason: Burst detected (3 files)"
echo ""

# Check snapshot created
SNAPSHOT_COUNT=$(ls -1 ~/.undoai/snapshots/ 2>/dev/null | wc -l)
echo "📁 Total snapshots: $SNAPSHOT_COUNT"
echo ""

echo "✅ Test 1 completed!"
echo ""
