import { DaemonManager } from '../../core/daemon.js';
import { Logger } from '../../utils/logger.js';

/**
 * Stop command - stop watching daemon
 */
export async function stopCommand(): Promise<void> {
    if (!DaemonManager.isRunning()) {
        Logger.error('undoai is not running');
        Logger.info('Use "undoai watch" to start watching');
        process.exit(1);
    }

    const stopped = DaemonManager.stop();

    if (stopped) {
        Logger.success('undoai stopped');
    } else {
        Logger.error('Failed to stop undoai');
        process.exit(1);
    }
}
