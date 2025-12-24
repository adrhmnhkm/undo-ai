import inquirer from 'inquirer';
import { SnapshotManager } from '../../core/snapshot.js';
import { Storage } from '../../core/storage.js';
import { Logger } from '../../utils/logger.js';
import path from 'path';
import { minimatch } from 'minimatch';

/**
 * Format relative time
 */
function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
}

interface RestoreOptions {
    interactive?: boolean;
    files?: string;
    pattern?: string;
}

/**
 * Restore command - restore files from a snapshot
 */
export async function restoreCommand(options: RestoreOptions = {}): Promise<void> {
    // Initialize storage if needed
    if (!Storage.isInitialized()) {
        Logger.error('No snapshots found. Start watching with "undoai watch" first.');
        process.exit(1);
    }

    // Get current directory
    const projectRoot = process.cwd();
    const snapshotManager = new SnapshotManager(projectRoot);

    // List available snapshots
    const snapshots = snapshotManager.listSnapshots();

    // Filter out empty snapshots (snapshots with 0 files)
    const validSnapshots = snapshots.filter(s => s.metadata.fileCount > 0);

    if (validSnapshots.length === 0) {
        Logger.error('No snapshots available');
        Logger.info('Start watching with "undoai watch" to create snapshots');
        process.exit(1);
    }

    console.log('');
    Logger.info('Available snapshots:');
    console.log('');

    // Create choices for inquirer
    const choices = validSnapshots.map((snapshot: { id: string; metadata: any }, index: number) => {
        const { id, metadata } = snapshot;
        const relativeTime = formatRelativeTime(metadata.timestamp);
        const label = metadata.label === 'AI_BURST' ? '🤖 AI' : '📝 Auto';

        return {
            name: `${index + 1}. [${relativeTime}]  ${metadata.fileCount} file${metadata.fileCount > 1 ? 's' : ''}  ${label}`,
            value: id,
            short: `Snapshot ${index + 1}`,
        };
    });

    // Add cancel option
    choices.push({
        name: '❌ Cancel',
        value: 'CANCEL',
        short: 'Cancel',
    });

    // Prompt user to select snapshot
    const { snapshotId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'snapshotId',
            message: 'Which snapshot do you want to restore?',
            choices,
            pageSize: 10,
        },
    ]);

    if (snapshotId === 'CANCEL') {
        Logger.info('Restore cancelled');
        process.exit(0);
    }

    // Get snapshot details
    const snapshot = snapshotManager.getSnapshot(snapshotId);
    if (!snapshot) {
        Logger.error('Snapshot not found');
        process.exit(1);
    }

    // Determine which files to restore
    let filesToRestore = snapshot.metadata.changedFiles;

    // FEATURE: Pattern-based filtering
    if (options.files) {
        const fileList = options.files.split(',').map(f => f.trim());
        filesToRestore = filesToRestore.filter((file: string) =>
            fileList.some(pattern => minimatch(file, pattern))
        );

        if (filesToRestore.length === 0) {
            Logger.error('No files match the specified pattern');
            process.exit(1);
        }

        console.log('');
        Logger.info(`Matched ${filesToRestore.length} files from pattern`);
    }

    // FEATURE: Interactive file selection
    if (options.interactive) {
        console.log('');
        Logger.info('Select files to restore:');
        console.log('');

        const fileChoices = filesToRestore.map((file: string) => {
            const relativePath = path.relative(projectRoot, file);
            return {
                name: relativePath,
                value: file,
                checked: false, // Default unchecked
            };
        });

        const { selectedFiles } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Select files (Space to select, Enter to confirm):',
                choices: fileChoices,
                pageSize: 15,
                validate: (answer) => {
                    if (answer.length === 0) {
                        return 'You must select at least one file';
                    }
                    return true;
                },
            },
        ]);

        filesToRestore = selectedFiles;

        if (filesToRestore.length === 0) {
            Logger.info('No files selected');
            process.exit(0);
        }
    }

    // Show preview of what will be restored
    console.log('');
    Logger.info(`📋 Preview: ${filesToRestore.length} file${filesToRestore.length > 1 ? 's' : ''} will be restored`);
    console.log('');

    filesToRestore.slice(0, 10).forEach((file: string) => {
        const relativePath = path.relative(projectRoot, file);
        console.log(`  ✏️  ${relativePath}`);
    });

    if (filesToRestore.length > 10) {
        console.log(`  ... and ${filesToRestore.length - 10} more`);
    }

    console.log('');
    Logger.warn('⚠️  Current changes to these files will be overwritten');

    // Confirm
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Continue with restore?',
            default: true,
        },
    ]);

    if (!confirm) {
        Logger.info('Restore cancelled');
        process.exit(0);
    }

    // Restore snapshot (selective or full)
    try {
        let restoredCount = 0;

        if (options.interactive || options.files) {
            // Selective restore
            for (const file of filesToRestore) {
                try {
                    Storage.restoreFileFromSnapshot(file, snapshotId, projectRoot);
                    restoredCount++;
                } catch (error) {
                    Logger.warn(`Failed to restore ${file}: ${error}`);
                }
            }
        } else {
            // Full restore
            restoredCount = snapshotManager.restoreSnapshot(snapshotId);
        }

        console.log('');
        Logger.success(`✅ Restored ${restoredCount} file${restoredCount > 1 ? 's' : ''}`);
        Logger.dim(`From: ${formatRelativeTime(snapshot.metadata.timestamp)}`);
    } catch (error) {
        console.log('');
        Logger.error(`Failed to restore: ${error}`);
        process.exit(1);
    }
}