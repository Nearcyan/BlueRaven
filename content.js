let activeStyles = new Map();
let extensionContextActive = true;
let observer;

const isExtensionContextInvalidated = (error) => (
  String(error?.message || error || '').includes('Extension context invalidated')
);

const stopContentScript = () => {
  extensionContextActive = false;
  observer?.disconnect();
};

const isHideElementEnabled = (settings, key) => (
  settings?.hideElements?.[key]?.enabled ??
  (TWITTER_MODS.hideElements[key]?.enabled === true)
);

const injectTheme = async () => {
  if (!extensionContextActive) {
    return;
  }

  try {
    if (!chrome?.runtime?.id) {
      stopContentScript();
      return;
    }

    const { settings } = await chrome.storage.sync.get('settings');
    const activeSettings = settings || {};
    
    StyleManager.removeAllStyles();
    restoreManagedHiddenElements();
    
    Object.entries(TWITTER_MODS).forEach(([modType, modConfig]) => {
      if (modType === 'theme') {
        const isEnabled = activeSettings?.theme?.enabled ?? (modConfig.enabled === true);
        FeatureHandlers.theme(modConfig, isEnabled);
      } else {
        Object.entries(modConfig).forEach(([key, config]) => {
          const isEnabled = activeSettings?.[modType]?.[key]?.enabled ?? (config.enabled === true);
          FeatureHandlers[modType](config, isEnabled, key);
        });
      }
    });

    if (isHideElementEnabled(activeSettings, 'floatingChatButton')) {
      hideFloatingMessageButton();
    }

    const shouldHideWhatsHappening = isHideElementEnabled(activeSettings, 'whatsHappeningPanel');
    const shouldHideWhoToFollow = isHideElementEnabled(activeSettings, 'whoToFollowPanel');
    const shouldHideRightSidebarFooter = isHideElementEnabled(activeSettings, 'rightSidebarFooter');

    if (shouldHideWhatsHappening) {
      hideWhatsHappeningPanel();
    }
    if (shouldHideWhoToFollow) {
      hideWhoToFollowPanel();
    }
    if (shouldHideRightSidebarFooter) {
      hideRightSidebarFooter();
    }
    if (shouldHideWhatsHappening || shouldHideWhoToFollow || shouldHideRightSidebarFooter) {
      hideEmptyRightSidebarCards();
    }
  } catch (error) {
    if (isExtensionContextInvalidated(error)) {
      stopContentScript();
      return;
    }

    console.error('Failed to apply modifications:', error);
  }
};

const restoreManagedHiddenElements = () => {
  document.querySelectorAll('[data-blueraven-hidden="true"]').forEach(element => {
    element.style.removeProperty('display');
    element.removeAttribute('data-blueraven-hidden');
  });
};

const hideManagedElement = (element) => {
  element.setAttribute('data-blueraven-hidden', 'true');
  element.style.setProperty('display', 'none', 'important');
};

const normalizeSidebarText = (text) => (
  String(text ?? '')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
);

const isVisibleElement = (element) => {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const isInRightColumn = (element) => {
  const rect = element.getBoundingClientRect();
  return isVisibleElement(element) && rect.left > window.innerWidth * 0.45;
};

const isAlignedWithRightSidebarSearch = (element) => {
  const search =
    document.querySelector('form[role="search"][aria-label="Search"]') ||
    document.querySelector('form[role="search"]') ||
    document.querySelector('input[data-testid="SearchBox_Search_Input"]') ||
    document.querySelector('input[aria-label="Search query"]');
  if (!search) {
    return false;
  }

  const searchRect = (search.closest('form[role="search"]') || search).getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return (
    isVisibleElement(element) &&
    elementRect.top >= searchRect.bottom - 48 &&
    elementRect.left >= searchRect.left - 96 &&
    elementRect.right <= searchRect.right + 96
  );
};

const isInRightSidebarArea = (element) => (
  Boolean(element.closest('div[data-testid="sidebarColumn"]')) ||
  isInRightColumn(element) ||
  isAlignedWithRightSidebarSearch(element)
);

const getRightSidebar = () => {
  const testIdSidebar = document.querySelector('div[data-testid="sidebarColumn"]');
  if (testIdSidebar) {
    return testIdSidebar;
  }

  const search =
    document.querySelector('form[role="search"][aria-label="Search"]') ||
    document.querySelector('form[role="search"]') ||
    document.querySelector('input[data-testid="SearchBox_Search_Input"]') ||
    document.querySelector('input[aria-label="Search query"]');
  if (!search) {
    return document.body;
  }

  let current = search.closest('form[role="search"]') || search;
  let best = current;
  while (current?.parentElement && current.parentElement !== document.body) {
    const parent = current.parentElement;
    const rect = parent.getBoundingClientRect();
    const containsTimeline = Boolean(parent.querySelector('div[data-testid="primaryColumn"], main[role="main"]'));
    if (containsTimeline || rect.left < window.innerWidth * 0.35 || rect.width > 700) {
      break;
    }
    best = parent;
    current = parent;
  }
  return best || document.body;
};

const getRightSidebarSearchRoot = (sidebar) => {
  const search =
    sidebar.querySelector('form[role="search"][aria-label="Search"]') ||
    sidebar.querySelector('form[role="search"]') ||
    sidebar.querySelector('input[data-testid="SearchBox_Search_Input"]') ||
    sidebar.querySelector('input[aria-label="Search query"]');
  return search?.closest('form[role="search"]') || search || null;
};

const getRightSidebarSectionRoot = (element, sidebar, preserveRoot) => {
  let current = element;
  while (current?.parentElement && current.parentElement !== sidebar) {
    const parent = current.parentElement;
    if (preserveRoot && parent.contains(preserveRoot) && !current.contains(preserveRoot)) {
      return current;
    }
    current = parent;
  }
  return current && current !== sidebar ? current : null;
};

const findRightSidebarTextElement = (sidebar, labels) => {
  const normalizedLabels = labels.map(normalizeSidebarText);
  const scopedMatch = Array.from(sidebar.querySelectorAll('h1, h2, h3, div, span, a'))
    .find(element =>
      normalizedLabels.includes(normalizeSidebarText(element.textContent || '')) &&
      isInRightColumn(element)
    );
  if (scopedMatch) {
    return scopedMatch;
  }

  return Array.from(document.querySelectorAll('h1, h2, h3, div, span, a'))
    .find(element =>
      normalizedLabels.includes(normalizeSidebarText(element.textContent || '')) &&
      isInRightColumn(element)
    );
};

const findRightSidebarCardRoot = (element, preserveRoot) => {
  const stableCard =
    element.closest('div[class~="r-jxzhtn"][class~="r-1867qdf"][class~="r-rs99b7"]') ||
    element.closest('div[class~="r-jxzhtn"][class~="r-rs99b7"]');
  if (
    stableCard &&
    (!preserveRoot || !stableCard.contains(preserveRoot)) &&
    isInRightColumn(stableCard)
  ) {
    return stableCard;
  }

  let current = element;
  let fallback = null;
  while (current?.parentElement && current.parentElement !== document.body) {
    const rect = current.getBoundingClientRect();
    const style = window.getComputedStyle(current);
    const hasRoundedBorder =
      parseFloat(style.borderTopLeftRadius) >= 8 &&
      (
        parseFloat(style.borderTopWidth) > 0 ||
        parseFloat(style.borderBottomWidth) > 0 ||
        style.backgroundColor !== 'rgba(0, 0, 0, 0)'
      );
    const plausibleCard =
      rect.left > window.innerWidth * 0.45 &&
      rect.width >= 250 &&
      rect.width <= 520 &&
      rect.height >= 80 &&
      rect.height <= window.innerHeight * 0.85 &&
      !current.querySelector('form[role="search"], input[data-testid="SearchBox_Search_Input"], input[aria-label="Search query"]') &&
      (!preserveRoot || !current.contains(preserveRoot));

    if (plausibleCard) {
      fallback = current;
      if (hasRoundedBorder) {
        return current;
      }
    }

    const parentRect = current.parentElement.getBoundingClientRect();
    if (parentRect.width > 700 || parentRect.left < window.innerWidth * 0.35) {
      break;
    }
    current = current.parentElement;
  }
  return fallback;
};

const hideFloatingMessageButton = () => {
  document.querySelectorAll('svg[data-icon="icon-messages-stroke"]').forEach(icon => {
    const rect = icon.getBoundingClientRect();
    const isBottomRight = rect.left > window.innerWidth * 0.5 && rect.top > window.innerHeight * 0.45;
    if (!isBottomRight) {
      return;
    }

    const fixedContainer = icon.closest('div[style*="position: fixed"], div[style*="position: absolute"]');
    const clickableContainer = icon.closest('button, [role="button"], a');
    const target = fixedContainer || clickableContainer;
    if (target) {
      hideManagedElement(target);
    }
  });
};

const hidePanelElement = (element) => {
  const sidebar = getRightSidebar();
  const searchRoot = getRightSidebarSearchRoot(sidebar);
  const root =
    findRightSidebarCardRoot(element, searchRoot) ||
    element.closest('section[role="region"], aside[role="complementary"], aside') ||
    getRightSidebarSectionRoot(element, sidebar, searchRoot) ||
    element;

  if (root && (!searchRoot || !root.contains(searchRoot))) {
    hideManagedElement(root);
  }
};

const hideWhatsHappeningPanel = () => {
  const timeline =
    Array.from(document.querySelectorAll('section[role="region"] [aria-label="Timeline: Trending now"], [aria-label="Timeline: Trending now"]'))
      .find(isInRightColumn);
  if (timeline) {
    hidePanelElement(timeline);
    return;
  }

  const trend =
    Array.from(document.querySelectorAll('[data-testid="trend"], a[href="/explore/tabs/for-you"]'))
      .find(isInRightColumn);
  if (trend) {
    hidePanelElement(trend);
    return;
  }

  hideRightSidebarSectionByText(["What's happening"]);
};

const hideWhoToFollowPanel = () => {
  const panel =
    Array.from(document.querySelectorAll('aside[aria-label="Who to follow"], a[href*="/i/connect_people"], [data-testid="UserCell"]'))
      .find(isInRightColumn);
  if (panel) {
    hidePanelElement(panel);
    return;
  }

  hideRightSidebarSectionByText(['Who to follow']);
};

const hideEmptyRightSidebarCards = () => {
  const cardSelectors = [
    'div[class~="r-jxzhtn"][class~="r-1867qdf"][class~="r-rs99b7"]',
    'div[class~="r-jxzhtn"][class~="r-rs99b7"]',
    'div[class~="r-1phboty"][class~="r-rs99b7"][class~="r-1udh08x"]'
  ];

  document
    .querySelectorAll(cardSelectors.join(','))
    .forEach(card => {
      const hasSearch = Boolean(card.querySelector('form[role="search"], input[data-testid="SearchBox_Search_Input"], input[aria-label="Search query"]'));
      if (hasSearch || !isInRightSidebarArea(card)) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const style = window.getComputedStyle(card);
      const hasCardFrame =
        rect.width >= 240 &&
        rect.width <= 560 &&
        rect.height >= 40 &&
        rect.height <= window.innerHeight * 0.9 &&
        (
          parseFloat(style.borderTopLeftRadius) >= 8 ||
          parseFloat(style.borderTopWidth) > 0 ||
          parseFloat(style.borderBottomWidth) > 0 ||
          style.overflow === 'hidden'
        );
      if (!hasCardFrame) {
        return;
      }

      const hasVisibleContent = Array.from(card.querySelectorAll('*'))
        .some(child => {
          const childStyle = window.getComputedStyle(child);
          const childRect = child.getBoundingClientRect();
          if (
            childStyle.display === 'none' ||
            childStyle.visibility === 'hidden' ||
            parseFloat(childStyle.opacity) === 0 ||
            childRect.width === 0 ||
            childRect.height === 0
          ) {
            return false;
          }

          if (child.matches('img, video, canvas, input, textarea, select')) {
            return true;
          }

          return Array.from(child.childNodes).some(node => (
            node.nodeType === Node.TEXT_NODE &&
            normalizeSidebarText(node.textContent || '') !== ''
          ));
        });
      if (!hasVisibleContent) {
        hideManagedElement(card);
      }
    });
};

const hideRightSidebarSectionByText = (labels) => {
  const sidebar = getRightSidebar();
  if (!sidebar) {
    return;
  }

  const heading = findRightSidebarTextElement(sidebar, labels);
  if (!heading) {
    return;
  }

  const searchRoot = getRightSidebarSearchRoot(sidebar);
  const sectionRoot = findRightSidebarCardRoot(heading, searchRoot) || getRightSidebarSectionRoot(heading, sidebar, searchRoot);
  if (sectionRoot && !sectionRoot.contains(searchRoot)) {
    hideManagedElement(sectionRoot);
  }
};

const hideRightSidebarFooter = () => {
  const sidebar = getRightSidebar();
  if (!sidebar) {
    return;
  }

  const footerElement =
    Array.from(document.querySelectorAll('a[href="/tos"], a[href="/privacy"], a[href="/privacy/cookie"], a[href="/imprint"], a[href="/accessibility"]'))
      .find(isInRightColumn) ||
    findRightSidebarTextElement(sidebar, ['Terms of Service', 'Privacy Policy', 'Cookie Policy']);
  if (!footerElement) {
    return;
  }

  const searchRoot = getRightSidebarSearchRoot(sidebar);
  const footerRoot = findRightSidebarCardRoot(footerElement, searchRoot) || getRightSidebarSectionRoot(footerElement, sidebar, searchRoot);
  if (footerRoot && !footerRoot.contains(searchRoot)) {
    hideManagedElement(footerRoot);
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  if (!extensionContextActive) {
    return false;
  }

  if (message.type === 'refreshTheme') {
    injectTheme();
    sendResponse({ status: 'ok' });
  }
  return true; // Keep message channel open for async response
});

// Handle dynamic content
observer = new MutationObserver(() => {
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
      const css = (config.selectors || [])
        .filter(selector => typeof selector === 'string' && selector.trim())
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
