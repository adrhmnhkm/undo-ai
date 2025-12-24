import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { STORAGE_PATHS } from './storage.js';

/**
 * Daemon process manager
 */
export class DaemonManager {
    /**
     * Check if daemon is running
     */
    static isRunning(): boolean {
        if (!fs.existsSync(STORAGE_PATHS.daemonPid)) {
            return false;
        }

        try {
            const pid = parseInt(fs.readFileSync(STORAGE_PATHS.daemonPid, 'utf-8'));

            // Check if process exists
            process.kill(pid, 0);
            return true;
        } catch (error) {
            // Process doesn't exist, clean up stale PID file
            this.cleanupPidFile();
            return false;
        }
    }

    /**
     * Get daemon PID
     */
    static getPid(): number | null {
        if (!fs.existsSync(STORAGE_PATHS.daemonPid)) {
            return null;
        }

        try {
            return parseInt(fs.readFileSync(STORAGE_PATHS.daemonPid, 'utf-8'));
        } catch (error) {
            return null;
        }
    }

    /**
     * Save daemon PID
     */
    static savePid(pid: number): void {
        fs.writeFileSync(STORAGE_PATHS.daemonPid, pid.toString(), 'utf-8');
    }

    /**
     * Clean up PID file
     */
    static cleanupPidFile(): void {
        if (fs.existsSync(STORAGE_PATHS.daemonPid)) {
            fs.unlinkSync(STORAGE_PATHS.daemonPid);
        }
    }

    /**
     * Stop daemon process
     */
    static stop(): boolean {
        const pid = this.getPid();

        if (!pid) {
            return false;
        }

        try {
            process.kill(pid, 'SIGTERM');
            this.cleanupPidFile();
            return true;
        } catch (error) {
            // Process doesn't exist
            this.cleanupPidFile();
            return false;
        }
    }

    /**
     * Start daemon in background (for watch command)
     * Note: This is called from the watch command itself
     */
    static markAsRunning(pid: number): void {
        this.savePid(pid);
    }

    /**
     * Setup graceful shutdown handlers
     */
    static setupShutdownHandlers(onShutdown: () => Promise<void>): void {
        const shutdown = async (signal: string) => {
            console.log(`\n\n👋 Received ${signal}, stopping watcher...`);
            await onShutdown();
            this.cleanupPidFile();
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
}
