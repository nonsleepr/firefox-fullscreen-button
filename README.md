# Fullscreen Button

A simple Firefox extension that provides a floating button to toggle fullscreen mode on any webpage.

## Features

- 🖱️ Click the extension icon to show/hide a floating fullscreen button
- 🎯 Draggable button - position it anywhere on the page
- 👆 Tap the button to enter/exit fullscreen mode
- ⌨️ Press F11 keyboard shortcut (desktop only)
- 🚀 Clean, minimal codebase with performance optimizations
- 📱 Perfect for mobile devices (Firefox for Android)
- 🎨 Auto-hides in fullscreen mode

## Development

This project uses [devenv](https://devenv.sh/) for development environment management.

### Setup

```bash
# Enter the development environment
devenv shell
```

### Commands

Once in the devenv shell, you have access to these commands:

```bash
# Build the extension (.xpi file)
build

# Clean build artifacts
clean

# Run extension in Firefox for testing
run

# Test on Android device
android <device-id>

# Lint the extension code
lint
```

### Manual Build

If you prefer not to use devenv:

```bash
cd src
zip -r ../fullscreen-button.xpi *
```

### Testing on Desktop

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select `manifest.json` from the `src/` folder
4. The extension loads immediately

**Note:** Temporary add-ons are removed when Firefox closes.

### Testing on Android

#### Prerequisites
1. Enable USB Debugging on your Android device:
   - Settings → About Phone → Tap "Build number" 7 times
   - Developer Options → Enable "USB Debugging"
2. Connect device via USB and verify: `adb devices`

#### Using web-ext (Recommended)
```bash
# Run extension on Android
web-ext run --target=firefox-android --android-device=<device-id> --source-dir=src

# Or using devenv
devenv shell
android <device-id>
```

When prompted, select your Firefox app:
- `org.mozilla.fenix` (Firefox)
- `org.mozilla.firefox_beta` (Firefox Beta)
- `org.mozilla.fennec_aurora` (Firefox Nightly)

The extension loads temporarily and **reloads automatically** when you make changes!

### Debugging

#### Desktop Browser Console
```bash
# Open console
Ctrl+Shift+J (Windows/Linux)
Cmd+Shift+J (Mac)
```

#### Android Debugging
```bash
# View all logs
adb logcat

# Filter for extension activity
adb logcat | grep -i "fullscreen"

# Remote debugging
# 1. Enable "Remote debugging via USB" in Firefox for Android settings
# 2. Navigate to about:debugging in desktop Firefox
# 3. Connect to your device
```

### Common Issues

#### "Extension is Corrupt" Error
- **Solution**: Load as temporary add-on via `about:debugging` instead of installing `.xpi`
- Verify package structure: `unzip -l your-extension.xpi`
- Files must be at root level (not in a `src/` subfolder)

#### Unsigned Extension Warning
For development only:
1. Type `about:config` in Firefox
2. Search for `xpinstall.signatures.required`
3. Set to `false`

**Warning:** This reduces security. Only use for testing.

### Build Verification

```bash
# Build and verify package contents
cd src
zip -r ../test-extension.xpi *
unzip -l ../test-extension.xpi
```

Expected files:
- `manifest.json`
- `background.js`
- `content.js`
- `icon.svg`

## Installation

### Desktop: Temporary Installation (Testing)

1. Open Firefox and navigate to: `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select any file in the `src/` folder (e.g., `manifest.json`)

### Android: Testing with web-ext (Recommended)

The easiest way to test unsigned extensions on Android:

```bash
# 1. Enable USB Debugging on your Android device
#    Settings → About Phone → Tap "Build number" 7 times
#    Developer Options → Enable "USB Debugging"

# 2. Connect device via USB and verify
adb devices

# 3. Run the extension on Android
web-ext run --target=firefox-android --android-device=<device-id> --source-dir=src

# When prompted, select:
# - org.mozilla.fenix (Firefox)
# - org.mozilla.firefox_beta (Firefox Beta)
# - org.mozilla.fennec_aurora (Firefox Nightly)
```

The extension will load temporarily and reload automatically when you make changes!

### Permanent Installation (Requires Signing)

For permanent installation on any Firefox version:

1. **Get it signed** (free) at [addons.mozilla.org](https://addons.mozilla.org/developers/)
   - Choose "On your own" (unlisted/self-distributed)
   - Upload your `.xpi` file
   - Download the signed version
2. Install the signed `.xpi` on any Firefox (desktop or Android)

**Note:** Unsigned extensions can only be loaded temporarily in standard Firefox.

## Why a Floating Button?

The Fullscreen API requires user gestures to work. On Firefox for Android, using `executeScript` breaks the gesture chain, so we inject a visible button that users interact with directly. This ensures the fullscreen request originates from a valid user action.