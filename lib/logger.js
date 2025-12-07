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
    additionalInformation: ''
})

const logger = (payload = null, logLevel = 'FATAL') => {
    const instantiated = cache.get('instantiated')
    const logURL = cache.get('logURL')
    const logThreshold = cache.get('logThreshold')
    const routeURL = cache.get('routeURL')
    const showMessageInDevelopment = cache.get('showMessageInDevelopment')
    const showMessageInProduction = cache.get('showMessageInProduction')
    const silenceStackTrace = cache.get('silenceStackTrace')
    const additionalInformation = cache.get('additionalInformation')

    const $logLevel = logLevel.toLowerCase()

    if (!instantiated && showMessageInDevelopment) {
        console.warn(`WARNING: Logger function [${logLevel}] was called while logger global error handling was not enabled (e.g. logger.init() was not executed)`);
    }

    const payloadIsArray = Array.isArray(payload);

    if (window && console && document && (typeof payload === 'object' || payloadIsArray)) {
        const payloadMessage = payloadIsArray ? payload : (payload.errorMessage ? payload.errorMessage : '');

        const loggedMessage = [`[${logLevel}]:`].concat(payloadIsArray ? payloadMessage : [payloadMessage]);

        if (showMessageInDevelopment || showMessageInProduction) {
            if (console && console.hasOwnProperty($logLevel)) {
                console[$logLevel](...loggedMessage)
            } else if (console && console.log) {
                console.log(...loggedMessage)
            }
        }

        // re-direction ..... 
        const routeOnError = () => {
            if (routeURL && !payloadIsArray && window && window.location.pathname !== routeURL) {
                window.location.href = routeURL
            }
        }

        if (logURL && LOGTHRESHOLD[logLevel] >= LOGTHRESHOLD[logThreshold]) {
            const formattedPayload = Object.assign({
                url: window.location.pathname,
                logType: logLevel,
                message: (payloadIsArray ? payloadMessage.toString() : payloadMessage)
                    + '.     '
                    + ((additionalInformation && typeof additionalInformation === 'string') ? ' --> '
                        + additionalInformation : ''),
                detailMessage: payload.stack || ''
            })

            try {
                const request = new XMLHttpRequest()
                request.open('POST', logURL, true)
                request.setRequestHeader('content-Type', 'application/json; charset=UTF-8')
                request.onload = routeOnError
                request.onreadystatechange = () => {
                    if (request.readyState === XMLHttpRequest.DONE && request.status !== 200) {
                        routeOnError();
                    }
                }
                request.send(JSON.stringify(formattedPayload));
            } catch (err) {
                console && console.log('unable to send log information ', err)
                routeOnError()
            }
        }
    } else {
        if (typeof console !== 'undefined' && console.error) {
            console.error('Logger: Invalid payload or environment');
        }
    }

}


const listener = {
    error: ({ message, lineno, colno, filename, source, error }) => {
        const _filename = filename || source;
        if (!message.includes('Script error')) {
            logger({
                errorMessage: message,
                rowNumber: lineno,
                columnnumber: colno,
                stack: error && error.stack,
                _filename
            }, 'FATAL');
        }
    },
    unhandledrejection: ({ promise, reason }) => {
        logger({ errorMessage: `Un-handled error occured in promise [${promise}] => ${reason}` }, 'fatal');
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
 * @example
 * init({
 *   logURL: 'https://api.example.com/logs',
 *   logThreshold: 'ERROR',
 *   showMessageInDevelopment: true
 * })
 */
export const init = ({
    logURL, logThreshold, routeURL, showMessageInDevelopment, showMessageInProduction, silenceStackTrace, additionalInformation } = {}) => {
    for (const key in listener) {
        window.addEventListener(key, listener[key]);
    }

    cache.set('instantiated', true);
    if (typeof logURL === 'string') { cache.set('logURL', logURL); }
    if (typeof logThreshold === 'string') { cache.set('logThreshold', logThreshold); }
    if (typeof routeURL === 'string') { cache.set('routeURL', routeURL); }
    if (typeof silenceStackTrace === 'boolean') { cache.set('silenceStackTrace', silenceStackTrace); }
    if (typeof showMessageInDevelopment === 'boolean') { cache.set('showMessageInDevelopment', showMessageInDevelopment); }
    if (typeof showMessageInProduction === 'boolean') { cache.set('showMessageInProduction', showMessageInProduction); }
    if (additionalInformation) { cache.set('additionalInformation', additionalInformation); }
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
    fatal
}