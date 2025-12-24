#!/bin/bash
# Test 2: Selective Restore (Manual Test)

echo "🧪 Test 2: Selective Restore"
echo "============================"
echo ""

echo "Step 1: Delete some test files..."
rm -f test-burst-1.ts test-burst-2.ts 2>/dev/null
echo "✅ Deleted test-burst-1.ts and test-burst-2.ts"
echo ""

echo "Step 2: Now run selective restore:"
echo ""
echo "   node dist/cli/index.js restore -i"
echo ""
echo "Expected behavior:"
echo "   1. Shows list of snapshots"
echo "   2. Select latest snapshot"
echo "   3. Shows checkbox list of files"
echo "   4. Use SPACE to select files"
echo "   5. Use ENTER to confirm"
echo "   6. Shows preview before restore"
echo "   7. Confirm to restore"
echo ""
echo "Try it now! 👆"
echo ""
