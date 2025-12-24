#!/bin/bash

echo "🧪 Testing File Watcher - Creating test files..."
echo ""

# Create test directory
mkdir -p test-files

# Create 5 files quickly (to trigger burst)
echo "Creating 5 files..."
for i in {1..5}; do
  echo "Test content $i" > test-files/test-file-$i.txt
  echo "  ✓ Created test-file-$i.txt"
done

echo ""
echo "✅ Done! Wait 2 seconds for burst detection..."
echo "   The watcher should trigger the callback now!"



