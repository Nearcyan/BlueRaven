chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Clear old settings
    await chrome.storage.sync.clear();

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

    await chrome.storage.sync.set({ settings: defaultSettings });
  } catch (error) {
    console.error('Failed to initialize settings:', error);
  }
});

// Update the message listener to use new settings format
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'refreshTheme') {
    // Notify content script to update theme
    chrome.tabs.query({ url: ['*://twitter.com/*', '*://x.com/*'] }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'refreshTheme' });
      });
    });
  }
}); 