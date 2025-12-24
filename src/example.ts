import { FileWatcher } from './watcher.js';

/**
 * Example usage of the FileWatcher
 */
function main() {
    // Initialize the watcher
    const watcher = new FileWatcher({
        watchPath: process.cwd(), // Watch current directory
        onBurstChange: (changedFiles) => {
            console.log(`\n🔥 Burst detected! ${changedFiles.size} files changed:`);
            changedFiles.forEach((file) => {
                console.log(`  - ${file}`);
            });
        },
        burstThreshold: 5,    // Trigger when ≥5 files change
        debounceDelay: 2000,  // After 2000ms of no changes
    });

    // Start watching
    console.log('👀 Watching for file changes...');
    console.log('💡 Make changes to ≥5 files, then wait 2 seconds\n');
    watcher.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n\n👋 Stopping watcher...');
        await watcher.stop();
        process.exit(0);
    });
}

main();
