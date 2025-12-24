# undoai

**Free, local undo button for AI coding**

A zero-friction CLI tool that automatically creates snapshots when AI tools modify your code, allowing instant rollback when things break. Like [mrq](https://getmrq.com), but 100% free, open-source, and local.

## 🎯 Why undoai?

AI coding assistants (Cursor, Claude, Copilot) are powerful but can break working code. When AI modifies 5+ files at once and something breaks, you need an instant undo button.

**undoai** solves this by:
- 🔒 **100% Local & Private** - Your code never leaves your machine
- 📸 **Auto-Snapshots** - Detects AI burst changes (≥5 files) automatically
- ⚡ **Instant Restore** - One command to rollback all changes
- 💰 **Free Forever** - No accounts, no cloud, no subscriptions

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Start watching for changes
node dist/cli/index.js watch

# (In another terminal) Trigger AI changes...
# When AI breaks something:
node dist/cli/index.js restore
```

## 📦 Installation

### From Source

```bash
git clone <your-repo-url>
cd undoai
pnpm install
pnpm build
```

### Install Globally (Optional)

```bash
pnpm link --global

# Now you can use 'undoai' anywhere
undoai watch
```

## 💻 Commands

### `undoai watch`
Start watching for file changes in current directory.

```bash
undoai watch
```

**What it does:**
- Monitors all files in current directory
- Ignores `node_modules`, `.git`, `dist`, `build`
- Auto-creates snapshot when ≥5 files change within 2 seconds
- Runs in foreground (Press Ctrl+C to stop)

**Example output:**
```
✅ undoai is now watching
📁 Project: /home/user/my-project
💾 Storage: /home/user/.undoai
🔒 100% local - your code never leaves this machine

ℹ️  Watching for file changes... (Press Ctrl+C to stop)

  📝 [change] src/auth.ts
  📝 [change] src/db.ts
  📝 [add] src/new-feature.ts
  📝 [change] package.json
  📝 [change] README.md
📸 Snapshot saved (5 files changed)
```

---

### `undoai restore`
Restore files from a snapshot (interactive).

```bash
undoai restore
```

**What it does:**
- Shows list of available snapshots
- Displays relative time and file count
- Confirms before restoring
- Overwrites current files with snapshot contents

**Example output:**
```
ℹ️  Available snapshots:

? Which snapshot do you want to restore? (Use arrow keys)
❯ 1. [2 mins ago]   5 files   🤖 AI
  2. [15 mins ago]  8 files   🤖 AI  
  3. [1 hour ago]   3 files   🤖 AI
  ❌ Cancel

✅ Restored 5 files
From: 2 mins ago
```

---

### `undoai status`
Show current status and info.

```bash
undoai status
```

**Example output:**
```
undoai Status

🟢 Running (PID: 12345)

💾 Storage:
   Location: /home/user/.undoai
   Snapshots: 3
   Size: 24.5 KB

📝 Commands:
   undoai watch    - Start watching
   undoai restore  - Restore snapshot
   undoai stop     - Stop watching
   undoai status   - Show this status
```

---

### `undoai stop`
Stop the watching daemon.

```bash
undoai stop
```

## 🏗️ How It Works

### Architecture

```
undoai/
├── src/
│   ├── watcher.ts          # File watching with chokidar
│   ├── core/
│   │   ├── storage.ts      # Local file storage (~/.undoai)
│   │   ├── snapshot.ts     # Snapshot creation & restore
│   │   └── daemon.ts       # Process management
│   ├── cli/
│   │   ├── index.ts        # CLI entry point
│   │   └── commands/       # watch, restore, stop, status
│   └── utils/
│       └── logger.ts       # Pretty console output
```

### Storage Structure

```
~/.undoai/
├── daemon.pid                    # PID of running watcher
└── snapshots/
    ├── 1703265420000/           # Timestamp-based ID
    │   ├── metadata.json        # Snapshot info
    │   └── files/               # Copied files
    │       ├── src__auth.ts
    │       ├── src__db.ts
    │       └── ...
    └── 1703265480000/
        └── ...
```

**metadata.json:**
```json
{
  "timestamp": 1703265420000,
  "date": "2024-12-22T14:30:20.000Z",
  "projectRoot": "/home/user/my-project",
  "changedFiles": [
    "/home/user/my-project/src/auth.ts",
    "/home/user/my-project/src/db.ts"
  ],
  "fileCount": 5,
  "label": "AI_BURST"
}
```

### Burst Detection

1. File watcher detects changes
2. Buffers changes in a Set (prevents duplicates)
3. Debounces for 2 seconds
4. If ≥5 files changed → create snapshot
5. Snapshot contains: metadata + file copies

## 🆚 undoai vs Alternatives

| Feature | Git Stash | mrq | **undoai** |
|---------|-----------|-----|------------|
| **Cost** | Free | $15-50/mo | ✅ **Free** |
| **Privacy** | Local | Cloud (encrypted) | ✅ **100% Local** |
| **Automatic** | ❌ Manual | ✅ Auto | ✅ **Auto** |
| **Offline** | ✅ Yes | ❌ No | ✅ **Yes** |
| **Setup** | Complex | Account required | ✅ **Zero config** |
| **Open Source** | Yes | ❌ No | ✅ **MIT** |


## ❓ FAQ

**Q: How is this different from git?**  
A: Git requires manual commits and is polluted by intermediate snapshots. undoai is automatic and keeps snapshots separate from your git history.

**Q: Does this replace git?**  
A: No! undoai complements git. Use git for version control, undoai for instant AI change rollback.

**Q: Where are snapshots stored?**  
A: In `~/.undoai/snapshots/` on your local machine. Never sent to cloud.

**Q: How much disk space does it use?**  
A: Each snapshot contains only changed files. Typical snapshot: 10-100KB. Use `undoai status` to check.

**Q: Can I use this with Cursor/Claude/Copilot?**  
A: Yes! Works with any AI coding tool that modifies files.

**Q: What if I want to clean up old snapshots?**  
A: Currently manual: `rm -rf ~/.undoai/snapshots/<snapshot-id>`. Auto-cleanup coming in Phase 2.

---

**Made with ❤️ for developers who love AI coding but hate breaking changes**
