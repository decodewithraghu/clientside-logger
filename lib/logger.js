"use strict"

import Cache from './util/Cache'

/**
 * Available log levels for the logger
 * @constant {Object}
 */
export const LOGLEVELS = {
    DEBUG: "DEBUG",
    LOG: "LOG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
    FATAL: "FATAL"
}

/**
 * Threshold values for each log level
 * @constant {Object}
 * @private
 */
const LOGTHRESHOLD = {
    DEBUG: 0,
    LOG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
}

const cache = new Cache({
    instantiated: false,
    logURL: '',
    logLevels: Object.keys(LOGLEVELS).map(key => LOGLEVELS[key]),
    logThreshold: LOGLEVELS.ERROR,
    routeURL: '',
    showMessageInDevelopment: true,
    showMessageInProduction: false,
    silenceStackTrace: false,
    additionalInformation: '',
    // Performance & Resource Management
    batchSize: 10,
    batchTimeout: 5000,
    maxQueueSize: 1000,
    requestTimeout: 10000,
    useLocalStorage: true,
    // Data Collection & Context
    captureUserAgent: true,
    captureScreenResolution: true,
    userId: null,
    sessionId: null,
    environment: 'production',
    // Advanced Filtering & Control
    ignoredErrors: [],
    ignoredUrls: [],
    sampleRate: 1.0,
    customFilters: [],
    // Security & Privacy
    sanitize: true,
    beforeSend: null,
    afterSend: null,
    // Breadcrumbs
    maxBreadcrumbs: 20,
    captureInteractions: true,
    // State management
    logQueue: [],
    breadcrumbs: [],
    flushTimer: null,
    isOnline: true
})

// ===== UTILITY FUNCTIONS =====

/**
 * Get browser and device information
 * @private
 * @returns {Object} Browser and device details
 */
const getBrowserInfo = () => {
    const ua = navigator.userAgent
    let browserName = 'Unknown'
    let browserVersion = 'Unknown'
    
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Chromium') === -1) {
        browserName = 'Chrome'
        browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || 'Unknown'
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
        browserName = 'Safari'
        browserVersion = ua.split('Version/')[1]?.split(' ')[0] || 'Unknown'
    } else if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox'
        browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || 'Unknown'
    } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
        browserName = 'IE'
        browserVersion = ua.split('MSIE ')[1]?.split(';')[0] || 'Unknown'
    } else if (ua.indexOf('Edge') > -1) {
        browserName = 'Edge'
        browserVersion = ua.split('Edge/')[1]?.split(' ')[0] || 'Unknown'
    }
    
    return {
        browser: `${browserName} ${browserVersion}`,
        userAgent: ua,
        platform: navigator.platform || 'Unknown',
        language: navigator.language || 'Unknown'
    }
}

/**
 * Get screen resolution
 * @private
 * @returns {Object} Screen dimensions
 */
const getScreenResolution = () => {
    return {
        width: window.screen?.width || 'Unknown',
        height: window.screen?.height || 'Unknown',
        colorDepth: window.screen?.colorDepth || 'Unknown'
    }
}

/**
 * Sanitize sensitive data from logs
 * @private
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
const sanitizeData = (text) => {
    if (typeof text !== 'string') return text
    
    // Remove SSN pattern (XXX-XX-XXXX)
    text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX')
    
    // Remove credit card patterns
    text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX-XXXX')
    
    // Remove API keys and tokens (common patterns)
    text = text.replace(/(api[_-]?key|token|password|secret|authorization)[\s:=]+[\w\-\.]+/gi, '$1=***')
    
    // Remove email-like patterns in certain contexts
    text = text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, 'user@example.com')
    
    return text
}

/**
 * Check if error matches ignored patterns
 * @private
 * @param {string} message - Error message
 * @param {string} url - Page URL
 * @returns {boolean} True if should be ignored
 */
const shouldIgnoreError = (message, url) => {
    const ignoredErrors = cache.get('ignoredErrors') || []
    const ignoredUrls = cache.get('ignoredUrls') || []
    
    for (const pattern of ignoredErrors) {
        if (pattern instanceof RegExp && pattern.test(message)) return true
        if (typeof pattern === 'string' && message.includes(pattern)) return true
    }
    
    for (const pattern of ignoredUrls) {
        if (pattern instanceof RegExp && pattern.test(url)) return true
        if (typeof pattern === 'string' && url.includes(pattern)) return true
    }
    
    return false
}

/**
 * Check if log should be sent based on sample rate
 * @private
 * @returns {boolean} True if should send
 */
const shouldSampleLog = () => {
    const sampleRate = cache.get('sampleRate') || 1.0
    return Math.random() < sampleRate
}

/**
 * Add breadcrumb for user interaction tracking
 * @private
 * @param {Object} breadcrumb - Breadcrumb data
 */
const addBreadcrumb = (breadcrumb) => {
    const breadcrumbs = cache.get('breadcrumbs') || []
    const maxBreadcrumbs = cache.get('maxBreadcrumbs') || 20
    
    breadcrumbs.push({
        timestamp: new Date().toISOString(),
        ...breadcrumb
    })
    
    if (breadcrumbs.length > maxBreadcrumbs) {
        breadcrumbs.shift()
    }
    
    cache.set('breadcrumbs', breadcrumbs)
}

/**
 * Store log to localStorage for offline support
 * @private
 * @param {Object} logData - Log data to store
 */
const storeLogLocally = (logData) => {
    try {
        const useLocalStorage = cache.get('useLocalStorage')
        if (!useLocalStorage) return
        
        const stored = JSON.parse(localStorage.getItem('logger_queue') || '[]')
        stored.push(logData)
        
        // Keep only last 500 logs to prevent quota issues
        if (stored.length > 500) {
            stored.shift()
        }
        
        localStorage.setItem('logger_queue', JSON.stringify(stored))
    } catch (err) {
        console.warn('Failed to store log locally:', err)
    }
}

/**
 * Retrieve and clear logs from localStorage
 * @private
 * @returns {Array} Stored logs
 */
const getStoredLogs = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('logger_queue') || '[]')
        localStorage.removeItem('logger_queue')
        return stored
    } catch (err) {
        console.warn('Failed to retrieve stored logs:', err)
        return []
    }
}

/**
 * Send logs using fetch if available, fallback to XHR
 * @private
 * @param {string} url - Endpoint URL
 * @param {Object} data - Data to send
 * @returns {Promise}
 */
const sendLogs = async (url, data) => {
    const timeout = cache.get('requestTimeout') || 10000
    
    try {
        // Try fetch first (modern approach)
        if (typeof fetch !== 'undefined') {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeout)
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(data),
                signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            return response.ok
        }
    } catch (err) {
        console.warn('Fetch failed, using XHR fallback:', err)
    }
    
    // Fallback to XHR
    return new Promise((resolve) => {
        try {
            const request = new XMLHttpRequest()
            request.timeout = timeout
            request.open('POST', url, true)
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
            
            request.onload = () => {
                resolve(request.status === 200)
            }
            request.onerror = () => resolve(false)
            request.ontimeout = () => resolve(false)
            
            request.send(JSON.stringify(data))
        } catch (err) {
            console.warn('XHR failed:', err)
            resolve(false)
        }
    })
}

/**
 * Batch and queue logs
 * @private
 * @param {Object} logData - Log data to queue
 */
const queueLog = (logData) => {
    const queue = cache.get('logQueue') || []
    const batchSize = cache.get('batchSize') || 10
    const logURL = cache.get('logURL')
    
    queue.push(logData)
    cache.set('logQueue', queue)
    
    if (queue.length >= batchSize) {
        flushLogs()
    } else {
        // Set timer for batching
        clearTimeout(cache.get('flushTimer'))
        const batchTimeout = cache.get('batchTimeout') || 5000
        const timer = setTimeout(() => flushLogs(), batchTimeout)
        cache.set('flushTimer', timer)
    }
}

/**
 * Send all queued logs
 * @private
 */
const flushLogs = async () => {
    const queue = cache.get('logQueue') || []
    const logURL = cache.get('logURL')
    
    if (queue.length === 0 || !logURL) return
    
    const logsToSend = [...queue]
    cache.set('logQueue', [])
    clearTimeout(cache.get('flushTimer'))
    
    // Add offline logs if available
    const storedLogs = getStoredLogs()
    logsToSend.unshift(...storedLogs)
    
    try {
        const payload = {
            logs: logsToSend,
            timestamp: new Date().toISOString(),
            breadcrumbs: cache.get('breadcrumbs') || []
        }
        
        const success = await sendLogs(logURL, payload)
        
        if (!success && cache.get('isOnline')) {
            // Re-queue if send failed but we're online (might be temporary)
            queue.unshift(...logsToSend)
            cache.set('logQueue', queue)
        } else if (!success) {
            // Store locally if offline
            logsToSend.forEach(log => storeLogLocally(log))
        }
    } catch (err) {
        console.warn('Error flushing logs:', err)
        logsToSend.forEach(log => storeLogLocally(log))
    }
}

const logger = (payload = null, logLevel = 'FATAL') => {
    const instantiated = cache.get('instantiated')
    const logURL = cache.get('logURL')
    const logThreshold = cache.get('logThreshold')
    const routeURL = cache.get('routeURL')
    const showMessageInDevelopment = cache.get('showMessageInDevelopment')
    const showMessageInProduction = cache.get('showMessageInProduction')
    const silenceStackTrace = cache.get('silenceStackTrace')
    const additionalInformation = cache.get('additionalInformation')
    const sanitize = cache.get('sanitize')
    const beforeSend = cache.get('beforeSend')
    const afterSend = cache.get('afterSend')
    const customFilters = cache.get('customFilters') || []

    const $logLevel = logLevel.toLowerCase()

    if (!instantiated && showMessageInDevelopment) {
        console.warn(`WARNING: Logger function [${logLevel}] was called while logger global error handling was not enabled (e.g. logger.init() was not executed)`)
    }

    const payloadIsArray = Array.isArray(payload)

    if (window && console && document && (typeof payload === 'object' || payloadIsArray)) {
        // Check filters
        const errorMessage = payloadIsArray ? payload[0] : (payload.errorMessage || '')
        
        if (shouldIgnoreError(errorMessage, window.location.pathname)) {
            return
        }
        
        if (!shouldSampleLog()) {
            return
        }
        
        // Apply custom filters
        for (const filter of customFilters) {
            if (typeof filter === 'function' && !filter(payload, logLevel)) {
                return
            }
        }

        const payloadMessage = payloadIsArray ? payload : (payload.errorMessage ? payload.errorMessage : '')
        const loggedMessage = [`[${logLevel}]:`].concat(payloadIsArray ? payloadMessage : [payloadMessage])

        if (showMessageInDevelopment || showMessageInProduction) {
            if (console && console.hasOwnProperty($logLevel)) {
                console[$logLevel](...loggedMessage)
            } else if (console && console.log) {
                console.log(...loggedMessage)
            }
        }

        // Collect context data
        let formattedPayload = {
            url: window.location.pathname,
            logType: logLevel,
            message: (payloadIsArray ? payloadMessage.toString() : payloadMessage) + 
                (additionalInformation && typeof additionalInformation === 'string' ? ' --> ' + additionalInformation : ''),
            detailMessage: payload.stack || '',
            timestamp: new Date().toISOString()
        }

        // Add browser info if enabled
        if (cache.get('captureUserAgent')) {
            formattedPayload.browserInfo = getBrowserInfo()
        }

        // Add screen resolution if enabled
        if (cache.get('captureScreenResolution')) {
            formattedPayload.screenResolution = getScreenResolution()
        }

        // Add user/session context
        if (cache.get('userId')) {
            formattedPayload.userId = cache.get('userId')
        }
        if (cache.get('sessionId')) {
            formattedPayload.sessionId = cache.get('sessionId')
        }
        if (cache.get('environment')) {
            formattedPayload.environment = cache.get('environment')
        }

        // Sanitize if enabled
        if (sanitize) {
            formattedPayload.message = sanitizeData(formattedPayload.message)
            formattedPayload.detailMessage = sanitizeData(formattedPayload.detailMessage)
        }

        // Call beforeSend hook
        if (typeof beforeSend === 'function') {
            try {
                formattedPayload = beforeSend(formattedPayload, logLevel) || formattedPayload
            } catch (err) {
                console.warn('Error in beforeSend hook:', err)
            }
        }

        // Route on error
        const routeOnError = () => {
            if (routeURL && !payloadIsArray && window && window.location.pathname !== routeURL) {
                window.location.href = routeURL
            }
        }

        // Send to remote if threshold met
        if (logURL && LOGTHRESHOLD[logLevel] >= LOGTHRESHOLD[logThreshold]) {
            queueLog(formattedPayload)
        } else {
            // Still store locally even if not sending to remote
            storeLogLocally(formattedPayload)
        }

        // Call afterSend hook
        if (typeof afterSend === 'function') {
            try {
                afterSend(formattedPayload, logLevel)
            } catch (err) {
                console.warn('Error in afterSend hook:', err)
            }
        }

        routeOnError()

    } else {
        if (typeof console !== 'undefined' && console.error) {
            console.error('Logger: Invalid payload or environment')
        }
    }
}


const listener = {
    error: ({ message, lineno, colno, filename, source, error }) => {
        const _filename = filename || source
        if (!message.includes('Script error')) {
            addBreadcrumb({
                type: 'error',
                level: 'error',
                message: message
            })
            logger({
                errorMessage: message,
                rowNumber: lineno,
                columnnumber: colno,
                stack: error && error.stack,
                _filename
            }, 'FATAL')
        }
    },
    unhandledrejection: ({ promise, reason }) => {
        addBreadcrumb({
            type: 'unhandledRejection',
            level: 'error',
            message: String(reason)
        })
        logger({ errorMessage: `Un-handled error occured in promise [${promise}] => ${reason}` }, 'fatal')
    },
    online: () => {
        cache.set('isOnline', true)
        flushLogs() // Flush any queued logs
    },
    offline: () => {
        cache.set('isOnline', false)
    }
}

/**
 * Initialize the logger with configuration options and set up global error handlers
 * @param {Object} config - Configuration object
 * @param {string} [config.logURL] - Remote URL to send logs to
 * @param {string} [config.logThreshold] - Minimum log level to send to remote URL (DEBUG, LOG, INFO, WARN, ERROR, FATAL)
 * @param {string} [config.routeURL] - URL to redirect to on error
 * @param {boolean} [config.showMessageInDevelopment=true] - Show console messages in development
 * @param {boolean} [config.showMessageInProduction=false] - Show console messages in production
 * @param {boolean} [config.silenceStackTrace=false] - Suppress stack traces
 * @param {string} [config.additionalInformation] - Additional information to include in logs
 * @param {number} [config.batchSize=10] - Number of logs to batch before sending
 * @param {number} [config.batchTimeout=5000] - Timeout in ms for batching logs
 * @param {number} [config.maxQueueSize=1000] - Max logs to queue before forced flush
 * @param {number} [config.requestTimeout=10000] - HTTP request timeout in ms
 * @param {boolean} [config.useLocalStorage=true] - Enable offline log storage
 * @param {boolean} [config.captureUserAgent=true] - Capture browser info
 * @param {boolean} [config.captureScreenResolution=true] - Capture screen resolution
 * @param {string} [config.userId] - User ID for tracking
 * @param {string} [config.sessionId] - Session ID for tracking
 * @param {string} [config.environment='production'] - Environment name
 * @param {Array} [config.ignoredErrors=[]] - Patterns to ignore (strings or regex)
 * @param {Array} [config.ignoredUrls=[]] - URL patterns to ignore
 * @param {number} [config.sampleRate=1.0] - Probability to send log (0-1)
 * @param {Array} [config.customFilters=[]] - Custom filter functions
 * @param {boolean} [config.sanitize=true] - Enable PII sanitization
 * @param {Function} [config.beforeSend] - Hook before sending logs
 * @param {Function} [config.afterSend] - Hook after sending logs
 * @param {number} [config.maxBreadcrumbs=20] - Max breadcrumbs to track
 * @param {boolean} [config.captureInteractions=true] - Track user interactions
 * @example
 * init({
 *   logURL: 'https://api.example.com/logs',
 *   logThreshold: 'ERROR',
 *   showMessageInDevelopment: true,
 *   batchSize: 10,
 *   userId: 'user123',
 *   beforeSend: (log) => { log.customField = 'value'; return log; }
 * })
 */
export const init = ({
    logURL, 
    logThreshold, 
    routeURL, 
    showMessageInDevelopment, 
    showMessageInProduction, 
    silenceStackTrace, 
    additionalInformation,
    batchSize,
    batchTimeout,
    maxQueueSize,
    requestTimeout,
    useLocalStorage,
    captureUserAgent,
    captureScreenResolution,
    userId,
    sessionId,
    environment,
    ignoredErrors,
    ignoredUrls,
    sampleRate,
    customFilters,
    sanitize,
    beforeSend,
    afterSend,
    maxBreadcrumbs,
    captureInteractions
} = {}) => {
    // Register event listeners
    for (const key in listener) {
        window.addEventListener(key, listener[key])
    }

    // Track user interactions if enabled
    if (captureInteractions !== false) {
        document.addEventListener('click', (e) => {
            addBreadcrumb({
                type: 'interaction',
                action: 'click',
                element: e.target.tagName,
                className: e.target.className
            })
        })
        window.addEventListener('popstate', () => {
            addBreadcrumb({
                type: 'navigation',
                action: 'navigation',
                url: window.location.href
            })
        })
    }

    // Handle online/offline status
    cache.set('isOnline', navigator.onLine)

    cache.set('instantiated', true)
    if (typeof logURL === 'string') { cache.set('logURL', logURL) }
    if (typeof logThreshold === 'string') { cache.set('logThreshold', logThreshold) }
    if (typeof routeURL === 'string') { cache.set('routeURL', routeURL) }
    if (typeof silenceStackTrace === 'boolean') { cache.set('silenceStackTrace', silenceStackTrace) }
    if (typeof showMessageInDevelopment === 'boolean') { cache.set('showMessageInDevelopment', showMessageInDevelopment) }
    if (typeof showMessageInProduction === 'boolean') { cache.set('showMessageInProduction', showMessageInProduction) }
    if (additionalInformation) { cache.set('additionalInformation', additionalInformation) }
    if (typeof batchSize === 'number') { cache.set('batchSize', batchSize) }
    if (typeof batchTimeout === 'number') { cache.set('batchTimeout', batchTimeout) }
    if (typeof maxQueueSize === 'number') { cache.set('maxQueueSize', maxQueueSize) }
    if (typeof requestTimeout === 'number') { cache.set('requestTimeout', requestTimeout) }
    if (typeof useLocalStorage === 'boolean') { cache.set('useLocalStorage', useLocalStorage) }
    if (typeof captureUserAgent === 'boolean') { cache.set('captureUserAgent', captureUserAgent) }
    if (typeof captureScreenResolution === 'boolean') { cache.set('captureScreenResolution', captureScreenResolution) }
    if (userId) { cache.set('userId', userId) }
    if (sessionId) { cache.set('sessionId', sessionId) }
    if (environment) { cache.set('environment', environment) }
    if (Array.isArray(ignoredErrors)) { cache.set('ignoredErrors', ignoredErrors) }
    if (Array.isArray(ignoredUrls)) { cache.set('ignoredUrls', ignoredUrls) }
    if (typeof sampleRate === 'number') { cache.set('sampleRate', sampleRate) }
    if (Array.isArray(customFilters)) { cache.set('customFilters', customFilters) }
    if (typeof sanitize === 'boolean') { cache.set('sanitize', sanitize) }
    if (typeof beforeSend === 'function') { cache.set('beforeSend', beforeSend) }
    if (typeof afterSend === 'function') { cache.set('afterSend', afterSend) }
    if (typeof maxBreadcrumbs === 'number') { cache.set('maxBreadcrumbs', maxBreadcrumbs) }
}

/**
 * Catch and log an error object
 * @param {Object} errorObj - Error object with message and stack
 * @param {string} errorObj.message - Error message
 * @param {string} errorObj.stack - Error stack trace
 * @example
 * catcher(new Error('Something went wrong'))
 */
export const catcher = ({ message, stack }) => {
    logger({ errorMessage: message, stack }, 'ERROR');
}

/**
 * Execute a function with automatic error catching and logging
 * @param {Function} [tryCallback] - Function to execute in try block
 * @param {Function} [catchCallback] - Function to execute in catch block, receives error as parameter
 * @example
 * tryCatch(
 *   () => { riskyOperation() },
 *   (error) => { console.log('Handled:', error) }
 * )
 */
export const tryCatch = (tryCallback = () => { }, catchCallback = () => { }) => {
    try {
        if (tryCallback && typeof tryCallback === 'function') {
            tryCallback()
        }
    } catch (error) {
        catcher(error)
        if (catchCallback && typeof catchCallback === 'function') {
            catchCallback(error)
        }
    }
}

/**
 * Log a debug message
 * @param {Array|Object} messages - Message(s) to log
 * @example
 * debug(['Debug info', { data: 'value' }])
 */
export const debug = (messages) => logger(messages, 'DEBUG')

/**
 * Log a general message
 * @param {Array|Object} messages - Message(s) to log
 * @example
 * log(['General information'])
 */
export const log = (messages) => logger(messages, 'LOG')

/**
 * Log an info message
 * @param {Array|Object} messages - Message(s) to log
 * @example
 * info(['User logged in'])
 */
export const info = (messages) => logger(messages, 'INFO')

/**
 * Log a warning message
 * @param {Array|Object} messages - Message(s) to log
 * @example
 * warn(['Deprecated API used'])
 */
export const warn = (messages) => logger(messages, 'WARN')

/**
 * Log an error message
 * @param {Array|Object} messages - Message(s) to log
 * @example
 * error({ errorMessage: 'Failed to load', stack: error.stack })
 */
export const error = (messages) => logger(messages, 'ERROR')

/**
 * Log a fatal error message
 * @param {Array|Object} messages - Message(s) to log
 * @example
 * fatal({ errorMessage: 'Critical failure', stack: error.stack })
 */
export const fatal = (messages) => logger(messages, 'FATAL')

export default {
    init,
    catcher,
    tryCatch,
    LOGLEVELS,
    debug,
    log,
    info,
    warn,
    error,
    fatal,
    // Expose utility functions for advanced usage
    addBreadcrumb,
    flushLogs,
    getBrowserInfo,
    getScreenResolution
}