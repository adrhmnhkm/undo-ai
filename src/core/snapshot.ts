import { Storage, SnapshotMetadata } from './storage.js';

/**
 * Snapshot manager for creating and restoring snapshots
 */
export class SnapshotManager {
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    /**
     * Create a snapshot from changed files
     */
    createSnapshot(
        changedFiles: Set<string>,
        label: 'AI_BURST' | 'AUTO' = 'AI_BURST'
    ): string {
        // Generate snapshot ID (timestamp)
        const timestamp = Date.now();
        const snapshotId = timestamp.toString();

        // Create snapshot directory
        Storage.createSnapshotDir(snapshotId);

        // Filter files: only snapshot files that still exist
        // (skip deleted files to avoid ENOENT errors)
        const fileArray = Array.from(changedFiles);
        const existingFiles: string[] = [];
        const skippedFiles: string[] = [];

        for (const file of fileArray) {
            if (Storage.fileExists(file)) {
                try {
                    Storage.copyFileToSnapshot(file, snapshotId, this.projectRoot);
                    existingFiles.push(file);
                } catch (error) {
                    console.error(`Failed to copy file ${file}:`, error);
                    skippedFiles.push(file);
                }
            } else {
                // File was deleted before snapshot - skip it
                skippedFiles.push(file);
            }
        }

        // Create metadata with only successfully backed up files
        const metadata: SnapshotMetadata = {
            timestamp,
            date: new Date(timestamp).toISOString(),
            projectRoot: this.projectRoot,
            changedFiles: existingFiles, // Only files that were actually saved
            fileCount: existingFiles.length,
            label,
        };

        // Save metadata
        Storage.saveMetadata(snapshotId, metadata);

        // Log summary if files were skipped
        if (skippedFiles.length > 0) {
            console.log(`⚠️  Skipped ${skippedFiles.length} deleted file(s)`);
        }

        return snapshotId;
    }

    /**
     * Restore files from a snapshot
     */
    restoreSnapshot(snapshotId: string): number {
        // Get metadata
        const metadata = Storage.getSnapshotMetadata(snapshotId);

        if (!metadata) {
            throw new Error(`Snapshot ${snapshotId} not found`);
        }

        // Check if project root matches
        if (metadata.projectRoot !== this.projectRoot) {
            throw new Error(
                `Snapshot was created in different project: ${metadata.projectRoot}`
            );
        }

        // Restore all files
        let restoredCount = 0;
        for (const file of metadata.changedFiles) {
            try {
                Storage.restoreFileFromSnapshot(file, snapshotId, this.projectRoot);
                restoredCount++;
            } catch (error) {
                console.error(`Failed to restore file ${file}:`, error);
            }
        }

        return restoredCount;
    }

    /**
     * List all available snapshots
     */
    listSnapshots(): Array<{ id: string; metadata: SnapshotMetadata }> {
        const snapshotIds = Storage.getSnapshotIds();
        const snapshots = [];

        for (const id of snapshotIds) {
            const metadata = Storage.getSnapshotMetadata(id);
            if (metadata) {
                snapshots.push({ id, metadata });
            }
        }

        return snapshots;
    }

    /**
     * Get snapshot details
     */
    getSnapshot(snapshotId: string): { id: string; metadata: SnapshotMetadata } | null {
        const metadata = Storage.getSnapshotMetadata(snapshotId);

        if (!metadata) {
            return null;
        }

        return { id: snapshotId, metadata };
    }

    /**
     * Delete a snapshot
     */
    deleteSnapshot(snapshotId: string): void {
        Storage.deleteSnapshot(snapshotId);
    }

    /**
     * Get snapshot count
     */
    getSnapshotCount(): number {
        return Storage.getSnapshotIds().length;
    }
}
