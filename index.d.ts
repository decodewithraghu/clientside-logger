/**
 * Browser Logger TypeScript Definitions
 * @version 1.1.0
 */

export interface LogLevels {
    DEBUG: string;
    LOG: string;
    INFO: string;
    WARN: string;
    ERROR: string;
    FATAL: string;
}

export interface BrowserInfo {
    browser: string;
    userAgent: string;
    platform: string;
    language: string;
}

export interface ScreenResolution {
    width: number;
    height: number;
    colorDepth: number;
}

export interface Breadcrumb {
    timestamp: string;
    type: string;
    [key: string]: any;
}

export interface LogPayload {
    [key: string]: any;
    errorMessage?: string;
    stack?: string;
}

export interface FormattedLogPayload extends LogPayload {
    url: string;
    logType: string;
    message: string;
    detailMessage: string;
    timestamp: string;
    browserInfo?: BrowserInfo;
    screenResolution?: ScreenResolution;
    userId?: string;
    sessionId?: string;
    environment?: string;
}

export interface BatchedLogPayload {
    logs: FormattedLogPayload[];
    timestamp: string;
    breadcrumbs: Breadcrumb[];
}

export type CustomFilter = (payload: LogPayload, logLevel: string) => boolean;
export type BeforeSendHook = (log: FormattedLogPayload, level: string) => FormattedLogPayload | void;
export type AfterSendHook = (log: FormattedLogPayload, level: string) => void;

export interface LoggerConfig {
    /**
     * Remote URL to send logs to
     */
    logURL?: string;

    /**
     * Minimum log level to send to remote URL
     * @default 'ERROR'
     */
    logThreshold?: 'DEBUG' | 'LOG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

    /**
     * URL to redirect to on fatal errors
     */
    routeURL?: string;

    /**
     * Show console messages in development
     * @default true
     */
    showMessageInDevelopment?: boolean;

    /**
     * Show console messages in production
     * @default false
     */
    showMessageInProduction?: boolean;

    /**
     * Suppress stack traces
     * @default false
     */
    silenceStackTrace?: boolean;

    /**
     * Additional context included in all logs
     */
    additionalInformation?: string;

    /**
     * Number of logs to batch before sending
     * @default 10
     */
    batchSize?: number;

    /**
     * Timeout in milliseconds for batching logs
     * @default 5000
     */
    batchTimeout?: number;

    /**
     * Maximum logs to queue before forced flush
     * @default 1000
     */
    maxQueueSize?: number;

    /**
     * HTTP request timeout in milliseconds
     * @default 10000
     */
    requestTimeout?: number;

    /**
     * Enable offline log storage with localStorage
     * @default true
     */
    useLocalStorage?: boolean;

    /**
     * Capture browser and user agent information
     * @default true
     */
    captureUserAgent?: boolean;

    /**
     * Capture screen resolution
     * @default true
     */
    captureScreenResolution?: boolean;

    /**
     * User ID for tracking and correlation
     */
    userId?: string;

    /**
     * Session ID for tracking
     */
    sessionId?: string;

    /**
     * Environment name (e.g., 'production', 'staging')
     * @default 'production'
     */
    environment?: string;

    /**
     * Patterns to ignore (strings or regex)
     * @default []
     */
    ignoredErrors?: (string | RegExp)[];

    /**
     * URL patterns to ignore
     * @default []
     */
    ignoredUrls?: (string | RegExp)[];

    /**
     * Probability to send log (0-1)
     * @default 1.0
     */
    sampleRate?: number;

    /**
     * Custom filter functions
     * @default []
     */
    customFilters?: CustomFilter[];

    /**
     * Enable automatic PII sanitization
     * @default true
     */
    sanitize?: boolean;

    /**
     * Hook called before sending logs
     */
    beforeSend?: BeforeSendHook;

    /**
     * Hook called after sending logs
     */
    afterSend?: AfterSendHook;

    /**
     * Maximum breadcrumbs to track
     * @default 20
     */
    maxBreadcrumbs?: number;

    /**
     * Track user interactions (clicks, navigation)
     * @default true
     */
    captureInteractions?: boolean;
}

/**
 * Initialize the logger with configuration
 */
export function init(config?: LoggerConfig): void;

/**
 * Log a debug message
 */
export function debug(messages: any[]): void;

/**
 * Log a general message
 */
export function log(messages: any[]): void;

/**
 * Log an info message
 */
export function info(messages: any[]): void;

/**
 * Log a warning message
 */
export function warn(messages: any[]): void;

/**
 * Log an error message
 */
export function error(payload: LogPayload | any[]): void;

/**
 * Log a fatal error message
 */
export function fatal(payload: LogPayload | any[]): void;

/**
 * Catch and log an error object
 */
export function catcher(error: Error | LogPayload): void;

/**
 * Execute a function with automatic error catching
 */
export function tryCatch(
    tryCallback: () => void,
    catchCallback?: (error: Error) => void
): void;

/**
 * Add a breadcrumb for user interaction tracking
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void;

/**
 * Manually flush all queued logs to remote server
 */
export function flushLogs(): Promise<void>;

/**
 * Get browser information
 */
export function getBrowserInfo(): BrowserInfo;

/**
 * Get screen resolution
 */
export function getScreenResolution(): ScreenResolution;

/**
 * Exported log levels constant
 */
export const LOGLEVELS: LogLevels;

/**
 * Default export with all functions
 */
declare const _default: {
    init: typeof init;
    debug: typeof debug;
    log: typeof log;
    info: typeof info;
    warn: typeof warn;
    error: typeof error;
    fatal: typeof fatal;
    catcher: typeof catcher;
    tryCatch: typeof tryCatch;
    addBreadcrumb: typeof addBreadcrumb;
    flushLogs: typeof flushLogs;
    getBrowserInfo: typeof getBrowserInfo;
    getScreenResolution: typeof getScreenResolution;
    LOGLEVELS: LogLevels;
};

export default _default;
