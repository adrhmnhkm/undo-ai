# undoai Usage Guide

Detailed guide for using undoai effectively.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Common Workflows](#common-workflows)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Installation

### Option 1: Use from Source

```bash
# Clone repository
git clone <your-repo-url>
cd undoai

# Install dependencies
pnpm install

# Build
pnpm build

# Run
node dist/cli/index.js <command>
```

### Option 2: Global Installation (Recommended)

```bash
# After building
pnpm link --global

# Now use anywhere
undoai watch
undoai restore
undoai status
```

## Basic Usage

### Start Watching

Navigate to your project directory and start watching:

```bash
cd ~/my-project
undoai watch
```

**Output:**
```
✅ undoai is now watching
📁 Project: /home/user/my-project
💾 Storage: /home/user/.undoai
🔒 100% local - your code never leaves this machine

ℹ️  Watching for file changes... (Press Ctrl+C to stop)
```

Leave this terminal running. Open a new terminal for coding.

### Make Changes

Work normally with your AI coding assistant (Cursor, Claude, etc). When AI modifies 5+ files:

```
  📝 [change] src/auth.ts
  📝 [change] src/db.ts
  📝 [add] src/utils.ts
  📝 [change] package.json
  📝 [delete] old-file.ts
📸 Snapshot saved (5 files changed)
Snapshot ID: 1703265420000
```

### Restore from Snapshot

If AI breaks something:

```bash
undoai restore
```

**Interactive selection:**
```
ℹ️  Available snapshots:

? Which snapshot do you want to restore?
❯ 1. [2 mins ago]   5 files   🤖 AI
  2. [15 mins ago]  8 files   🤖 AI  
  3. [1 hour ago]   3 files   🤖 AI
  ❌ Cancel

? This will overwrite current files. Continue? (Y/n)
```

Select snapshot and confirm. Files will be restored instantly.

## Common Workflows

### Workflow 1: Safe AI Experimentation

```bash
# 1. Start watcher
undoai watch

# 2. Ask AI to refactor your code
# AI modifies multiple files
# → Snapshot automatically created

# 3. Test the changes
npm test

# 4a. If it works - great! Continue coding

# 4b. If it breaks - instant rollback
undoai restore  # Select latest snapshot
```

### Workflow 2: Multiple Attempts

```bash
# 1. Start watcher
undoai watch

# 2. Try approach A (AI generates code)
# → Snapshot #1 created

# 3. Test - doesn't work perfectly

# 4. Try approach B (AI rewrites)
# → Snapshot #2 created

# 5. Test - worse! Go back to A
undoai restore  # Select snapshot #1
```

### Workflow 3: Before Big Changes

```bash
# Before asking AI to make big changes:

# 1. Check current status
undoai status

# 2. Start watcher if not running
undoai watch

# 3. Proceed with AI changes
# → Automatic snapshots created

# 4. If needed, restore
undoai restore
```

## Advanced Usage

### Custom Burst Threshold

Edit `src/cli/commands/watch.ts`:

```typescript
const watcher = new FileWatcher({
    watchPath: projectRoot,
    onBurstChange: (changedFiles) => { /* ... */ },
    burstThreshold: 3,  // Change to 3 files instead of 5
    debounceDelay: 2000,
});
```

Then rebuild:
```bash
pnpm build
```

### Manual Snapshot Inspection

```bash
# View all snapshots
ls -la ~/.undoai/snapshots/

# View specific snapshot metadata
cat ~/.undoai/snapshots/1703265420000/metadata.json

# View saved files
ls ~/.undoai/snapshots/1703265420000/files/
```

### Clean Up Old Snapshots

```bash
# Remove all snapshots
rm -rf ~/.undoai/snapshots/*

# Remove specific snapshot
rm -rf ~/.undoai/snapshots/1703265420000

# Or remove snapshots older than 7 days
find ~/.undoai/snapshots -mtime +7 -type d -exec rm -rf {} +
```

### Export/Backup Snapshots

```bash
# Backup all snapshots
tar -czf undoai-backup.tar.gz ~/.undoai/

# Restore backup
tar -xzf undoai-backup.tar.gz -C ~/
```

## Troubleshooting

### Problem: "undoai is already watching"

**Cause:** Watcher is already running

**Solution:**
```bash
# Check if running
undoai status

# Stop it
undoai stop

# Or find and kill process
ps aux | grep "undoai watch"
kill <PID>

# Then start again
undoai watch
```

### Problem: "No snapshots available"

**Cause:** No burst detected yet (< 5 files changed)

**Solution:**
- Make sure watcher is running (`undoai status`)
- Modify at least 5 files
- Wait 2 seconds for snapshot creation
- Or lower burst threshold (see Advanced Usage)

### Problem: Snapshot not created

**Possible causes:**

1. **Not enough files changed**
   - Default threshold: 5 files
   - Check: `undoai status`

2. **Changes too slow**
   - Debounce timer resets after 2s of inactivity
   - Quick burst needed

3. **Files in ignored directories**
   - `node_modules`, `.git`, `dist`, `build` are ignored

4. **Permission issues**
   - Check write permissions for `~/.undoai/`

**Debug:**
```bash
# Check watcher output in terminal
# Should see individual file changes logged:
  📝 [change] src/file1.ts
  📝 [change] src/file2.ts
  ...
```

### Problem: Restore fails

**Error: "Snapshot was created in different project"**

**Cause:** Snapshot from different directory

**Solution:**
- Snapshots are project-specific
- Navigate to correct project directory:
```bash
cd /path/to/original/project
undoai restore
```

**Error: "Snapshot file not found"**

**Cause:** File moved/renamed in original project

**Solution:**
- File paths in snapshot are absolute
- If project moved, snapshot won't match
- This is a known limitation

## Best Practices

### 1. Always Run Watcher

Start watcher at beginning of coding session:
```bash
# Add to your workflow
cd ~/my-project
undoai watch &  # Run in background
```

Or use a terminal multiplexer (tmux/screen).

### 2. Check Status Regularly

```bash
undoai status
```

Verify:
- ✅ Watcher is running
- ✅ Snapshots are being created
- ✅ Storage size is reasonable

### 3. Combine with Git

undoai complements git:

```bash
# Normal workflow
git commit -m "working state"

# Let AI make changes
# → undoai creates snapshots

# If AI breaks it
undoai restore  # Quick rollback

# If AI improves it
git add .
git commit -m "AI improvements"
```

### 4. Clean Up Periodically

```bash
# Check storage size
undoai status

# If too large, remove old snapshots
# Keep last 10 snapshots
ls -t ~/.undoai/snapshots/ | tail -n +11 | xargs -I {} rm -rf ~/.undoai/snapshots/{}
```

### 5. Test Immediately

After AI changes:
1. Let snapshot be created (wait 2s)
2. Test immediately
3. If broken, restore before making more changes

### 6. Use for Experiments

When trying new approaches:
```bash
# Current state -> snapshot
# Try approach A -> snapshot
# Try approach B -> snapshot
# Compare and choose best
```

### 7. Don't Rely on Forever

Snapshots are temporary safety net, not long-term backup:
- Use git for version control
- Use undoai for instant rollback
- Don't keep snapshots for months

## Configuration Tips

### Ignore Additional Directories

Edit `src/watcher.ts`:

```typescript
ignored: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',      // Add your directories
    '**/.next/**',
    '**/vendor/**',
],
```

### Adjust Timing

Faster burst detection (1 second):
```typescript
debounceDelay: 1000,  // Was 2000
```

Detect smaller changes (3 files):
```typescript
burstThreshold: 3,  // Was 5
```

Rebuild after changes:
```bash
pnpm build
```

## Examples

### Example: Refactoring Session

```bash
# Start
$ undoai watch
✅ undoai is now watching

# Ask AI: "refactor auth module"
# AI modifies: auth.ts, types.ts, utils.ts, test.ts, index.ts
📸 Snapshot saved (5 files changed)

# Test
$ npm test
FAIL

# Instant rollback
$ undoai restore
? Which snapshot? ❯ 1. [1 min ago] 5 files 🤖 AI
✅ Restored 5 files

# Try different approach
# Ask AI: "refactor auth module using different pattern"
📸 Snapshot saved (5 files changed)

# Test
$ npm test
PASS ✅

# Keep this version!
$ git add .
$ git commit -m "refactor: improve auth module"
```

### Example: Feature Development

```bash
# Planning
$ undoai watch
$ undoai status
🟢 Running

# Development
# Ask AI: "add user profile feature"
# AI creates multiple files
📸 Snapshot saved (7 files changed)

# Review changes
# Looks good but one file needs tweaking

# Manual edit that one file
# Other 6 files are perfect

# Commit
$ git add .
$ git commit -m "feat: add user profiles"
```

---

**Need help?** Check [README.md](./README.md) or open a GitHub issue.
