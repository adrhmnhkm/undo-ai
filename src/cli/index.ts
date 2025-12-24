#!/usr/bin/env node

import { Command } from 'commander';
import { watchCommand } from './commands/watch.js';
import { restoreCommand } from './commands/restore.js';
import { stopCommand } from './commands/stop.js';
import { statusCommand } from './commands/status.js';

const program = new Command();

program
    .name('undoai')
    .description('Free, local undo button for AI coding')
    .version('1.0.0');

// Watch command
program
    .command('watch')
    .description('Start watching for file changes')
    .action(async () => {
        await watchCommand();
    });

// Restore command
program
    .command('restore')
    .description('Restore files from a snapshot')
    .option('-i, --interactive', 'Select specific files to restore')
    .option('-f, --files <patterns>', 'Restore specific files (comma-separated patterns)')
    .option('-p, --pattern <glob>', 'Restore files matching glob pattern')
    .action(async (options) => {
        await restoreCommand(options);
    });

// Stop command
program
    .command('stop')
    .description('Stop watching daemon')
    .action(async () => {
        await stopCommand();
    });

// Status command
program
    .command('status')
    .description('Show undoai status')
    .action(async () => {
        await statusCommand();
    });

// Parse arguments
program.parse();
