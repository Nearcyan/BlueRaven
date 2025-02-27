// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let activeStyles = new Map();

const injectTheme = async () => {
  try {
    const { settings } = await browserAPI.storage.sync.get('settings');
    
    StyleManager.removeAllStyles();
    
    if (!settings) {
      return;
    }
    
    Object.entries(TWITTER_MODS).forEach(([modType, modConfig]) => {
      if (modType === 'theme') {
        FeatureHandlers.theme(modConfig, settings?.theme?.enabled === true);
      } else {
        Object.entries(modConfig).forEach(([key, config]) => {
          const isEnabled = settings?.[modType]?.[key]?.enabled === true;
          FeatureHandlers[modType](config, isEnabled, key);
        });
      }
    });
  } catch (error) {
    // Keep error logging for debugging
    console.error('Failed to apply modifications:', error);
  }
};

const applyTheme = (variables) => {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

const hideElements = (selectors, id) => {
  console.log(`Hiding elements for ${id}:`, selectors);
  
  // Check if elements exist
  const elementsFound = selectors.map(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`Found ${elements.length} elements for selector: ${selector}`);
    return elements.length;
  });

  const style = document.createElement('style');
  style.id = `twitter-theme-${id}`; // Add ID for debugging
  style.textContent = selectors.map(selector => 
    `${selector} { display: none !important; }`
  ).join('\n');
  
  // Remove existing style if any
  const existingStyle = document.head.querySelector(`#twitter-theme-${id}`);
  if (existingStyle) {
    console.log(`Removing existing style for ${id}`);
    existingStyle.remove();
  }
  
  document.head.appendChild(style);
  activeStyles.set(id, style);
  console.log(`Active styles map:`, Array.from(activeStyles.keys()));
};

const replaceElement = (config, id) => {
  const style = document.createElement('style');
  style.textContent = `
    ${config.target} svg { display: none !important; }
    ${config.target} .css-1jxf684 {
      background-image: url('data:image/svg+xml;charset=utf-8,${config.replacementData.svg}');
      background-repeat: no-repeat;
      background-position: center;
      width: ${config.replacementData.width} !important;
      height: ${config.replacementData.height} !important;
      display: block !important;
    }
  `;
  document.head.appendChild(style);
  activeStyles.set(id, style);
};

// Listen for theme update messages from background script
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  if (message.type === 'refreshTheme') {
    injectTheme();
    sendResponse({ status: 'ok' });
  }
  return true; // Keep message channel open for async response
});

// Handle dynamic content
const observer = new MutationObserver(() => {
  injectTheme();
});

// Start observing once DOM is ready
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  injectTheme();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    injectTheme();
  });
}

// Utility functions for style management
const StyleManager = {
  createStyle: (id, css) => {
    const style = document.createElement('style');
    style.id = `twitter-theme-${id}`;
    style.textContent = css;
    return style;
  },

  applyStyle: (id, css) => {
    const existingStyle = document.head.querySelector(`#twitter-theme-${id}`);
    if (existingStyle) {
      existingStyle.remove();
    }
    const style = StyleManager.createStyle(id, css);
    document.head.appendChild(style);
    activeStyles.set(id, style);
  },

  removeAllStyles: () => {
    document.querySelectorAll('style[id^="twitter-theme-"]').forEach(style => {
      style.remove();
    });
    activeStyles.clear();
  }
};

// Feature handlers
const FeatureHandlers = {
  theme: (config, enabled) => {
    if (enabled) {
      const css = Object.entries(config.variables)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n');
      StyleManager.applyStyle('theme', `:root { ${css} }`);
    }
  },

  hideElements: (config, enabled, key) => {
    if (enabled) {
      const css = config.selectors
        .map(selector => `${selector} { display: none !important; }`)
        .join('\n');
      StyleManager.applyStyle(`hideElements-${key}`, css);
    }
  },

  replaceElements: (config, enabled, key) => {
    if (enabled) {
      let css = '';
      switch (config.type) {
        case 'logoReplace':
          css = `
            ${config.target} svg { display: none !important; }
            ${config.target} .css-1jxf684 {
              background-image: url('data:image/svg+xml;charset=utf-8,${config.replacementData.svg}');
              background-repeat: no-repeat;
              background-position: center;
              width: ${config.replacementData.width} !important;
              height: ${config.replacementData.height} !important;
              display: block !important;
            }
            ${config.replacementData.styles || ''}
          `;
          break;
        case 'buttonReplace':
          css = `
            ${config.target} span.css-1jxf684 span {
              visibility: hidden;
            }
            ${config.target} span.css-1jxf684 span::before {
              content: '${config.replacementData.text}';
              visibility: visible;
              position: absolute;
            }
            ${config.replacementData.styles}
          `;
          break;
      }
      StyleManager.applyStyle(`replaceElements-${key}`, css);
    }
  },

  styleFixes: (config, enabled, key) => {
    if (enabled) {
      const css = config.selectors
        .map(selector => `${selector} { ${config.styles} }`)
        .join('\n');
      StyleManager.applyStyle(`styleFixes-${key}`, css);
    }
  },

  buttonColors: (config, enabled, key) => {
    if (enabled) {
      const css = Object.entries(config.selectors)
        .map(([type, selector]) => `${selector} { ${config.styles[type]} }`)
        .join('\n');
      StyleManager.applyStyle(`buttonColors-${key}`, css);
    }
  }
};