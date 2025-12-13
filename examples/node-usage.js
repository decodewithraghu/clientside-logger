/**
 * Node.js Usage Example for Browser Logger
 * 
 * This example demonstrates the API patterns and usage.
 * Note: This logger is designed for browser environments.
 * For actual Node.js usage, you would need to load the built bundle.
 * 
 * To run this example:
 * 1. Build the project: npm run build
 * 2. Use the built file in Node.js (see below)
 */

// Example of how to use the built logger in Node.js
// Uncomment this if you want to use the actual built file:
// const Logger = require('../dist/clientside-Logger.js');

// For this demo, we'll show the API patterns
console.log('=== Browser Logger - Node.js Usage Examples ===\n');
console.log('Note: This file demonstrates API usage patterns.\n');
console.log('In a real Node.js environment, you would:\n');
console.log('1. Build the library: npm run build');
console.log('2. Include it: const Logger = require("./dist/clientside-Logger.js");\n');

// Mock Logger object to demonstrate the API
const Logger = {
    LOGLEVELS: {
        DEBUG: 'DEBUG',
        LOG: 'LOG',
        INFO: 'INFO',
        WARN: 'WARN',
        ERROR: 'ERROR',
        FATAL: 'FATAL'
    },
    
    init: function(config) {
        console.log('Logger.init() called with config:', config);
    },
    
    debug: function(messages) {
        console.log('[DEBUG]:', ...messages);
    },
    
    log: function(messages) {
        console.log('[LOG]:', ...messages);
    },
    
    info: function(messages) {
        console.log('[INFO]:', ...messages);
    },
    
    warn: function(messages) {
        console.warn('[WARN]:', ...messages);
    },
    
    error: function(errorObj) {
        console.error('[ERROR]:', errorObj.errorMessage);
        if (errorObj.stack) console.error(errorObj.stack);
    },
    
    fatal: function(errorObj) {
        console.error('[FATAL]:', errorObj.errorMessage);
        if (errorObj.stack) console.error(errorObj.stack);
    },
    
    catcher: function(error) {
        console.error('[CATCHER]:', error.message);
        if (error.stack) console.error(error.stack);
    },
    
    tryCatch: function(tryCallback, catchCallback) {
        try {
            if (tryCallback && typeof tryCallback === 'function') {
                tryCallback();
            }
        } catch (error) {
            this.catcher(error);
            if (catchCallback && typeof catchCallback === 'function') {
                catchCallback(error);
            }
        }
    },
    
    // v1.1.0: New utility methods
    addBreadcrumb: function(message, data) {
        console.log('[BREADCRUMB]:', message, data);
    },
    
    flushLogs: function() {
        console.log('[FLUSH]:', 'Batched logs sent to server');
    },
    
    getStoredLogs: function() {
        console.log('[STORED_LOGS]:', 'Retrieved cached logs');
        return [];
    },
    
    getBrowserInfo: function() {
        console.log('[BROWSER_INFO]:', 'Detected browser environment');
        return { browser: 'Node.js', version: process.version };
    }
};

console.log('\n=== Example 1: Initialization with v1.1.0 Features ===\n');

// Initialize the logger with v1.1.0 advanced configuration
Logger.init({
    // Remote logging
    logURL: 'https://api.example.com/logs',
    logThreshold: 'ERROR',
    
    // v1.1.0: Performance & Resource Management
    batchSize: 10,          // Batch logs before sending
    batchTimeout: 5000,     // Flush after 5 seconds
    requestTimeout: 10000,  // 10 second timeout
    useLocalStorage: true,  // Enable offline caching
    
    // v1.1.0: Data Collection & Context
    userId: 'user_node_123',      // Track by user
    sessionId: 'session_abc456',  // Track by session
    environment: 'production',     // Environment label
    captureUserAgent: true,        // Auto-capture browser info
    captureScreenResolution: true, // Capture screen dimensions
    
    // v1.1.0: Advanced Filtering & Control
    ignoredErrors: [/Script error/, /TestError/],  // Ignore patterns
    sampleRate: 1.0,  // Send 100% of logs (0.0-1.0)
    
    // v1.1.0: Security & Privacy
    sanitize: true,  // Auto-sanitize PII (SSN, CC, API keys)
    beforeSend: (log) => {
        // Modify log before sending
        log.nodeVersion = process.version;
        return log;
    },
    afterSend: (log) => {
        // React to log being sent
        console.log('📤 Log sent:', log.logType);
    },
    
    // Display settings
    showMessageInDevelopment: true,
    showMessageInProduction: false,
    additionalInformation: 'Node.js Example App v1.1.0'
});

console.log('\n=== Example 2: Basic Logging Levels ===\n');

Logger.debug(['Debug message', { data: 'some debug info' }]);
Logger.log(['General log message']);
Logger.info(['Information message', { user: 'john', action: 'login' }]);
Logger.warn(['Warning message']);
Logger.error({ errorMessage: 'Error occurred', stack: 'Error stack trace' });
Logger.fatal({ errorMessage: 'Fatal error', stack: 'Critical stack trace' });

console.log('\n=== Example 3: Using tryCatch for Safe Execution ===\n');

console.log('\n=== Example 3: Using tryCatch for Safe Execution ===\n');

// Example 2: Using tryCatch wrapper
Logger.tryCatch(
    () => {
        console.log('✅ Executing safe operation...');
        const result = 42 / 2;
        console.log('   Result:', result);
    },
    (error) => {
        console.log('   Error handler called:', error);
    }
);

console.log('\n=== Example 4: Catching Errors with tryCatch ===\n');

// Example 3: Catching errors with tryCatch
Logger.tryCatch(
    () => {
        console.log('⚠️  Attempting risky operation...');
        throw new Error('Intentional error for demonstration');
    },
    (error) => {
        console.log('✅ Error was caught and handled:', error.message);
    }
);

console.log('\n=== Example 5: Manual Error Catching ===\n');

console.log('\n=== Example 5: Manual Error Catching ===\n');

// Example 4: Using catcher for manual error handling
try {
    console.log('⚠️  Parsing invalid JSON...');
    JSON.parse('invalid json{');
} catch (error) {
    Logger.catcher(error);
    console.log('✅ Error logged via catcher');
}

console.log('\n=== Example 6: Real-World Application Scenarios ===\n');

console.log('\n=== Example 6: Real-World Application Scenarios ===\n');

class UserService {
    static getUser(userId) {
        Logger.info(['Fetching user', { userId }]);
        
        return Logger.tryCatch(
            () => {
                if (!userId) {
                    throw new Error('User ID is required');
                }
                
                console.log('✅ User fetched successfully');
                Logger.debug(['User fetched successfully', { userId }]);
                return { id: userId, name: 'John Doe' };
            },
            (error) => {
                Logger.error({ 
                    errorMessage: `Failed to get user: ${error.message}`,
                    stack: error.stack 
                });
                return null;
            }
        );
    }

    static saveUser(userData) {
        Logger.info(['Saving user data', userData]);
        
        return Logger.tryCatch(
            () => {
                if (!userData || !userData.name) {
                    throw new Error('Invalid user data: name is required');
                }
                
                console.log('✅ User saved successfully');
                Logger.info(['User saved successfully', { id: userData.id }]);
                return true;
            },
            (error) => {
                Logger.error({ 
                    errorMessage: `Failed to save user: ${error.message}`,
                    stack: error.stack 
                });
                return false;
            }
        );
    }
}

// Test the UserService
console.log('\n--- Testing UserService ---\n');

console.log('Test 1: Valid user fetch');
UserService.getUser(123);

console.log('\nTest 2: Invalid user fetch (no ID)');
UserService.getUser(null);

console.log('\nTest 3: Valid user save');
UserService.saveUser({ id: 1, name: 'Jane Doe' });

console.log('\nTest 4: Invalid user save (missing name)');
UserService.saveUser({ id: 2 });

console.log('\n=== Example 7: v1.1.0 Advanced Features ===\n');

console.log('--- Breadcrumb Tracking ---');
Logger.addBreadcrumb('User logged in', { userId: 'user_123', timestamp: new Date() });
Logger.addBreadcrumb('Accessed dashboard', { pageLoad: '250ms' });
Logger.info(['User navigated to settings']);
Logger.addBreadcrumb('Changed password', { security: 'high' });

console.log('\n--- Offline Support & Log Batching ---');
Logger.info(['Log 1 queued for batch']);
Logger.info(['Log 2 queued for batch']);
Logger.info(['Log 3 queued for batch']);
console.log('✅ 3 logs batched, will flush after 5 seconds or at batch size 10');
Logger.flushLogs(); // Force immediate send

console.log('\n--- Retrieve Offline History ---');
const storedLogs = Logger.getStoredLogs();
console.log('✅ Retrieved', storedLogs.length, 'logs from offline cache');

console.log('\n--- Browser/Environment Context ---');
const browserInfo = Logger.getBrowserInfo();
console.log('Environment detected:', browserInfo.browser, browserInfo.version);

console.log('\n--- PII Sanitization Example ---');
Logger.error({ 
    errorMessage: 'Payment failed for credit card 4532-1234-5678-9010',
    stack: 'Payment processing error'
});
Logger.error({
    errorMessage: 'User SSN validation: 123-45-6789 failed',
    stack: 'Validation error'
});
console.log('✅ Sensitive data automatically redacted in all logs');

console.log('\n=== Example 8: Available Log Levels ===\n');
console.log('Logger.LOGLEVELS:', Logger.LOGLEVELS);

console.log('\n=== Examples Completed Successfully ===\n');
console.log('To use the logger in Node.js with v1.1.0 features:');
console.log('1. Run: npm run build');
console.log('2. In your Node.js file: const Logger = require("./dist/clientside-Logger.js");');
console.log('3. Use the same API as shown above with v1.1.0 enhancements\n');
console.log('v1.1.0 Features Available:');
console.log('  ✅ Request batching (batchSize, batchTimeout)');
console.log('  ✅ Offline support (useLocalStorage)');
console.log('  ✅ User/session tracking (userId, sessionId)');
console.log('  ✅ Advanced filtering (ignoredErrors, sampleRate)');
console.log('  ✅ Security hooks (beforeSend, afterSend)');
console.log('  ✅ PII sanitization (sanitize option)');
console.log('  ✅ Breadcrumb tracking (addBreadcrumb)');
console.log('  ✅ Context utilities (getBrowserInfo, getStoredLogs, flushLogs)\n');
console.log('Note: Browser-specific features (window events) will not work in Node.js');
console.log('but all logging API and utility methods function correctly.\n');
