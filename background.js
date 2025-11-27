/**
 * background.js
 * Service worker for background tasks: network interception and order optimization
 */

// Import optimizer module
importScripts('optimizer.js');

// Store captured menu data
let capturedMenuData = {};

/**
 * Listen for network requests and capture menu data
 * Note: webRequest API limitations in MV3, using content script approach
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.type);

  switch (request.type) {
    case 'MENU_DATA_CAPTURED':
      handleMenuDataCapture(request.data, sender);
      sendResponse({ success: true });
      break;

    case 'OPTIMIZE_ORDER':
      handleOrderOptimization(request.data, sendResponse);
      return true; // Keep channel open for async response
      break;

    case 'GET_STORED_MENU':
      sendResponse({ data: capturedMenuData });
      break;

    case 'CLEAR_DATA':
      capturedMenuData = {};
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

/**
 * Handles menu data capture and storage
 */
function handleMenuDataCapture(menuData, sender) {
  const key = `menu_${sender.tab.id}`;
  capturedMenuData[key] = {
    data: menuData,
    timestamp: new Date().toISOString(),
    tabId: sender.tab.id,
    url: sender.url
  };

  console.log('Menu data stored:', key, capturedMenuData[key]);

  // Optionally store in chrome.storage.local for persistence
  chrome.storage.local.set({
    [key]: capturedMenuData[key]
  });
}

/**
 * Handles order optimization request
 */
function handleOrderOptimization(menuData, sendResponse) {
  try {
    const preferences = {
      maxBudget: 50,
      prioritizeDeals: true,
      minItems: 1,
      maxItems: 10,
      dietaryRestrictions: [],
      preferredCategories: []
    };

    const recommendations = optimizeOrder(menuData.items, preferences);

    sendResponse({
      success: true,
      recommendations: recommendations.suggestions,
      totalCost: recommendations.totalCost,
      savings: recommendations.savings
    });
  } catch (error) {
    console.error('Optimization error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Listen for tab updates to track menu data
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('ubereats.com')) {
    console.log('UberEats page loaded:', tab.url);
  }
});

/**
 * Clean up data when tab is closed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  const key = `menu_${tabId}`;
  if (capturedMenuData[key]) {
    delete capturedMenuData[key];
    chrome.storage.local.remove([key]);
  }
});

/**
 * Handle install/update events
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Could open a welcome page here
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});
