// Firefox-compatible background script
browser.runtime.onInstalled.addListener(() => {
  // Clear old settings
  browser.storage.local.clear().then(() => {
    // Set new default settings
    const defaultSettings = {
      hideElements: {
        sidebar: { enabled: false },
        trending: { enabled: false },
        grok: { enabled: true },
        communities: { enabled: true },
        articles: { enabled: true },
        explore: { enabled: true },
        jobs: { enabled: true },
        communityNotes: { enabled: true },
        business: { enabled: true },
        creatorStudio: { enabled: true }
      },
      replaceElements: {
        xLogo: { enabled: true },
        tweetButton: { enabled: true }
      },
      styleFixes: {
        centerLayout: { enabled: false }
      },
      buttonColors: {
        composeButton: { enabled: true }
      },
      theme: { enabled: false }
    };

    return browser.storage.local.set({ settings: defaultSettings });
  }).catch(error => {
    console.error('Failed to initialize settings:', error);
  });
});

// Update the message listener to use new settings format
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'refreshTheme') {
    // Notify content script to update theme
    browser.tabs.query({ url: ['*://twitter.com/*', '*://x.com/*'] }).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, { type: 'refreshTheme' });
      });
    });
  }
}); 