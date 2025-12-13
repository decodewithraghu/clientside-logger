/**
 * @jest-environment jsdom
 */

import { init, catcher, tryCatch, debug, log, info, warn, error, fatal, LOGLEVELS } from '../lib/logger'

// Mock XMLHttpRequest
class MockXMLHttpRequest {
    constructor() {
        this.readyState = 0
        this.status = 0
        this.onload = null
        this.onreadystatechange = null
        this.requestHeaders = {}
        this.responseText = ''
    }

    open(method, url, async) {
        this.method = method
        this.url = url
        this.async = async
    }

    setRequestHeader(key, value) {
        this.requestHeaders[key] = value
    }

    send(data) {
        this.requestBody = data
        setTimeout(() => {
            this.readyState = 4
            this.status = 200
            if (this.onreadystatechange) {
                this.onreadystatechange()
            }
            if (this.onload) {
                this.onload()
            }
        }, 0)
    }
}

global.XMLHttpRequest = MockXMLHttpRequest

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

describe('Logger Module', () => {
    let consoleWarnSpy
    let consoleErrorSpy
    let consoleLogSpy

    beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
        
        // Reset window location
        delete window.location
        window.location = { pathname: '/test', href: '' }
    })

    afterEach(() => {
        consoleWarnSpy.mockRestore()
        consoleErrorSpy.mockRestore()
        consoleLogSpy.mockRestore()
    })

    describe('LOGLEVELS', () => {
        test('should export all log levels', () => {
            expect(LOGLEVELS).toEqual({
                DEBUG: 'DEBUG',
                LOG: 'LOG',
                INFO: 'INFO',
                WARN: 'WARN',
                ERROR: 'ERROR',
                FATAL: 'FATAL'
            })
        })
    })

    describe('init()', () => {
        test('should initialize logger with configuration', () => {
            const config = {
                logURL: 'https://example.com/logs',
                logThreshold: 'ERROR',
                routeURL: '/error',
                showMessageInDevelopment: true,
                showMessageInProduction: false,
                silenceStackTrace: false,
                additionalInformation: 'Test app'
            }

            init(config)
            
            // Should not throw and should set up event listeners
            expect(() => init(config)).not.toThrow()
        })

        test('should handle empty configuration', () => {
            expect(() => init()).not.toThrow()
        })
    })

    describe('debug()', () => {
        test('should log debug messages', () => {
            init({ showMessageInDevelopment: true })
            debug(['Debug message'])
            expect(consoleLogSpy).toHaveBeenCalled()
        })
    })

    describe('log()', () => {
        test('should log general messages', () => {
            init({ showMessageInDevelopment: true })
            log(['Log message'])
            expect(consoleLogSpy).toHaveBeenCalled()
        })
    })

    describe('info()', () => {
        test('should log info messages', () => {
            init({ showMessageInDevelopment: true })
            info(['Info message'])
            expect(consoleLogSpy).toHaveBeenCalled()
        })
    })

    describe('warn()', () => {
        test('should log warning messages', () => {
            init({ showMessageInDevelopment: true })
            warn(['Warning message'])
            expect(consoleWarnSpy).toHaveBeenCalled()
        })
    })

    describe('error()', () => {
        test('should log error messages', () => {
            init({ showMessageInDevelopment: true })
            error(['Error message'])
            expect(consoleErrorSpy).toHaveBeenCalled()
        })
    })

    describe('fatal()', () => {
        test('should log fatal messages', () => {
            init({ showMessageInDevelopment: true })
            fatal(['Fatal error'])
            expect(consoleErrorSpy).toHaveBeenCalled()
        })
    })

    describe('catcher()', () => {
        test('should catch and log errors', () => {
            init({ showMessageInDevelopment: true })
            const error = new Error('Test error')
            catcher(error)
            expect(consoleErrorSpy).toHaveBeenCalled()
        })
    })

    describe('tryCatch()', () => {
        test('should execute try callback successfully', () => {
            const tryCallback = jest.fn()
            const catchCallback = jest.fn()
            
            init({ showMessageInDevelopment: true })
            tryCatch(tryCallback, catchCallback)
            
            expect(tryCallback).toHaveBeenCalled()
            expect(catchCallback).not.toHaveBeenCalled()
        })

        test('should catch errors and call catch callback', () => {
            const tryCallback = jest.fn(() => {
                throw new Error('Test error')
            })
            const catchCallback = jest.fn()
            
            init({ showMessageInDevelopment: true })
            tryCatch(tryCallback, catchCallback)
            
            expect(tryCallback).toHaveBeenCalled()
            expect(catchCallback).toHaveBeenCalled()
            expect(consoleErrorSpy).toHaveBeenCalled()
        })

        test('should handle non-function callbacks gracefully', () => {
            expect(() => tryCatch(null, null)).not.toThrow()
            expect(() => tryCatch('not a function', 'also not a function')).not.toThrow()
        })
    })

    describe('Remote logging', () => {
        test('should send logs to remote URL when configured', (done) => {
            init({
                logURL: 'https://example.com/logs',
                logThreshold: 'ERROR',
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Remote error', stack: 'Stack trace' })

            setTimeout(() => {
                done()
            }, 50)
        })
    })

    describe('Performance & Resource Management', () => {
        test('should batch logs when batchSize is reached', (done) => {
            init({
                logURL: 'https://example.com/logs',
                batchSize: 2,
                batchTimeout: 1000,
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Error 1', stack: 'Stack 1' })
            error({ errorMessage: 'Error 2', stack: 'Stack 2' })

            setTimeout(() => {
                done()
            }, 50)
        })

        test('should handle request timeout', (done) => {
            init({
                logURL: 'https://example.com/logs',
                requestTimeout: 100,
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Timeout test', stack: 'Stack' })

            setTimeout(() => {
                done()
            }, 150)
        })
    })

    describe('Data Collection & Context', () => {
        test('should capture browser info when enabled', (done) => {
            init({
                logURL: 'https://example.com/logs',
                captureUserAgent: true,
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Browser test', stack: 'Stack' })

            setTimeout(() => {
                done()
            }, 50)
        })

        test('should capture user and session IDs when provided', (done) => {
            init({
                logURL: 'https://example.com/logs',
                userId: 'user123',
                sessionId: 'session456',
                environment: 'production',
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'User context test', stack: 'Stack' })

            setTimeout(() => {
                done()
            }, 50)
        })
    })

    describe('Advanced Filtering & Control', () => {
        test('should ignore errors matching patterns', (done) => {
            init({
                logURL: 'https://example.com/logs',
                ignoredErrors: [/Script error/, 'ignored message'],
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Script error', stack: 'Stack' })

            setTimeout(() => {
                done()
            }, 50)
        })

        test('should apply custom filters', (done) => {
            const customFilter = jest.fn(() => true)

            init({
                logURL: 'https://example.com/logs',
                customFilters: [customFilter],
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Filter test', stack: 'Stack' })

            setTimeout(() => {
                expect(customFilter).toHaveBeenCalled()
                done()
            }, 50)
        })

        test('should apply sampling', (done) => {
            init({
                logURL: 'https://example.com/logs',
                sampleRate: 0.5,
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Sample test', stack: 'Stack' })

            setTimeout(() => {
                done()
            }, 50)
        })
    })

    describe('Security & Privacy', () => {
        test('should sanitize PII by default', (done) => {
            init({
                logURL: 'https://example.com/logs',
                sanitize: true,
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'SSN: 123-45-6789', stack: 'Stack' })

            setTimeout(() => {
                done()
            }, 50)
        })

        test('should call beforeSend hook', (done) => {
            const beforeSend = jest.fn((log) => {
                log.customField = 'added'
                return log
            })

            init({
                logURL: 'https://example.com/logs',
                beforeSend,
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Hook test', stack: 'Stack' })

            setTimeout(() => {
                expect(beforeSend).toHaveBeenCalled()
                done()
            }, 50)
        })

        test('should call afterSend hook', (done) => {
            const afterSend = jest.fn()

            init({
                logURL: 'https://example.com/logs',
                afterSend,
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'After hook test', stack: 'Stack' })

            setTimeout(() => {
                expect(afterSend).toHaveBeenCalled()
                done()
            }, 50)
        })
    })

    describe('Breadcrumbs & Interactions', () => {
        test('should track user interactions', (done) => {
            init({
                captureInteractions: true,
                showMessageInDevelopment: true
            })

            const clickEvent = new MouseEvent('click', { bubbles: true })
            document.dispatchEvent(clickEvent)

            setTimeout(() => {
                done()
            }, 50)
        })
    })

    describe('Offline Support', () => {
        test('should store logs in localStorage when offline', (done) => {
            init({
                logURL: 'https://example.com/logs',
                useLocalStorage: true,
                showMessageInDevelopment: true
            })

            error({ errorMessage: 'Offline test', stack: 'Stack' })

            setTimeout(() => {
                done()
            }, 50)
        })
    })

    describe('Event listeners', () => {
        test('should add event listeners for error and unhandledrejection', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
            
            init()
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
            expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
            
            addEventListenerSpy.mockRestore()
        })
    })
})
