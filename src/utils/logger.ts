import chalk from 'chalk';

/**
 * Logger utility with colored output
 */
export class Logger {
    /**
     * Success message (green with checkmark)
     */
    static success(message: string): void {
        console.log(chalk.green('✅ ' + message));
    }

    /**
     * Error message (red with cross)
     */
    static error(message: string): void {
        console.log(chalk.red('❌ ' + message));
    }

    /**
     * Warning message (yellow with warning icon)
     */
    static warn(message: string): void {
        console.log(chalk.yellow('⚠️  ' + message));
    }

    /**
     * Info message (blue with info icon)
     */
    static info(message: string): void {
        console.log(chalk.blue('ℹ️  ' + message));
    }

    /**
     * Snapshot message (camera icon)
     */
    static snapshot(message: string): void {
        console.log(chalk.cyan('📸 ' + message));
    }

    /**
     * Watch message (eyes icon)
     */
    static watch(message: string): void {
        console.log(chalk.magenta('👀 ' + message));
    }

    /**
     * Plain message (no icon or color)
     */
    static plain(message: string): void {
        console.log(message);
    }

    /**
     * Dim/subtle message
     */
    static dim(message: string): void {
        console.log(chalk.dim(message));
    }

    /**
     * Bold message
     */
    static bold(message: string): void {
        console.log(chalk.bold(message));
    }
}
