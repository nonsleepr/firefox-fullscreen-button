{ pkgs, ... }:

{
  # Package dependencies
  packages = with pkgs; [
    web-ext  # Firefox extension development tool
    zip      # For packaging .xpi files
  ];

  # Scripts for building and testing the extension
  scripts = {
    build.exec = ''
      echo "Building Firefox extension..."
      mkdir -p build
      cd src && zip -r ../build/fullscreen-button-0.1.0.xpi *
      echo "Extension built: build/fullscreen-button-0.1.0.xpi"
    '';

    clean.exec = ''
      echo "Cleaning build directory..."
      rm -rf build
      echo "Clean complete"
    '';

    run.exec = ''
      echo "Running extension in Firefox desktop..."
      web-ext run --source-dir=src
    '';

    android.exec = ''
      echo "Testing extension on Firefox Android..."
      echo ""
      if [ -z "$1" ]; then
        echo "Getting connected devices..."
        adb devices
        echo ""
        echo "Usage: android <device-id>"
        echo "Example: android vincent:33495"
        exit 1
      fi
      echo "Connecting to device: $1"
      echo ""
      web-ext run --target=firefox-android --android-device="$1" --source-dir=src
    '';

    lint.exec = ''
      echo "Linting extension..."
      web-ext lint --source-dir=src
    '';
  };

  # Environment variables
  env = {
    EXTENSION_NAME = "fullscreen-button";
    EXTENSION_VERSION = "2.0";
  };

  # Shell welcome message
  enterShell = ''
    echo "🦊 Firefox Extension Development Environment"
    echo ""
    echo "Available commands:"
    echo "  build   - Build the extension as .xpi file"
    echo "  clean   - Remove build artifacts"
    echo "  run     - Run extension in Firefox desktop"
    echo "  android - Test extension on Firefox Android (via USB)"
    echo "  lint    - Lint the extension code"
    echo ""
    echo "Extension: $EXTENSION_NAME v$EXTENSION_VERSION"
    echo ""
    echo "📱 Android Testing:"
    echo "  1. Enable USB debugging on your Android device"
    echo "  2. Connect via USB and run: android"
  '';
}