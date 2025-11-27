/**
 * popup.js
 * Handles popup UI interactions and communication with background/content scripts
 */

let currentMenuData = null;
let currentRecommendations = null;

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadPreferences();
  checkForMenuData();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  document.getElementById('settings-btn').addEventListener('click', showSettings);
  document.getElementById('back-btn').addEventListener('click', hideSettings);
  document.getElementById('optimize-btn').addEventListener('click', performOptimization);
  document.getElementById('copy-btn').addEventListener('click', copyRecommendations);
  document.getElementById('highlight-btn').addEventListener('click', highlightItems);
  document.getElementById('new-optimization-btn').addEventListener('click', resetRecommendations);
  document.getElementById('clear-data-btn').addEventListener('click', clearData);
  document.getElementById('theme-toggle').addEventListener('change', toggleTheme);
  document.getElementById('retry-btn').addEventListener('click', checkForMenuData);
}

/**
 * Check for menu data from the active tab
 */
function checkForMenuData() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    const tabId = tabs[0].id;
    
    // Request menu data from content script
    chrome.tabs.sendMessage(
      tabId,
      { type: 'GET_MENU_DATA' },
      (response) => {
        if (chrome.runtime.lastError) {
          // Content script not ready yet
          showError('Loading menu data...');
          setTimeout(checkForMenuData, 2000);
          return;
        }

        if (response && response.data) {
          currentMenuData = response.data;
          displayMenu(response.data);
        } else {
          showError('No menu data found. Please ensure you\'re on a UberEats page.');
        }
      }
    );
  });
}

/**
 * Display menu information
 */
function displayMenu(menuData) {
  hideError();
  hideLoadingSpinner();

  document.getElementById('menu-name').textContent =
    `Restaurant: ${menuData.restaurantName || 'Unknown'}`;
  document.getElementById('menu-items-count').textContent =
    `Items: ${menuData.items ? menuData.items.length : 0}`;

  document.getElementById('menu-section').style.display = 'block';
}

/**
 * Perform order optimization
 */
function performOptimization() {
  if (!currentMenuData || !currentMenuData.items) {
    showError('No menu data available');
    return;
  }

  const preferences = {
    maxBudget: parseFloat(document.getElementById('max-budget').value),
    minItems: parseInt(document.getElementById('min-items').value),
    maxItems: parseInt(document.getElementById('max-items').value),
    prioritizeDeals: document.getElementById('prioritize-deals').checked
  };

  // Send optimization request to background
  chrome.runtime.sendMessage(
    {
      type: 'OPTIMIZE_ORDER',
      data: currentMenuData,
      preferences: preferences
    },
    (response) => {
      if (response.success) {
        currentRecommendations = response;
        displayRecommendations(response);
      } else {
        showError('Optimization failed: ' + (response.error || 'Unknown error'));
      }
    }
  );
}

/**
 * Display recommendations
 */
function displayRecommendations(result) {
  const recommendationsList = document.getElementById('recommendations-list');
  recommendationsList.innerHTML = '';

  if (!result.recommendations || result.recommendations.length === 0) {
    recommendationsList.innerHTML = '<p class="no-results">No recommendations available</p>';
    return;
  }

  result.recommendations.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'recommendation-item';
    itemEl.dataset.index = index;

    const savings = item.price - item.effectivePrice;
    const savingsPercent = item.discount || 0;

    itemEl.innerHTML = `
      <div class="item-header">
        <strong>${item.name}</strong>
        ${item.discount ? `<span class="discount-badge">${item.discount}% OFF</span>` : ''}
      </div>
      <div class="item-details">
        <span class="price-original">${item.discount ? `$${item.price.toFixed(2)}` : ''}</span>
        <span class="price-effective">$${item.effectivePrice.toFixed(2)}</span>
        ${savings > 0 ? `<span class="savings">Save $${savings.toFixed(2)}</span>` : ''}
      </div>
      <small class="item-reason">${item.reason}</small>
    `;

    recommendationsList.appendChild(itemEl);
  });

  // Show summary
  const totalCost = result.totalCost;
  const originalCost = result.originalCost;
  const savings = originalCost - totalCost;
  const savingsPercent = originalCost > 0 ? (savings / originalCost * 100).toFixed(1) : 0;

  document.getElementById('summary-text').innerHTML = `
    <strong>Total: $${totalCost.toFixed(2)}</strong>
    ${originalCost > totalCost ? `
      <span class="savings-summary">
        Save $${savings.toFixed(2)} (${savingsPercent}%)
      </span>
    ` : ''}
    <span class="items-count">${result.recommendations.length} items</span>
  `;

  document.getElementById('recommendations-panel').style.display = 'block';
}

/**
 * Copy recommendations to clipboard
 */
function copyRecommendations() {
  if (!currentRecommendations || !currentRecommendations.recommendations) {
    return;
  }

  let text = 'UberEats Order Recommendations:\n\n';
  currentRecommendations.recommendations.forEach((item) => {
    text += `• ${item.name} - $${item.effectivePrice.toFixed(2)}\n`;
  });

  text += `\nTotal: $${currentRecommendations.totalCost.toFixed(2)}`;

  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!');
  });
}

/**
 * Highlight recommended items on the page
 */
function highlightItems() {
  if (!currentMenuData || !currentMenuData.items) {
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: 'HIGHLIGHT_ITEMS',
        items: currentRecommendations.recommendations
      },
      () => {
        if (chrome.runtime.lastError) {
          showError('Could not highlight items on page');
        } else {
          showNotification('Items highlighted on page!');
        }
      }
    );
  });
}

/**
 * Reset recommendations display
 */
function resetRecommendations() {
  document.getElementById('recommendations-panel').style.display = 'none';
  document.getElementById('recommendations-list').innerHTML = '';
  currentRecommendations = null;
}

/**
 * Show settings panel
 */
function showSettings() {
  document.getElementById('menu-section').style.display = 'none';
  document.getElementById('settings-section').style.display = 'block';
  loadSettings();
}

/**
 * Hide settings panel
 */
function hideSettings() {
  document.getElementById('settings-section').style.display = 'none';
  document.getElementById('menu-section').style.display = 'block';
  saveSettings();
}

/**
 * Load preferences from storage
 */
function loadPreferences() {
  chrome.storage.local.get(['maxBudget', 'minItems', 'maxItems', 'prioritizeDeals'], (data) => {
    if (data.maxBudget) document.getElementById('max-budget').value = data.maxBudget;
    if (data.minItems) document.getElementById('min-items').value = data.minItems;
    if (data.maxItems) document.getElementById('max-items').value = data.maxItems;
    if (data.prioritizeDeals !== undefined) {
      document.getElementById('prioritize-deals').checked = data.prioritizeDeals;
    }
  });
}

/**
 * Load settings from storage
 */
function loadSettings() {
  chrome.storage.local.get(['darkMode', 'autoOptimize', 'notifications'], (data) => {
    document.getElementById('theme-toggle').checked = data.darkMode || false;
    document.getElementById('auto-optimize').checked = data.autoOptimize !== false;
    document.getElementById('notification-toggle').checked = data.notifications !== false;
  });
}

/**
 * Save settings to storage
 */
function saveSettings() {
  const maxBudget = parseFloat(document.getElementById('max-budget').value);
  const minItems = parseInt(document.getElementById('min-items').value);
  const maxItems = parseInt(document.getElementById('max-items').value);
  const prioritizeDeals = document.getElementById('prioritize-deals').checked;

  chrome.storage.local.set({
    maxBudget: maxBudget,
    minItems: minItems,
    maxItems: maxItems,
    prioritizeDeals: prioritizeDeals,
    darkMode: document.getElementById('theme-toggle').checked,
    autoOptimize: document.getElementById('auto-optimize').checked,
    notifications: document.getElementById('notification-toggle').checked
  });
}

/**
 * Toggle theme
 */
function toggleTheme() {
  const isDark = document.getElementById('theme-toggle').checked;
  document.body.classList.toggle('dark-mode', isDark);
}

/**
 * Clear all data
 */
function clearData() {
  if (confirm('Clear all stored menu data?')) {
    chrome.runtime.sendMessage(
      { type: 'CLEAR_DATA' },
      () => {
        chrome.storage.local.clear(() => {
          showNotification('Data cleared');
          resetRecommendations();
          currentMenuData = null;
          document.getElementById('menu-section').style.display = 'none';
          checkForMenuData();
        });
      }
    );
  }
}

/**
 * Show error message
 */
function showError(message) {
  document.getElementById('error-text').textContent = message;
  document.getElementById('error-section').style.display = 'block';
  document.getElementById('menu-section').style.display = 'none';
}

/**
 * Hide error message
 */
function hideError() {
  document.getElementById('error-section').style.display = 'none';
}

/**
 * Show loading spinner
 */
function showLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'block';
  document.getElementById('status-text').textContent = 'Analyzing menu...';
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'none';
}

/**
 * Show notification
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
