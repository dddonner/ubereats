/**
 * content-script.js
 * Runs in the context of UberEats pages to capture menu data and inject UI overlay
 */

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'MENU_DATA_CAPTURED') {
    console.log('Menu data received:', request.data);
    injectOverlay(request.data);
  }
});

/**
 * Injects a floating widget UI into the UberEats page
 */
function injectOverlay(menuData) {
  // Remove existing overlay if any
  const existingOverlay = document.getElementById('ubereats-optimizer-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'ubereats-optimizer-overlay';
  overlay.innerHTML = `
    <div id="optimizer-widget">
      <div id="optimizer-header">
        <h3>Order Optimizer</h3>
        <button id="optimizer-close">×</button>
      </div>
      <div id="optimizer-content">
        <p>Loading recommendations...</p>
      </div>
      <div id="optimizer-footer">
        <button id="copy-recommendation">Copy to Clipboard</button>
        <button id="highlight-items">Highlight Items</button>
      </div>
    </div>
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = getOverlayStyles();
  overlay.appendChild(styleSheet);

  document.body.appendChild(overlay);

  // Attach event listeners
  document.getElementById('optimizer-close').addEventListener('click', () => {
    overlay.remove();
  });

  document.getElementById('copy-recommendation').addEventListener('click', () => {
    copyRecommendationToClipboard(menuData);
  });

  document.getElementById('highlight-items').addEventListener('click', () => {
    highlightRecommendedItems(menuData);
  });

  // Display recommendations
  displayRecommendations(menuData);
}

/**
 * Displays recommendations in the overlay
 */
function displayRecommendations(menuData) {
  const contentDiv = document.getElementById('optimizer-content');
  
  if (!menuData || !menuData.items || menuData.items.length === 0) {
    contentDiv.innerHTML = '<p>No menu data available</p>';
    return;
  }

  // Send menu data to background for optimization
  chrome.runtime.sendMessage(
    {
      type: 'OPTIMIZE_ORDER',
      data: menuData
    },
    (response) => {
      if (response && response.recommendations) {
        const recommendations = response.recommendations;
        let html = '<div class="recommendations-list">';
        
        recommendations.forEach((item) => {
          html += `
            <div class="recommendation-item">
              <strong>${item.name}</strong>
              <span class="price">$${item.price.toFixed(2)}</span>
              ${item.discount ? `<span class="discount">${item.discount}% off</span>` : ''}
              <small>${item.reason || ''}</small>
            </div>
          `;
        });
        
        html += `
            <div class="total-section">
              <strong>Estimated Total: $${response.totalCost.toFixed(2)}</strong>
            </div>
          </div>
        `;
        
        contentDiv.innerHTML = html;
      } else {
        contentDiv.innerHTML = '<p>Error processing recommendations</p>';
      }
    }
  );
}

/**
 * Copies recommendation details to clipboard
 */
function copyRecommendationToClipboard(menuData) {
  const items = menuData.items.map(item => `${item.name} - $${item.price}`).join('\n');
  const text = `UberEats Order Recommendations:\n\n${items}`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Recommendations copied to clipboard!');
  });
}

/**
 * Highlights recommended items on the page
 */
function highlightRecommendedItems(menuData) {
  // Find menu items on page and highlight them
  const itemElements = document.querySelectorAll('[data-testid*="menu-item"], [class*="MenuItem"]');
  
  itemElements.forEach((element) => {
    const text = element.textContent;
    menuData.items.forEach((item) => {
      if (text.includes(item.name)) {
        element.style.border = '3px solid #00d084';
        element.style.backgroundColor = 'rgba(0, 208, 132, 0.1)';
      }
    });
  });
}

/**
 * Returns CSS styles for the overlay widget
 */
function getOverlayStyles() {
  return `
    #ubereats-optimizer-overlay {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    #optimizer-widget {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      width: 340px;
      max-height: 500px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #optimizer-header {
      background: linear-gradient(135deg, #00d084 0%, #009070 100%);
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #optimizer-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    #optimizer-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #optimizer-content {
      padding: 15px;
      overflow-y: auto;
      flex: 1;
      font-size: 13px;
    }

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .recommendation-item {
      padding: 10px;
      background: #f7f7f7;
      border-radius: 8px;
      border-left: 3px solid #00d084;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .recommendation-item strong {
      color: #1a1a1a;
      font-size: 13px;
    }

    .price {
      color: #00d084;
      font-weight: 600;
      font-size: 14px;
    }

    .discount {
      background: #fff3cd;
      color: #856404;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    .recommendation-item small {
      color: #666;
      font-size: 11px;
    }

    .total-section {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #00d084;
      font-size: 14px;
    }

    #optimizer-footer {
      padding: 12px;
      background: #f9f9f9;
      display: flex;
      gap: 8px;
      border-top: 1px solid #eee;
    }

    #copy-recommendation,
    #highlight-items {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      background: #00d084;
      color: white;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: background 0.2s;
    }

    #copy-recommendation:hover,
    #highlight-items:hover {
      background: #009070;
    }

    #copy-recommendation:active,
    #highlight-items:active {
      transform: scale(0.98);
    }
  `;
}

// Listen for when the page loads and capture menu data
window.addEventListener('load', () => {
  captureMenuData();
});

// Also try to capture data when DOM changes
const observer = new MutationObserver(() => {
  // Debounce to avoid excessive calls
  clearTimeout(window.captureMenuDataTimeout);
  window.captureMenuDataTimeout = setTimeout(() => {
    captureMenuData();
  }, 2000);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false
});

/**
 * Captures menu data from the page
 */
function captureMenuData() {
  console.log('Attempting to capture menu data...');
  
  // Method A: Try to find menu data in window object
  let menuData = null;
  
  // Check for __TE_initialData__ or similar UberEats globals
  if (window.__TE_initialData__) {
    menuData = extractMenuFromInitialData(window.__TE_initialData__);
  }

  // Method B: Parse script tags with JSON payloads
  if (!menuData) {
    menuData = extractMenuFromScriptTags();
  }

  // Method C: Parse from DOM structure
  if (!menuData) {
    menuData = extractMenuFromDOM();
  }

  if (menuData && menuData.items && menuData.items.length > 0) {
    console.log('Menu data captured:', menuData);
    chrome.runtime.sendMessage(
      {
        type: 'MENU_DATA_CAPTURED',
        data: menuData
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log('Background not ready yet');
        }
      }
    );
  }
}

/**
 * Extracts menu data from __TE_initialData__
 */
function extractMenuFromInitialData(initialData) {
  try {
    // Navigate through nested structure to find items
    const items = [];
    
    // This is a placeholder - actual structure depends on UberEats implementation
    if (initialData && initialData.data) {
      // Try to find menu items in the data structure
      const traverse = (obj) => {
        if (Array.isArray(obj)) {
          obj.forEach(traverse);
        } else if (obj && typeof obj === 'object') {
          if (obj.title && obj.price && (obj.description || obj.prepTime)) {
            items.push({
              name: obj.title,
              price: parseFloat(obj.price) || 0,
              description: obj.description || '',
              prepTime: obj.prepTime || null,
              discount: obj.discount || null
            });
          }
          Object.values(obj).forEach(traverse);
        }
      };
      
      traverse(initialData);
      
      if (items.length > 0) {
        return {
          items: items,
          restaurantName: initialData.restaurantName || 'Unknown',
          minOrder: initialData.minOrder || 0
        };
      }
    }
  } catch (e) {
    console.error('Error extracting from initial data:', e);
  }
  
  return null;
}

/**
 * Extracts menu data from script tags
 */
function extractMenuFromScriptTags() {
  try {
    const scripts = document.querySelectorAll('script');
    
    for (let script of scripts) {
      if (script.textContent && script.textContent.includes('menu') && script.textContent.includes('items')) {
        try {
          // Try to parse as JSON if it looks like it
          const match = script.textContent.match(/\{[\s\S]*\}/);
          if (match) {
            const data = JSON.parse(match[0]);
            const items = extractItemsFromJSON(data);
            if (items.length > 0) {
              return {
                items: items,
                source: 'script_tag'
              };
            }
          }
        } catch (e) {
          // Not valid JSON, continue
        }
      }
    }
  } catch (e) {
    console.error('Error extracting from script tags:', e);
  }
  
  return null;
}

/**
 * Extracts menu data from DOM structure
 */
function extractMenuFromDOM() {
  try {
    const items = [];
    
    // Look for common menu item selectors
    const selectors = [
      '[data-testid*="menu-item"]',
      '[class*="MenuItem"]',
      '[class*="menu-item"]',
      '.item-card',
      '[role="menuitem"]'
    ];

    for (let selector of selectors) {
      const elements = document.querySelectorAll(selector);
      
      if (elements.length > 0) {
        elements.forEach((element) => {
          const name = element.querySelector('[class*="title"], [class*="name"], h3, strong');
          const price = element.querySelector('[class*="price"], [class*="cost"]');
          const description = element.querySelector('[class*="description"], [class*="desc"], p');

          if (name && price) {
            items.push({
              name: name.textContent.trim(),
              price: parseFloat(price.textContent.replace(/[^\d.]/g, '')) || 0,
              description: description ? description.textContent.trim() : '',
              element: element
            });
          }
        });
        
        if (items.length > 0) {
          return {
            items: items,
            source: 'dom_parsing'
          };
        }
      }
    }
  } catch (e) {
    console.error('Error extracting from DOM:', e);
  }
  
  return null;
}

/**
 * Helper to extract items from arbitrary JSON structure
 */
function extractItemsFromJSON(obj) {
  const items = [];
  
  const traverse = (val) => {
    if (Array.isArray(val)) {
      val.forEach(traverse);
    } else if (val && typeof val === 'object') {
      if ((val.name || val.title) && val.price) {
        items.push({
          name: val.name || val.title,
          price: typeof val.price === 'number' ? val.price : parseFloat(val.price) || 0,
          description: val.description || '',
          discount: val.discount || null
        });
      }
      Object.values(val).forEach(traverse);
    }
  };
  
  traverse(obj);
  return items;
}
