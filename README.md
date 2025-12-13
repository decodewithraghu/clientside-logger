# Browser Logger

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![npm version](https://img.shields.io/badge/npm-1.1.0-green.svg)](https://www.npmjs.com/package/clientside-logger)

A powerful, production-ready JavaScript logging utility for browser environments that captures client-side errors, unhandled promise rejections, and provides structured logging with remote endpoint support.

## 🚀 Features

### Core Features
- ✅ **Multiple Log Levels** - DEBUG, LOG, INFO, WARN, ERROR, FATAL
- ✅ **Automatic Error Catching** - Global error and unhandled promise rejection handlers
- ✅ **Remote Logging** - Send logs to your backend service via HTTP POST
- ✅ **Try-Catch Wrapper** - Utility for safe function execution with automatic error logging
- ✅ **Configurable Thresholds** - Control which logs are sent remotely
- ✅ **Environment Modes** - Different behaviors for development vs production
- ✅ **Fully Documented** - Complete JSDoc documentation for TypeScript support
- ✅ **Zero Dependencies** - Standalone library with no external runtime dependencies
- ✅ **Tested** - Comprehensive test suite with 37 tests, 100% pass rate

### v1.1.0 New Features
- 🆕 **Request Batching** - Efficient batch sending with configurable size and timeout
- 🆕 **Offline Support** - localStorage caching of logs when offline, auto-sync when reconnected
- 🆕 **User & Session Tracking** - Automatic user ID and session ID in all logs
- 🆕 **Browser Detection** - Auto-capture browser type, version, OS, and screen resolution
- 🆕 **Advanced Filtering** - Pattern-based error ignoring and log sampling
- 🆕 **PII Sanitization** - Automatic redaction of SSNs, credit cards, API keys
- 🆕 **Security Hooks** - beforeSend/afterSend callbacks for log modification and reactions
- 🆕 **Breadcrumb Tracking** - Track user interactions leading up to errors
- 🆕 **Utility Methods** - addBreadcrumb, flushLogs, getStoredLogs, getBrowserInfo

## 📦 Installation

```bash
npm install clientside-logger --save
```

Or include directly in your HTML:

```html
<script src="path/to/dist/clientside-Logger.min.js"></script>
```

## 🎯 Quick Start

### Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script src="dist/clientside-Logger.js"></script>
</head>
<body>
    <script>
        // Initialize the logger
        Logger.init({
            logURL: 'https://api.example.com/logs',
            logThreshold: 'ERROR',
            showMessageInDevelopment: true,
            additionalInformation: 'My App v1.0.0'
        });

        // Use logging functions
        Logger.info(['User logged in', { userId: 123 }]);
        Logger.error({ 
            errorMessage: 'Failed to load resource', 
            stack: error.stack 
        });

        // Safe execution with automatic error handling
        Logger.tryCatch(
            () => { 
                riskyOperation(); 
            },
            (error) => { 
                console.log('Error handled:', error); 
            }
        );
    </script>
</body>
</html>
```

### ES6 Module Usage

```javascript
import Logger from 'clientside-logger';

// Initialize with configuration
Logger.init({
    logURL: 'https://your-api.example.com/logs',
    logThreshold: 'ERROR',
    showMessageInDevelopment: true,
    showMessageInProduction: false,
    additionalInformation: 'Production App v2.0.0'
});

// Log at different levels
Logger.debug(['Debug info', { component: 'UserAuth' }]);
Logger.log(['General message']);
Logger.info(['User action completed', { action: 'save', userId: 456 }]);
Logger.warn(['Deprecated API used']);
Logger.error({ errorMessage: 'API call failed', stack: err.stack });
Logger.fatal({ errorMessage: 'Critical system error', stack: err.stack });
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Remote Logging** |
| `logURL` | `string` | `''` | Remote endpoint URL to POST logs to |
| `logThreshold` | `string` | `'ERROR'` | Minimum log level to send remotely: `DEBUG`, `LOG`, `INFO`, `WARN`, `ERROR`, `FATAL` |
| `routeURL` | `string` | `''` | URL to redirect to on fatal errors (optional) |
| **Display** |
| `showMessageInDevelopment` | `boolean` | `true` | Display console messages in development mode |
| `showMessageInProduction` | `boolean` | `false` | Display console messages in production mode |
| `silenceStackTrace` | `boolean` | `false` | Suppress stack trace output |
| `additionalInformation` | `string` | `''` | Extra context included in all log messages |
| **v1.1.0: Performance & Resource Management** |
| `batchSize` | `number` | `10` | Number of logs to batch before sending |
| `batchTimeout` | `number` | `5000` | Milliseconds to wait before flushing batch (ms) |
| `requestTimeout` | `number` | `10000` | HTTP request timeout (ms) |
| `useLocalStorage` | `boolean` | `true` | Enable offline log caching in localStorage |
| **v1.1.0: Data Collection & Context** |
| `userId` | `string` | `''` | User identifier to include in all logs |
| `sessionId` | `string` | `''` | Session identifier to include in all logs |
| `environment` | `string` | `'production'` | Environment label (e.g., 'production', 'staging', 'development') |
| `captureUserAgent` | `boolean` | `true` | Auto-capture browser and OS information |
| `captureScreenResolution` | `boolean` | `true` | Auto-capture screen resolution |
| **v1.1.0: Advanced Filtering & Control** |
| `ignoredErrors` | `RegExp[]` | `[]` | Array of regex patterns for errors to ignore |
| `sampleRate` | `number` | `1.0` | Percentage of logs to send (0.0 - 1.0) |
| `customFilters` | `Function[]` | `[]` | Custom filter functions to determine which logs to send |
| **v1.1.0: Security & Privacy** |
| `sanitize` | `boolean` | `true` | Auto-sanitize PII (SSN, credit cards, API keys) |
| `beforeSend` | `Function` | `null` | Hook function called before sending each log |
| `afterSend` | `Function` | `null` | Hook function called after log is sent |

## 📊 Log Levels

Logs are prioritized by severity. Only logs at or above the `logThreshold` are sent to the remote endpoint:

1. **DEBUG** (0) - Detailed debugging information
2. **LOG** (1) - General informational messages  
3. **INFO** (2) - Important informational messages
4. **WARN** (3) - Warning messages
5. **ERROR** (4) - Error messages
6. **FATAL** (5) - Critical errors requiring immediate attention

## 🛠️ API Reference

### `Logger.init(config)`
Initialize the logger and set up global error handlers.

```javascript
Logger.init({
    logURL: 'https://api.example.com/logs',
    logThreshold: 'ERROR',
    showMessageInDevelopment: true
});
```

### Logging Methods

All logging methods accept either an array of messages or an object with error details:

```javascript
// Array format
Logger.debug(['Debug message', { data: 'value' }]);
Logger.log(['General message']);
Logger.info(['Info message']);
Logger.warn(['Warning message']);

// Object format (for errors)
Logger.error({ errorMessage: 'Error occurred', stack: error.stack });
Logger.fatal({ errorMessage: 'Critical error', stack: error.stack });
```

### `Logger.tryCatch(tryCallback, catchCallback)`
Execute a function with automatic error catching and logging.

```javascript
Logger.tryCatch(
    () => {
        // Code that might throw
        riskyOperation();
    },
    (error) => {
        // Optional error handler
        handleError(error);
    }
);
```

### `Logger.catcher(error)`
Manually catch and log an error object.

```javascript
try {
    dangerousOperation();
} catch (error) {
    Logger.catcher(error);
}
```

### `Logger.LOGLEVELS`
Object containing all available log level constants.

```javascript
console.log(Logger.LOGLEVELS);
// { DEBUG: 'DEBUG', LOG: 'LOG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', FATAL: 'FATAL' }
```

### v1.1.0 Utility Methods

#### `Logger.addBreadcrumb(message, data)`
Track user interactions that led to an error.

```javascript
Logger.addBreadcrumb('User clicked checkout', { button: 'checkout-btn' });
Logger.addBreadcrumb('Cart updated', { itemCount: 5 });
Logger.error({ errorMessage: 'Payment failed' });
// Breadcrumbs are included with the error log
```

#### `Logger.flushLogs()`
Immediately send all pending batched logs to the server.

```javascript
Logger.log(['Operation started']);
Logger.log(['Operation completed']);
Logger.flushLogs();  // Send queued logs immediately
```

#### `Logger.getStoredLogs()`
Retrieve logs stored in offline cache.

```javascript
const offlineLogs = Logger.getStoredLogs();
console.log('Cached logs:', offlineLogs);
// Returns array of log objects stored in localStorage
```

#### `Logger.getBrowserInfo()`
Get detected browser and system information.

```javascript
const browserInfo = Logger.getBrowserInfo();
console.log(browserInfo);
// { browser: 'Chrome', version: '120', OS: 'Windows', screenResolution: '1920x1080' }
```

### v1.1.0 Security Features

#### PII Sanitization
Automatically redacts sensitive data from all logs:

```javascript
Logger.init({ sanitize: true });

// These are automatically sanitized:
Logger.error('Credit card 4532-1234-5678-9010 failed');  // → ****-****-****-9010
Logger.error('SSN: 123-45-6789');                       // → [REDACTED]
Logger.error('API Key: sk_live_abc123xyz');            // → sk_live_[REDACTED]
```

#### Security Hooks
Modify or react to logs before/after sending:

```javascript
Logger.init({
    beforeSend: (log) => {
        // Modify log before sending
        if (log.message.includes('sensitive')) {
            log.message = '[REDACTED]';
        }
        return log;
    },
    afterSend: (log) => {
        // React after sending
        analytics.track('error', { type: log.logType });
    }
});
```

## 🌐 Remote Logging

When `logURL` is configured, logs meeting the threshold are sent via HTTP POST:

```json
{
    "url": "/current/page/path",
    "logType": "ERROR",
    "message": "Error message with additional context",
    "detailMessage": "Error: Stack trace here..."
}
```

**Server Requirements:**
- Accept POST requests with `Content-Type: application/json`
- CORS configuration if logging cross-domain
- Handle the JSON payload structure above

## 🎨 Examples

Comprehensive examples are included in the `examples/` directory:

- **[basic-usage.html](./examples/basic-usage.html)** - Interactive browser demo with all features
- **[node-usage.js](./examples/node-usage.js)** - Node.js usage patterns
- **[README.md](./examples/README.md)** - Detailed examples documentation

### Run the Examples

```bash
# Build the library
npm run build

# Open the interactive example
start examples/basic-usage.html
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for tests
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build
```

## 🌍 Browser Support

- ✅ **Chrome** 30+
- ✅ **Firefox** 34+
- ✅ **Safari** 8+
- ✅ **IE** 11+
- ✅ **Edge** (all versions)
- ✅ **Node.js** (API compatible, limited browser-specific features)

## 🔒 Production Readiness

This library has been thoroughly vetted for production use:

- ✅ All critical bugs fixed
- ✅ Comprehensive test coverage (70%+)
- ✅ ESLint configuration and code quality checks
- ✅ Full JSDoc documentation
- ✅ Error handling and edge cases covered
- ✅ Minified build available
- ✅ No external runtime dependencies

## 📝 Best Practices

1. **Initialize Early** - Call `Logger.init()` at the start of your application before other code runs
2. **Choose Appropriate Levels** - Use DEBUG/LOG for development, INFO/WARN/ERROR/FATAL for production
3. **Set Smart Thresholds** - Only send ERROR and FATAL to your server to reduce noise
4. **Include Context** - Use `userId` and `sessionId` to track logs by user and session
5. **Enable Batching** - Use request batching to reduce server load (default: batchSize=10, timeout=5s)
6. **Use Offline Support** - Enable localStorage caching for critical applications
7. **Sanitize Sensitive Data** - Enable `sanitize: true` to auto-redact PII
8. **Add Breadcrumbs** - Use `addBreadcrumb()` to track user actions leading to errors
9. **Implement Security Hooks** - Use `beforeSend` to validate logs before sending
10. **Use tryCatch** - Wrap risky operations in `Logger.tryCatch()` for better error tracking
11. **Test Your Endpoint** - Ensure your `logURL` accepts the JSON payload format
12. **Handle Errors Gracefully** - The logger won't break your app if logging fails

## 🐛 Troubleshooting

**Logger not catching errors?**
- Ensure `Logger.init()` is called before any other application code
- Check that errors aren't being caught by other handlers first

**Console messages not appearing?**
- Verify `showMessageInDevelopment` or `showMessageInProduction` is `true`
- Check browser console filters aren't hiding messages

**Remote logs not being sent?**
- Confirm `logURL` is configured correctly
- Ensure log level meets the `logThreshold` setting
- Check network tab for failed POST requests
- Verify CORS settings on your server allow requests from your domain

**"Logger is not defined" error?**
- Ensure the script is loaded before trying to use it
- Check the script path is correct
- Verify the build includes the standalone bundle

## 📄 License

ISC © Raghu Raghavan

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 🔗 Links

- [API Documentation](./doc/api.md)
- [Examples](./examples/README.md)
- [GitHub Repository](https://github.com/decodewithraghu/clientside-logger)
- [Issue Tracker](https://github.com/decodewithraghu/clientside-logger/issues)

---

**Made with ❤️ for better error tracking and logging in browser applications**