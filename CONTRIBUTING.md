# Contributing to undoai

Thank you for your interest in contributing to undoai! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (package manager)
- Git
- Basic TypeScript knowledge

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/undoai.git
cd undoai
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Build the Project**
```bash
pnpm build
```

4. **Test Your Changes**
```bash
# Run the CLI locally
node dist/cli/index.js watch

# In another terminal
bash test-watcher.sh
```

## 📁 Project Structure

```
undoai/
├── src/
│   ├── watcher.ts              # File watching logic
│   ├── core/
│   │   ├── storage.ts          # File storage operations
│   │   ├── snapshot.ts         # Snapshot management
│   │   └── daemon.ts           # Process management
│   ├── cli/
│   │   ├── index.ts            # CLI entry point
│   │   └── commands/           # Command implementations
│   │       ├── watch.ts
│   │       ├── restore.ts
│   │       ├── stop.ts
│   │       └── status.ts
│   └── utils/
│       └── logger.ts           # Console logging
├── dist/                       # Compiled output (generated)
├── test-files/                 # Test files (ignored by git)
└── test-watcher.sh            # Test script
```

## 🔧 Development Workflow

### Making Changes

1. **Create a Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

2. **Make Your Changes**
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

3. **Test Your Changes**
```bash
# Build
pnpm build

# Test manually
node dist/cli/index.js <command>
```

4. **Commit Your Changes**
```bash
git add .
git commit -m "feat: add your feature description"
# or
git commit -m "fix: fix your bug description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

5. **Push and Create PR**
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Code Style

### TypeScript Guidelines

- **Use explicit types** where clarity is needed
- **Use interfaces** for object shapes
- **Use const** for variables that don't change
- **Export types** for public APIs

**Example:**
```typescript
// Good
export interface SnapshotMetadata {
    timestamp: number;
    fileCount: number;
}

function createSnapshot(files: Set<string>): string {
    const snapshotId = Date.now().toString();
    // ...
    return snapshotId;
}

// Avoid
function createSnapshot(files) {  // Missing type
    var id = Date.now();          // Use const
    // ...
}
```

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `snapshot-manager.ts`)
- **Classes**: `PascalCase` (e.g., `SnapshotManager`)
- **Functions**: `camelCase` (e.g., `createSnapshot`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `STORAGE_PATHS`)
- **Interfaces**: `PascalCase` (e.g., `WatcherOptions`)

### Comments

- Use JSDoc for public APIs
- Explain "why" not "what" in comments
- Keep comments up-to-date

**Example:**
```typescript
/**
 * Create a snapshot from changed files
 * @param changedFiles - Set of file paths that changed
 * @param label - Snapshot label (AI_BURST or AUTO)
 * @returns Snapshot ID (timestamp)
 */
createSnapshot(changedFiles: Set<string>, label: string): string {
    // Generate timestamp-based ID for chronological sorting
    const snapshotId = Date.now().toString();
    // ...
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] `undoai watch` - starts correctly
- [ ] Burst detection triggers (5+ files)
- [ ] `undoai restore` - shows snapshots and restores
- [ ] `undoai stop` - stops watcher
- [ ] `undoai status` - shows correct info
- [ ] Edge cases:
  - [ ] Empty snapshots directory
  - [ ] Non-existent snapshot restore
  - [ ] Stopping when not running
  - [ ] Multiple rapid bursts

### Test Script

Use the provided test script:
```bash
bash test-watcher.sh
```

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description** - What happened vs what should happen
2. **Steps to Reproduce** - Exact commands run
3. **Environment**:
   - OS version
   - Node.js version
   - pnpm version
4. **Output** - Console output or error messages
5. **Snapshot Info** (if relevant):
   - `undoai status` output
   - Contents of `~/.undoai/`

**Example:**
```markdown
## Bug Description
`undoai restore` fails when snapshot directory is empty

## Steps to Reproduce
1. `rm -rf ~/.undoai/snapshots/*`
2. `node dist/cli/index.js restore`

## Expected
Should show "No snapshots available" message

## Actual
TypeError: Cannot read property 'length' of undefined

## Environment
- OS: Ubuntu 22.04
- Node: v20.10.0
- pnpm: 8.15.0
```

## ✨ Feature Requests

For feature requests:

1. **Check Roadmap** - See if already planned in [README.md](./README.md)
2. **Open Discussion** - Create a GitHub Discussion first
3. **Describe Use Case** - Why is this needed?
4. **Suggest Implementation** - How might it work?

## 📦 Adding Dependencies

Before adding new dependencies:

1. **Check if really needed** - Can we implement internally?
2. **Prefer small packages** - Avoid heavy dependencies
3. **Check maintenance** - Is it actively maintained?
4. **Document reason** - Why this package?

Add to correct section:
```bash
# Production dependency
pnpm add package-name

# Dev dependency
pnpm add -D package-name
```

## 🚀 Release Process

(For maintainers)

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```
4. Create GitHub release
5. Publish to npm (future):
```bash
pnpm publish
```

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Questions?

- Open a GitHub Discussion
- Check existing issues
- Read the [README.md](./README.md)

Thank you for contributing to undoai! 🎉
