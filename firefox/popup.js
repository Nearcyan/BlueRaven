const browserAPI = browser;

console.log('Popup script starting...');
console.log('TWITTER_MODS:', typeof TWITTER_MODS !== 'undefined' ? TWITTER_MODS : 'Not loaded');

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded');
  const settingsDiv = document.getElementById('settings');

  try {
    const { settings } = await browserAPI.storage.local.get('settings');
    console.log('Retrieved settings:', settings);

    // Section order and titles
    const sections = [
      { id: 'buttonColors', title: 'Button Colors' },
      { id: 'replaceElements', title: 'UI Elements' },
      { id: 'styleFixes', title: 'Style Fixes' },
      { id: 'hideElements', title: 'Hide Elements' }
    ];

    // Create sections in order
    sections.forEach(({ id, title }) => {
      if (TWITTER_MODS[id]) {
        const sectionDiv = document.createElement('div');

        // Add section title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'section-title';
        titleDiv.textContent = title;
        sectionDiv.appendChild(titleDiv);

        // Add section content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'mod-section';

        // Add toggles for each sub-setting
        Object.entries(TWITTER_MODS[id]).forEach(([key, config]) => {
          // For replaceElements, skip any entry that has a parent property.
          if (id === 'replaceElements' && config.parent) {
            return;
          }
          if (typeof config === 'object' && 'enabled' in config) {
            const item = createToggle(
              `${id}-${key}`,
              config.description,
              settings?.[id]?.[key]?.enabled ?? config.enabled,
              (checked) => updateSetting(id, key, checked)
            );
            contentDiv.appendChild(item);
          }
        });

        sectionDiv.appendChild(contentDiv);
        settingsDiv.appendChild(sectionDiv);
      } else {
        console.log(`Section ${id} not found in TWITTER_MODS`);
      }
    });
  } catch (error) {
    console.error('Error in popup initialization:', error);
  }
});

function createToggle(id, label, checked, onChange) {
  const div = document.createElement('div');
  div.className = 'mod-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;
  checkbox.checked = checked;
  checkbox.addEventListener('change', (e) => onChange(e.target.checked));

  const labelElement = document.createElement('label');
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  div.appendChild(checkbox);
  div.appendChild(labelElement);
  return div;
}

async function updateSetting(modType, key, value) {
  try {
    console.log(`Updating setting: ${modType}.${key} = ${value}`);
    const { settings = {} } = await browserAPI.storage.local.get('settings');

    if (!settings[modType]) settings[modType] = {};
    if (!settings[modType][key]) settings[modType][key] = {};
    settings[modType][key].enabled = value;

    // If this is a parent in replaceElements, update any children as well.
    if (modType === 'replaceElements') {
      const children = Object.entries(TWITTER_MODS.replaceElements)
        .filter(([childKey, childConfig]) => childConfig.parent === key)
        .map(([childKey]) => childKey);

      children.forEach(childKey => {
        if (!settings[modType][childKey]) settings[modType][childKey] = {};
        settings[modType][childKey].enabled = value;
      });
    }

    console.log('New settings:', settings);
    await browserAPI.storage.local.set({ settings });

    // Notify content scripts to refresh
    const tabs = await browserAPI.tabs.query({ url: ['*://twitter.com/*', '*://x.com/*'] });
    console.log('Found tabs to update:', tabs);

    const updatePromises = tabs.map(tab =>
      browserAPI.tabs.sendMessage(tab.id, {
        type: 'refreshTheme',
        modType,
        key,
        value
      }).catch(err => console.error(`Failed to update tab ${tab.id}:`, err))
    );

    // If modType is replaceElements, also send messages for its children.
    if (modType === 'replaceElements') {
      const children = Object.entries(TWITTER_MODS.replaceElements)
        .filter(([childKey, childConfig]) => childConfig.parent === key)
        .map(([childKey]) => childKey);

      children.forEach(childKey => {
        tabs.forEach(tab => {
          updatePromises.push(
            browserAPI.tabs.sendMessage(tab.id, {
              type: 'refreshTheme',
              modType,
              key: childKey,
              value
            }).catch(err => console.error(`Failed to update tab ${tab.id}:`, err))
          );
        });
      });
    }

    await Promise.all(updatePromises);

    // Visual feedback
    const checkbox = document.getElementById(`${modType}-${key}`);
    if (checkbox) {
      checkbox.classList.add('updated');
      setTimeout(() => checkbox.classList.remove('updated'), 500);
    }
  } catch (error) {
    console.error('Failed to update setting:', error);
    alert('Failed to update setting. Check console for details.');
  }
}
