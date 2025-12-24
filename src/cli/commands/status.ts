import { DaemonManager } from '../../core/daemon.js';
import { Storage, STORAGE_PATHS } from '../../core/storage.js';
import { Logger } from '../../utils/logger.js';
import chalk from 'chalk';

/**
 * Status command - show daemon status and info
 */
export async function statusCommand(): Promise<void> {
    const isRunning = DaemonManager.isRunning();
    const isInitialized = Storage.isInitialized();

    console.log('');
    Logger.bold('undoai Status');
    console.log('');

    // Daemon status
    if (isRunning) {
        const pid = DaemonManager.getPid();
        console.log(chalk.green('🟢 Running') + chalk.dim(` (PID: ${pid})`));
    } else {
        console.log(chalk.red('🔴 Not running'));
    }

    console.log('');

    // Storage info
    if (isInitialized) {
        const snapshotIds = Storage.getSnapshotIds();
        const snapshotCount = snapshotIds.length;
        const storageSize = Storage.getStorageSize();

        Logger.dim('💾 Storage:');
        console.log(chalk.dim(`   Location: ${STORAGE_PATHS.root}`));
        console.log(chalk.dim(`   Snapshots: ${snapshotCount}`));
        console.log(chalk.dim(`   Size: ${Storage.formatBytes(storageSize)}`));
    } else {
        Logger.dim('💾 Storage: Not initialized');
        Logger.dim('   Run "undoai watch" to initialize');
    }

    console.log('');

    // Show commands
    Logger.dim('📝 Commands:');
    console.log(chalk.dim('   undoai watch    - Start watching'));
    console.log(chalk.dim('   undoai restore  - Restore snapshot'));
    console.log(chalk.dim('   undoai stop     - Stop watching'));
    console.log(chalk.dim('   undoai status   - Show this status'));
    console.log('');
}
