# BlueRaven Safari Extension

This is the Safari version of the BlueRaven extension that makes Twitter (sometimes known as X) look more like Twitter.

## Building the Extension

### Prerequisites
- macOS 10.15 (Catalina) or later
- Xcode 12 or later
- Safari 14 or later

### Build Steps
1. Open the `BlueRaven.xcodeproj` file in Xcode
2. Select the "BlueRaven" scheme
3. Click the Build button (▶️) to build and run the app
4. When the app launches, click "Open Safari Extension Preferences"
5. In Safari's preferences, enable the BlueRaven extension
6. The BlueRaven icon will appear in your Safari toolbar

## Development Notes

### Extension Structure
- The Safari extension uses WebExtension APIs, similar to Chrome and Firefox extensions
- Core functionality is shared with the Chrome and Firefox versions
- The Safari-specific code handles browser compatibility differences

### Code Structure
- The extension is packaged as a Safari App Extension inside a macOS app
- The web extension code is in the `Resources` directory
- The Swift code handles the native app interface

### Browser API Compatibility
- The extension uses a universal API wrapper to work across browsers
- The main browserAPI variable detects the environment and uses the appropriate API:
  ```javascript
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  ```

## Distribution
To distribute the Safari extension, you need an Apple Developer account and must submit the app to the Mac App Store.