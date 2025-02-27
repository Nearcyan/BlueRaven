// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onInstalled.addListener(async () => {
  try {
    // Clear old settings
    await browserAPI.storage.sync.clear();

    // Set new default settings
    const defaultSettings = {
      hideElements: {
        sidebar: { enabled: false },
        trending: { enabled: false }
      },
      replaceElements: {
        xLogo: { enabled: false }
      },
      styleFixes: {
        centerLayout: { enabled: false }
      },
      theme: { enabled: false }
    };

    await browserAPI.storage.sync.set({ settings: defaultSettings });
  } catch (error) {
    console.error('Failed to initialize settings:', error);
  }
});

// Update the message listener to use new settings format
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'refreshTheme') {
    // Notify content script to update theme
    browserAPI.tabs.query({ url: ['*://twitter.com/*', '*://x.com/*'] }, (tabs) => {
      tabs.forEach(tab => {
        browserAPI.tabs.sendMessage(tab.id, { type: 'refreshTheme' });
      });
    });
  }
});