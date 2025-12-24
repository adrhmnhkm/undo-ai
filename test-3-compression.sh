#!/bin/bash
# Test 3: Compression Verification

echo "🧪 Test 3: Compression Verification"
echo "===================================="
echo ""

echo "Checking snapshot files..."
echo ""

SNAPSHOTS=$(ls -1 ~/.undoai/snapshots/ 2>/dev/null)

if [ -z "$SNAPSHOTS" ]; then
    echo "❌ No snapshots found!"
    echo "   Run test-1-burst.sh first"
    exit 1
fi

# Get latest snapshot
LATEST=$(ls -1t ~/.undoai/snapshots/ | head -n 1)
FILES_DIR="$HOME/.undoai/snapshots/$LATEST/files"

echo "📁 Latest snapshot: $LATEST"
echo ""

if [ ! -d "$FILES_DIR" ]; then
    echo "❌ No files directory found!"
    exit 1
fi

echo "📋 Files in snapshot:"
echo ""
ls -lh "$FILES_DIR/"
echo ""

echo "🔍 Checking compression..."
echo ""

GZ_COUNT=$(ls -1 "$FILES_DIR"/*.gz 2>/dev/null | wc -l)
ALL_COUNT=$(ls -1 "$FILES_DIR"/ 2>/dev/null | wc -l)

echo "Total files: $ALL_COUNT"
echo "Compressed (.gz): $GZ_COUNT"
echo ""

if [ "$GZ_COUNT" -gt 0 ]; then
    echo "✅ Compression is working!"
    echo ""
    echo "Verifying gzip format:"
    for f in "$FILES_DIR"/*.gz; do
        if [ -f "$f" ]; then
            FILE_TYPE=$(file "$f" | grep -o "gzip compressed")
            if [ -n "$FILE_TYPE" ]; then
                echo "   ✅ $(basename $f): $FILE_TYPE"
            else
                echo "   ❌ $(basename $f): NOT gzip!"
            fi
        fi
    done
    
    echo ""
    echo "📊 Storage savings calculation:"
    
    # Try to calculate savings
    TOTAL_COMPRESSED=0
    TOTAL_ORIGINAL=0
    
    for f in "$FILES_DIR"/*.gz; do
        if [ -f "$f" ]; then
            COMPRESSED_SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null)
            TOTAL_COMPRESSED=$((TOTAL_COMPRESSED + COMPRESSED_SIZE))
            
            # Decompress to temp and measure
            TEMP_FILE=$(mktemp)
            gunzip -c "$f" > "$TEMP_FILE" 2>/dev/null
            ORIGINAL_SIZE=$(stat -f%z "$TEMP_FILE" 2>/dev/null || stat -c%s "$TEMP_FILE" 2>/dev/null)
            TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + ORIGINAL_SIZE))
            rm "$TEMP_FILE"
        fi
    done
    
    if [ $TOTAL_ORIGINAL -gt 0 ]; then
        SAVINGS=$((100 - (TOTAL_COMPRESSED * 100 / TOTAL_ORIGINAL)))
        echo "   Original size:   $TOTAL_ORIGINAL bytes"
        echo "   Compressed size: $TOTAL_COMPRESSED bytes"
        echo "   Savings:         $SAVINGS%"
    fi
else
    echo "❌ No compressed files found!"
    echo "   Expected files ending with .gz"
fi

echo ""
echo "✅ Test 3 completed!"
echo ""
