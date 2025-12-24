import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import zlib from 'zlib';

/**
 * Storage paths configuration
 */
export const STORAGE_PATHS = {
    root: path.join(homedir(), '.undoai'),
    snapshots: path.join(homedir(), '.undoai', 'snapshots'),
    daemonPid: path.join(homedir(), '.undoai', 'daemon.pid'),
    config: path.join(homedir(), '.undoai', 'config.json'),
} as const;

/**
 * Metadata for a snapshot
 */
export interface SnapshotMetadata {
    timestamp: number;
    date: string;
    projectRoot: string;
    changedFiles: string[];
    fileCount: number;
    label: 'AI_BURST' | 'AUTO';
}

/**
 * Storage manager for undoai snapshots
 */
export class Storage {
    /**
     * Initialize storage directory structure
     */
    static init(): void {
        // Create root directory
        if (!fs.existsSync(STORAGE_PATHS.root)) {
            fs.mkdirSync(STORAGE_PATHS.root, { recursive: true });
        }

        // Create snapshots directory
        if (!fs.existsSync(STORAGE_PATHS.snapshots)) {
            fs.mkdirSync(STORAGE_PATHS.snapshots, { recursive: true });
        }
    }

    /**
     * Check if storage is initialized
     */
    static isInitialized(): boolean {
        return fs.existsSync(STORAGE_PATHS.root) && fs.existsSync(STORAGE_PATHS.snapshots);
    }

    /**
     * Check if a file exists
     */
    static fileExists(filePath: string): boolean {
        try {
            return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        } catch {
            return false;
        }
    }


    /**
     * Get all snapshot IDs (sorted by timestamp, newest first)
     */
    static getSnapshotIds(): string[] {
        if (!fs.existsSync(STORAGE_PATHS.snapshots)) {
            return [];
        }

        const entries = fs.readdirSync(STORAGE_PATHS.snapshots, { withFileTypes: true });
        const snapshotIds = entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort((a, b) => parseInt(b) - parseInt(a)); // Newest first

        return snapshotIds;
    }

    /**
     * Get snapshot metadata
     */
    static getSnapshotMetadata(snapshotId: string): SnapshotMetadata | null {
        const metadataPath = path.join(STORAGE_PATHS.snapshots, snapshotId, 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
            return null;
        }

        try {
            const content = fs.readFileSync(metadataPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Failed to read metadata for snapshot ${snapshotId}:`, error);
            return null;
        }
    }

    /**
     * Get snapshot directory path
     */
    static getSnapshotDir(snapshotId: string): string {
        return path.join(STORAGE_PATHS.snapshots, snapshotId);
    }

    /**
     * Get snapshot files directory path
     */
    static getSnapshotFilesDir(snapshotId: string): string {
        return path.join(STORAGE_PATHS.snapshots, snapshotId, 'files');
    }

    /**
     * Create a new snapshot directory
     */
    static createSnapshotDir(snapshotId: string): string {
        const snapshotDir = this.getSnapshotDir(snapshotId);
        const filesDir = this.getSnapshotFilesDir(snapshotId);

        fs.mkdirSync(snapshotDir, { recursive: true });
        fs.mkdirSync(filesDir, { recursive: true });

        return snapshotDir;
    }

    /**
     * Save snapshot metadata
     */
    static saveMetadata(snapshotId: string, metadata: SnapshotMetadata): void {
        const metadataPath = path.join(STORAGE_PATHS.snapshots, snapshotId, 'metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    }

    /**
     * Convert file path to safe filename (replace / with __)
     * Example: /home/user/project/src/auth.ts -> src__auth.ts
     */
    static pathToSafeFilename(filePath: string, projectRoot: string): string {
        const relativePath = path.relative(projectRoot, filePath);
        return relativePath.replace(/\//g, '__').replace(/\\/g, '__');
    }

    /**
     * Convert safe filename back to relative path
     * Example: src__auth.ts -> src/auth.ts
     */
    static safeFilenameToPath(safeFilename: string): string {
        return safeFilename.replace(/__/g, path.sep);
    }

    /**
     * Copy file to snapshot with compression
     */
    static copyFileToSnapshot(
        sourceFile: string,
        snapshotId: string,
        projectRoot: string
    ): void {
        const safeFilename = this.pathToSafeFilename(sourceFile, projectRoot);
        const destPath = path.join(this.getSnapshotFilesDir(snapshotId), safeFilename + '.gz');

        // Read, compress, and save file
        const fileContent = fs.readFileSync(sourceFile);
        const compressed = zlib.gzipSync(fileContent);
        fs.writeFileSync(destPath, compressed);
    }

    /**
     * Restore file from snapshot with decompression
     */
    static restoreFileFromSnapshot(
        originalPath: string,
        snapshotId: string,
        projectRoot: string
    ): void {
        const safeFilename = this.pathToSafeFilename(originalPath, projectRoot);
        const sourcePath = path.join(this.getSnapshotFilesDir(snapshotId), safeFilename + '.gz');

        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Snapshot file not found: ${safeFilename}.gz`);
        }

        // Ensure target directory exists
        const targetDir = path.dirname(originalPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Decompress and restore file
        const compressed = fs.readFileSync(sourcePath);
        const decompressed = zlib.gunzipSync(compressed);
        fs.writeFileSync(originalPath, decompressed);
    }

    /**
     * Delete a snapshot
     */
    static deleteSnapshot(snapshotId: string): void {
        const snapshotDir = this.getSnapshotDir(snapshotId);

        if (fs.existsSync(snapshotDir)) {
            fs.rmSync(snapshotDir, { recursive: true, force: true });
        }
    }

    /**
     * Get total storage size in bytes
     */
    static getStorageSize(): number {
        if (!fs.existsSync(STORAGE_PATHS.snapshots)) {
            return 0;
        }

        let totalSize = 0;

        const calculateDirSize = (dirPath: string): void => {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    calculateDirSize(fullPath);
                } else {
                    const stats = fs.statSync(fullPath);
                    totalSize += stats.size;
                }
            }
        };

        calculateDirSize(STORAGE_PATHS.snapshots);
        return totalSize;
    }

    /**
     * Format bytes to human readable string
     */
    static formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
