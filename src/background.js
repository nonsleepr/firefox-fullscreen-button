// Listen for clicks on the extension icon
browser.browserAction.onClicked.addListener((tab) => {
  // Send message to content script to show/hide the button
  browser.tabs.sendMessage(tab.id, { action: "toggleButton" })
    .catch(error => {
      // Content script not loaded yet, inject it manually
      browser.tabs.executeScript(tab.id, {
        file: "content.js"
      }).then(() => {
        return browser.tabs.sendMessage(tab.id, { action: "toggleButton" });
      }).catch(err => {
        console.error("Failed to inject content script:", err);
      });
    });
});