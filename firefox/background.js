// Firefox-compatible background script
const DEFAULT_SETTINGS = {
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
    creatorStudio: { enabled: true },
    accountSwitcher: { enabled: true },
    floatingChatButton: { enabled: true },
    whatsHappeningPanel: { enabled: true },
    whoToFollowPanel: { enabled: true },
    rightSidebarFooter: { enabled: true }
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

const mergeSettings = (defaults, saved = {}) => {
  const merged = { ...defaults, ...saved };
  Object.entries(defaults).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      saved?.[key] &&
      typeof saved[key] === 'object' &&
      !Array.isArray(saved[key])
    ) {
      merged[key] = mergeSettings(value, saved[key]);
    }
  });
  return merged;
};

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get('settings').then(({ settings }) => {
    return browser.storage.local.set({ settings: mergeSettings(DEFAULT_SETTINGS, settings) });
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
