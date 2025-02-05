document.addEventListener('DOMContentLoaded', async () => {
	const settingsDiv = document.getElementById('settings');
	const { settings } = await chrome.storage.sync.get('settings');
  
	// Section order and titles
	const sections = [
	  { id: 'buttonColors', title: 'Button Colors' },
	  { id: 'replaceElements', title: 'UI Elements' },
	  { id: 'styleFixes', title: 'Style Fixes' },
	  {
		id: 'hideElements',
		title: 'Grok',
		filter: key => key === 'grok'
	  },
	  { 
		id: 'hideElements', 
		title: 'Hide Side Tabs',
		filter: key => ['communities', 'premium', 'jobs', 'articles', 'explore', 'notifications', 'messages', 'business', 'communityNotes'].includes(key)
	  },
	  {
		id: 'hideElements',
		title: 'Hide Elements',
		filter: key => ['sidebar', 'trending', 'brokenSpacer', 'userInfo'].includes(key)
	  },
	  {
		id: 'hideElements',
		title: 'Engagement Metrics',
		filter: key => ['replyCounts', 'retweetCounts', 'likeCounts', 'viewCounts'].includes(key)
	  }
	];
  
	// Create sections in order
	sections.forEach(({ id, title, filter }) => {
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
		  // Skip if there's a filter and this key doesn't match
		  if (filter && !filter(key)) return;
		  
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
	  }
	});
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
	  const { settings = {} } = await chrome.storage.sync.get('settings');
	  
	  if (!settings[modType]) settings[modType] = {};
	  if (!settings[modType][key]) settings[modType][key] = {};
	  settings[modType][key].enabled = value;
	  
	  await chrome.storage.sync.set({ settings });
	  
	  // Notify content script to refresh
	  const tabs = await chrome.tabs.query({ url: ['*://twitter.com/*', '*://x.com/*'] });
	  
	  const updatePromises = tabs.map(tab => 
		chrome.tabs.sendMessage(tab.id, { 
		  type: 'refreshTheme',
		  modType,
		  key,
		  value
		}).catch(err => console.error(`Failed to update tab ${tab.id}:`, err))
	  );
	  
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