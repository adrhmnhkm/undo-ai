import chokidar from 'chokidar';
import { join } from 'path';

/**
 * Configuration options for the file watcher
 */
export interface WatcherOptions {
    /** Directory to watch for file changes */
    watchPath: string;
    /** Callback triggered when burst threshold is met */
    onBurstChange: (changedFiles: Set<string>) => void;
    /** Minimum number of files that must change to trigger burst (default: 5) */
    burstThreshold?: number;
    /** Debounce delay in milliseconds (default: 2000ms) */
    debounceDelay?: number;
}

/**
 * File watcher that monitors directory changes and triggers callbacks
 * when a burst of changes occurs (≥5 files, no changes for ≥2000ms)
 */
export class FileWatcher {
    private watcher: chokidar.FSWatcher | null = null;
    private changedFiles: Set<string> = new Set();
    private debounceTimer: NodeJS.Timeout | null = null;

    private readonly watchPath: string;
    private readonly onBurstChange: (changedFiles: Set<string>) => void;
    private readonly burstThreshold: number;
    private readonly debounceDelay: number;

    constructor(options: WatcherOptions) {
        this.watchPath = options.watchPath;
        this.onBurstChange = options.onBurstChange;
        this.burstThreshold = options.burstThreshold ?? 5;
        this.debounceDelay = options.debounceDelay ?? 2000;
    }

    /**
     * Start watching the directory for file changes
     */
    public start(): void {
        this.watcher = chokidar.watch(this.watchPath, {
            // Watch configuration
            persistent: true,
            ignoreInitial: true, // Don't trigger events for existing files on startup

            // Ignored paths - use glob patterns
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/build/**',
                '**/_tmp_*',              // Temp files
                '**/*.tmp',               // Temp extensions
                '**/pnpm-lock.yaml.*',    // pnpm temp lock files
                '**/package.json.*',      // npm/pnpm temp package files
            ],
        });

        // Handle file addition
        this.watcher.on('add', (filePath: string) => {
            this.handleFileChange(filePath, 'add');
        });

        // Handle file modification
        this.watcher.on('change', (filePath: string) => {
            this.handleFileChange(filePath, 'change');
        });

        // Handle file deletion
        this.watcher.on('unlink', (filePath: string) => {
            this.handleFileChange(filePath, 'unlink');
        });

        // Handle file rename - chokidar treats this as unlink (old) + add (new)
        // We handle both events separately, so no special handling needed
        // The rename effectively becomes two separate events in our changedFiles Set

        // Error handling
        this.watcher.on('error', (error: Error) => {
            console.error('Watcher error:', error);
        });
    }

    /**
     * Handle a file change event
     * Debounce Logic:
     * 1. Add the file path to the Set (automatically prevents duplicates)
     * 2. Clear any existing debounce timer
     * 3. Start a new timer
     * 4. If timer expires (no new changes for debounceDelay ms):
     *    - Check if we have ≥ burstThreshold unique files
     *    - If yes, trigger the callback and reset the buffer
     */
    private handleFileChange(filePath: string, eventType: string): void {
        // Debug: log individual file changes
        console.log(`  📝 [${eventType}] ${filePath}`);

        // Add file to the set of changed files (Set automatically prevents duplicates)
        this.changedFiles.add(filePath);

        // Clear the existing debounce timer if any
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Start a new debounce timer
        this.debounceTimer = setTimeout(() => {
            // Timer expired - no new changes for debounceDelay ms

            // ALWAYS trigger callback if there are ANY changes
            // Let the callback (smart detection in watch.ts) decide whether to snapshot
            if (this.changedFiles.size > 0) {
                // Create a copy of the changed files set for the callback
                const filesSnapshot = new Set(this.changedFiles);

                // Clear the buffer before triggering callback
                this.changedFiles.clear();

                // Trigger callback - smart detection will decide if snapshot needed
                this.onBurstChange(filesSnapshot);
            }

            // Clear the timer reference
            this.debounceTimer = null;
        }, this.debounceDelay);
    }

    /**
     * Stop watching and clean up resources
     */
    public async stop(): Promise<void> {
        // Clear any pending debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        // Close the watcher
        if (this.watcher) {
            await this.watcher.close();
            this.watcher = null;
        }

        // Clear the changed files buffer
        this.changedFiles.clear();
    }

    /**
     * Get the current count of changed files in the buffer
     */
    public getChangedFilesCount(): number {
        return this.changedFiles.size;
    }

    /**
     * Manually clear the changed files buffer
     */
    public clearBuffer(): void {
        this.changedFiles.clear();
    }
}
