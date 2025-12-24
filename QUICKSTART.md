# undoai - Quick Reference

## Installation
```bash
pnpm install
pnpm build
```

## Commands

### Start Watching
```bash
node dist/cli/index.js watch
# or after global install:
undoai watch
```

### Restore from Snapshot
```bash
node dist/cli/index.js restore
# or:
undoai restore
```

### Stop Watching
```bash
node dist/cli/index.js stop
# or:
undoai stop
```

### Check Status
```bash
node dist/cli/index.js status
# or:
undoai status
```

## Quick Test
```bash
# Terminal 1: Start watcher
pnpm build
node dist/cli/index.js watch

# Terminal 2: Trigger burst
bash test-watcher.sh

# Terminal 2: Restore
node dist/cli/index.js restore
```

## Storage Location
```bash
~/.undoai/
├── daemon.pid
└── snapshots/
    └── <timestamp>/
        ├── metadata.json
        └── files/
```

## Configuration Defaults
- **Burst threshold**: 5 files
- **Debounce delay**: 2000ms (2 seconds)
- **Ignored dirs**: node_modules, .git, dist, build

## Global Install (Optional)
```bash
pnpm link --global
# Now use 'undoai' anywhere
```

## Documentation
- [README.md](./README.md) - Overview & features
- [USAGE.md](./USAGE.md) - Detailed usage guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guide

## Phase 1 Features ✅
✅ Auto-snapshot on burst (≥5 files)  
✅ Interactive restore  
✅ Daemon management  
✅ Status tracking  
✅ 100% local storage  
✅ Zero configuration  

## Coming in Phase 2
- Security scanning (secrets detection)
- Smart snapshot retention
- Diff viewer
- Selective file restore
