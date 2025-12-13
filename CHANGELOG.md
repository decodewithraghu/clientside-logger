# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-13

### Added

#### Performance & Resource Management
- **Request Batching**: Batch multiple logs before sending to reduce server load
  - `batchSize`: Configure number of logs to batch (default: 10)
  - `batchTimeout`: Set timeout for forced flush (default: 5000ms)
  - `maxQueueSize`: Limit queue size (default: 1000)
- **HTTP Timeout**: New `requestTimeout` option (default: 10000ms)
- **Offline Support**: Automatic localStorage backup for logs when offline
  - `useLocalStorage`: Enable/disable offline storage (default: true)
  - Auto-sync when connection restored
- **Fetch API Support**: Use modern fetch() with XHR fallback
  - Better error handling and compatibility
  - Automatic timeout handling

#### Data Collection & Context
- **Browser Information**: Auto-capture browser type, version, platform
  - `captureUserAgent`: Enable/disable browser info (default: true)
- **Screen Resolution**: Auto-capture device resolution and color depth
  - `captureScreenResolution`: Enable/disable (default: true)
- **User & Session Tracking**:
  - `userId`: Track logs by user ID
  - `sessionId`: Track logs by session ID
  - `environment`: Add environment context (production, staging, etc.)
- **Breadcrumbs**: Track user interactions and navigation
  - `maxBreadcrumbs`: Limit stored breadcrumbs (default: 20)
  - Auto-track clicks, navigation, errors
  - `captureInteractions`: Enable/disable interaction tracking (default: true)

#### Advanced Filtering & Control
- **Error Ignoring**: Filter out specific errors by pattern
  - `ignoredErrors`: Array of strings/regex to ignore
  - `ignoredUrls`: Array of URL patterns to ignore
- **Sampling**: Reduce log volume with sampling
  - `sampleRate`: Send only X% of logs (0-1, default: 1.0)
- **Custom Filters**: Add custom filtering logic
  - `customFilters`: Array of filter functions for fine-grained control

#### Security & Privacy
- **PII Sanitization**: Automatic removal of sensitive data
  - Masks SSNs (XXX-XX-XXXX)
  - Masks credit cards (XXXX-XXXX-XXXX-XXXX)
  - Masks API keys and tokens
  - Masks email addresses
  - `sanitize`: Enable/disable sanitization (default: true)
- **Hooks for Custom Processing**:
  - `beforeSend`: Hook to modify logs before sending
  - `afterSend`: Hook to run after sending
  - Enable custom validation, encryption, or modifications

#### Developer Experience
- **TypeScript Definitions**: Full type safety with `index.d.ts`
  - Complete interface definitions
  - JSDoc documentation
  - IDE autocompletion support
- **Exposed Utility Functions**:
  - `getBrowserInfo()`: Get browser details
  - `getScreenResolution()`: Get device resolution
  - `addBreadcrumb()`: Manually add breadcrumbs
  - `flushLogs()`: Manually flush queued logs
- **Enhanced Documentation**: Comprehensive JSDoc for all functions
- **Better Error Messages**: More helpful console warnings and errors

#### Testing & Quality
- **Increased Test Coverage**: Tests for all new features
  - Performance & resource management tests
  - Data collection & context tests
  - Filtering & control tests
  - Security & privacy tests
  - Breadcrumb & interaction tests
  - Offline support tests
- **Mock localStorage & fetch**: Better test isolation
- **Edge Case Handling**: Graceful handling of missing APIs and failures

### Changed

- **Logger Architecture**: Complete refactor for extensibility
  - Separated concerns into utility functions
  - Better state management with caching
  - Improved error handling throughout
- **Configuration Options**: Expanded init() with many new options
  - Backward compatible with existing code
  - All new options have sensible defaults
- **Event Listener Setup**: Added online/offline event handlers
  - Auto-sync logs when coming back online
- **Log Data Structure**: Enhanced with metadata
  - Includes browser info, screen resolution, timestamps
  - Batched logs sent as array with breadcrumbs

### Fixed

- XHR timeout handling
- Memory leaks from event listeners
- Race conditions in log batching
- localStorage quota errors
- Network request error handling
- CORS error messages

### Deprecated

- Direct use of XMLHttpRequest in favor of fetch + XHR fallback

### Security

- Added PII sanitization by default
- Added before/after send hooks for custom processing
- Added error/URL ignoring for sensitive endpoints
- Better handling of sensitive data in logs

## [1.0.0] - 2025-12-08

### Added

- Initial release of Browser Logger
- Multiple log levels (DEBUG, LOG, INFO, WARN, ERROR, FATAL)
- Automatic error catching for uncaught exceptions
- Unhandled promise rejection tracking
- Remote logging via HTTP POST
- Configuration options for development/production
- Try-catch wrapper utility
- Manual error catching with catcher()
- Complete JSDoc documentation
- Zero runtime dependencies
- Comprehensive test suite
- Browser support: Chrome 30+, Firefox 34+, Safari 8+, IE 11+, Edge
- Example HTML and Node.js usage files
- Published to npm as `clientside-logger`

---

## Version History

### Upcoming (v1.2.0)

- Source map support for de-minifying stack traces
- Sentry/Rollbar integration plugins
- Performance monitoring (memory, CPU)
- Session replay integration
- Enhanced analytics dashboard
- Rate limiting and request deduplication

### Future Roadmap

- v2.0.0: Full TypeScript rewrite
- Plugin system for extensibility
- Web Worker support for async logging
- IndexedDB support for larger offline storage
- Service Worker integration
- GraphQL support for structured queries
