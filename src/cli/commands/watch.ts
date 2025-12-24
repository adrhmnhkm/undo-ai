import { FileWatcher } from '../../watcher.js';
import { SnapshotManager } from '../../core/snapshot.js';
import { Storage, STORAGE_PATHS } from '../../core/storage.js';
import { DaemonManager } from '../../core/daemon.js';
import { Logger } from '../../utils/logger.js';
import path from 'path';
import { minimatch } from 'minimatch';

/**
 * Important file patterns that should trigger snapshot even if only 1 file changed
 */
const IMPORTANT_FILE_PATTERNS = [
    '.env',
    '.env.*',
    'package.json',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'tsconfig.json',
    'jsconfig.json',
    '**/*.prisma',
    '**/schema.prisma',
    '**/migrations/**',
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.*.yml',
    '.github/workflows/**',
    '.gitlab-ci.yml',
    'Jenkinsfile',
];

/**
 * Check if file is important (should trigger snapshot even if single file)
 */
function isImportantFile(filePath: string, projectRoot: string): boolean {
    const relativePath = path.relative(projectRoot, filePath);
    return IMPORTANT_FILE_PATTERNS.some(pattern => minimatch(relativePath, pattern));
}

/**
 * Smart detection: should we create snapshot?
 */
function shouldCreateSnapshot(
    changedFiles: Set<string>,
    projectRoot: string,
    timeDiff?: number
): { should: boolean; reason: string } {
    const fileCount = changedFiles.size;

    // Priority 1: Burst detection (≥3 files)
    if (fileCount >= 3) {
        return { should: true, reason: `Burst detected (${fileCount} files)` };
    }

    // Priority 2: Important file changed (even if 1 file)
    const hasImportant = Array.from(changedFiles).some(file =>
        isImportantFile(file, projectRoot)
    );
    if (hasImportant) {
        return { should: true, reason: 'Important file changed' };
    }

    // Priority 3: Velocity-based AI detection
    if (timeDiff && fileCount >= 2 && timeDiff < 1000) {
        // 2+ files in < 1 second = likely AI
        return { should: true, reason: 'High velocity change (likely AI)' };
    }

    return { should: false, reason: 'Below threshold' };
}

/**
 * Watch command - start watching for file changes
 */
export async function watchCommand(): Promise<void> {
    // Check if already running
    if (DaemonManager.isRunning()) {
        Logger.error('undoai is already watching');
        Logger.info('Use "undoai stop" to stop watching');
        process.exit(1);
    }

    // Initialize storage
    Storage.init();

    // Get current directory as project root
    const projectRoot = process.cwd();

    // Create snapshot manager
    const snapshotManager = new SnapshotManager(projectRoot);

    // Create initial snapshot if needed
    const existingSnapshots = snapshotManager.listSnapshots();
    if (existingSnapshots.length === 0) {
        console.log('');
        Logger.info('📸 Creating initial baseline snapshot...');
        Logger.dim('This captures your current working state');

        // We'll implement full initial snapshot in next iteration
        // For now, just log that baseline will be created on first change
        Logger.info('💡 Baseline will be created on first file change');
        console.log('');
    }

    let lastChangeTime = Date.now();

    // Create file watcher with smart detection
    const watcher = new FileWatcher({
        watchPath: projectRoot,
        onBurstChange: (changedFiles: Set<string>) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastChangeTime;
            lastChangeTime = currentTime;

            // Smart detection
            const detection = shouldCreateSnapshot(changedFiles, projectRoot, timeDiff);

            if (detection.should) {
                // Create snapshot
                try {
                    const snapshotId = snapshotManager.createSnapshot(changedFiles, 'AI_BURST');
                    Logger.snapshot(`Snapshot saved (${changedFiles.size} files changed)`);
                    Logger.dim(`Reason: ${detection.reason}`);
                    Logger.dim(`Snapshot ID: ${snapshotId}`);
                } catch (error) {
                    Logger.error(`Failed to create snapshot: ${error}`);
                }
            } else {
                // Just log, no snapshot
                Logger.dim(`${changedFiles.size} file(s) changed (${detection.reason})`);
            }
        },
        burstThreshold: 3, // Lowered from 5 to 3
        debounceDelay: 2000,
    });

    // Start watching
    watcher.start();

    // Mark daemon as running
    DaemonManager.markAsRunning(process.pid);

    // Display startup message
    console.log('');
    Logger.success('undoai is now watching');
    Logger.dim(`📁 Project: ${projectRoot}`);
    Logger.dim(`💾 Storage: ${STORAGE_PATHS.root}`);
    Logger.dim(`🔒 100% local - your code never leaves this machine`);
    console.log('');
    Logger.info('🎯 Smart detection enabled:');
    Logger.dim('  • ≥3 files changed = snapshot');
    Logger.dim('  • Important files (.env, package.json, etc) = snapshot');
    Logger.dim('  • High velocity changes = snapshot');
    console.log('');
    Logger.info('Watching for file changes... (Press Ctrl+C to stop)');
    console.log('');

    // Setup graceful shutdown
    DaemonManager.setupShutdownHandlers(async () => {
        await watcher.stop();
    });
}
