# Browser Logger - Usage Examples

This directory contains practical examples demonstrating how to use the Browser Logger library.

## Examples Included

### 1. `basic-usage.html` - Browser Example
Interactive HTML page demonstrating all logger features in a browser environment.

**To run:**
```bash
# First, build the library
npm run build

# Then open the HTML file in a browser
start basic-usage.html
```

**Features demonstrated:**
- ✅ Initializing the logger with configuration
- ✅ All log levels (DEBUG, LOG, INFO, WARN, ERROR, FATAL)
- ✅ Automatic error catching (uncaught errors and promise rejections)
- ✅ `tryCatch` wrapper for safe function execution
- ✅ Manual error catching with `catcher`
- ✅ Real-world API usage example

### 2. `node-usage.js` - Node.js Example
Shows the API usage patterns in a Node.js environment.

**Note:** This logger is primarily designed for browser environments. The Node.js example demonstrates the API but won't send logs to a remote server without browser APIs.

## Quick Start

### Installation

```bash
npm install browserLogger --save
```

### Basic Usage

```javascript
import Logger from 'browserLogger';

// 1. Initialize the logger
Logger.init({
    logURL: 'https://your-api.example.com/logs',
    logThreshold: 'ERROR',
    showMessageInDevelopment: true,
    additionalInformation: 'My App v1.0.0'
});

// 2. Use logging functions
Logger.debug(['Debug info', { data: 'value' }]);
Logger.info(['User logged in', { userId: 123 }]);
Logger.warn(['Deprecated API used']);
Logger.error({ errorMessage: 'Failed to load', stack: error.stack });
Logger.fatal({ errorMessage: 'Critical error', stack: error.stack });

// 3. Use tryCatch for safe execution
Logger.tryCatch(
    () => {
        // Your code here
        riskyOperation();
    },
    (error) => {
        // Error handler
        console.log('Error caught:', error);
    }
);

// 4. Manually catch errors
try {
    dangerousOperation();
} catch (error) {
    Logger.catcher(error);
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logURL` | string | `''` | Remote endpoint to send logs to |
| `logThreshold` | string | `'ERROR'` | Minimum level to send remotely (DEBUG, LOG, INFO, WARN, ERROR, FATAL) |
| `routeURL` | string | `''` | URL to redirect on fatal errors |
| `showMessageInDevelopment` | boolean | `true` | Show console messages in development |
| `showMessageInProduction` | boolean | `false` | Show console messages in production |
| `silenceStackTrace` | boolean | `false` | Suppress stack traces |
| `additionalInformation` | string | `''` | Extra context added to all logs |

## Log Levels

The logger supports 6 log levels in order of severity:

1. **DEBUG** - Detailed debugging information
2. **LOG** - General informational messages
3. **INFO** - Important informational messages
4. **WARN** - Warning messages
5. **ERROR** - Error messages
6. **FATAL** - Critical errors that may require attention

## API Reference

### `Logger.init(config)`
Initialize the logger and set up global error handlers.

### `Logger.debug(messages)`
Log debug-level messages.

### `Logger.log(messages)`
Log general messages.

### `Logger.info(messages)`
Log informational messages.

### `Logger.warn(messages)`
Log warning messages.

### `Logger.error(messages)`
Log error messages.

### `Logger.fatal(messages)`
Log fatal error messages.

### `Logger.catcher(error)`
Manually catch and log an error object.

### `Logger.tryCatch(tryCallback, catchCallback)`
Execute a function with automatic error catching.

### `Logger.LOGLEVELS`
Object containing all available log level constants.

## Remote Logging

When `logURL` is configured, logs at or above the `logThreshold` will be sent to your server via POST request:

```json
{
    "url": "/current/page",
    "logType": "ERROR",
    "message": "Error message with additional info",
    "detailMessage": "Error stack trace"
}
```

## Browser Support

- ✅ Chrome 30+
- ✅ Firefox 34+
- ✅ Safari 8+
- ✅ IE 11+
- ✅ Edge (all versions)

## Error Handling

The logger automatically catches:
- Uncaught JavaScript errors (via `window.error` event)
- Unhandled promise rejections (via `window.unhandledrejection` event)

## Best Practices

1. **Initialize early** - Call `Logger.init()` as early as possible in your application
2. **Use appropriate levels** - Choose the right log level for your messages
3. **Set threshold wisely** - Only send important logs to your server (ERROR and FATAL)
4. **Include context** - Use `additionalInformation` to add app version or environment
5. **Use tryCatch** - Wrap risky operations in `Logger.tryCatch()` for better error tracking

## Troubleshooting

**Logger not catching errors?**
- Make sure `Logger.init()` is called before your application code
- Check that error events are not being caught elsewhere first

**Not seeing console messages?**
- Verify `showMessageInDevelopment` or `showMessageInProduction` is set to `true`
- Check that you're using the correct environment

**Remote logs not being sent?**
- Ensure `logURL` is configured correctly
- Check that the log level meets the `logThreshold`
- Verify CORS settings on your server

## License

ISC
