# Technical Architecture - UberEats Order Optimizer

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension System                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ UberEats    │      │  Content      │                    │
│  │ Page        │◄────►│  Script       │                    │
│  │             │      │  (content-    │                    │
│  │             │      │   script.js)  │                    │
│  └──────────────┘      └──────────────┘                    │
│                              │                              │
│                              │ chrome.runtime.              │
│                              │ sendMessage()               │
│                              ▼                              │
│                      ┌──────────────┐                      │
│                      │ Service      │                      │
│                      │ Worker       │                      │
│                      │ (background  │                      │
│                      │  .js)        │                      │
│                      └──────────────┘                      │
│                              │                              │
│        ┌─────────────────────┼─────────────────────┐       │
│        ▼                     ▼                     ▼       │
│   ┌─────────┐        ┌──────────────┐      ┌────────┐    │
│   │Optimizer│        │Chrome Storage│      │ Popup  │    │
│   │(optimizer.js)    │ API          │      │ UI     │    │
│   └─────────┘        └──────────────┘      └────────┘    │
│        │                                        ▲         │
│        └────────────────────────────────────────┘         │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. manifest.json (Configuration)
**Manifest V3 Format**
- Defines extension metadata
- Declares permissions
- Registers service worker
- Configures content scripts
- Defines popup UI

**Key Permissions:**
- `activeTab`: Access current tab
- `scripting`: Inject scripts
- `storage`: Local data persistence
- Host permissions: `https://*.ubereats.com/*`

### 2. content-script.js (Page Interaction)
**Runs in UberEats page context**

**Menu Capture Pipeline:**
```javascript
captureMenuData()
  ├─ Method A: Window Variables
  │  └─ window.__TE_initialData__
  │
  ├─ Method B: Script Tags
  │  └─ Parse JSON from <script> tags
  │
  └─ Method C: DOM Parsing
     └─ Query menu item selectors
```

**Data Extraction Structure:**
```javascript
{
  items: [
    {
      name: "Burger",
      price: 12.99,
      discount: 10,
      description: "...",
      rating: 4.5,
      category: "Main Course"
    },
    // ... more items
  ],
  restaurantName: "The Burger Place",
  minOrder: 15.00,
  source: "dom_parsing"
}
```

**UI Overlay Functions:**
- Creates floating widget (fixed position)
- Injects CSS styles
- Displays recommendations
- Handles highlighting and copying

### 3. background.js (Service Worker)
**Runs continuously in background**

**Message Handler:**
```javascript
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    switch(request.type) {
      case 'MENU_DATA_CAPTURED':
        handleMenuDataCapture()
      case 'OPTIMIZE_ORDER':
        handleOrderOptimization()
      case 'GET_STORED_MENU':
        getStoredMenuData()
      // ...
    }
  }
)
```

**Data Storage:**
- In-memory cache: `capturedMenuData`
- Persistent storage: `chrome.storage.local`
- Auto-cleanup on tab close

### 4. optimizer.js (Core Algorithm)
**Optimization Strategies**

**Strategy 1: Greedy Algorithm (Default)**
```
For each item:
  Calculate score based on:
    - Price (lower = higher)
    - Discount (higher = higher)
    - Rating (higher = higher)
  
Select items in score order until budget exhausted
Time: O(n log n) - Very fast
Space: O(n)
```

**Strategy 2: Dynamic Programming (Advanced)**
```
Bounded knapsack problem:
  dp[budget] = max_score(items, budget)
  
For each item and budget value:
  dp[j] = max(dp[j], dp[j-cost] + score)

Optimal but slower for large menus
Time: O(n * budget) - Can be slow
Space: O(budget)
```

**Scoring Formula:**
```javascript
score = 100
score += discount * 2              // Discount bonus
score += max(0, 50 - price)        // Price efficiency
score += (rating - 4) * 10         // Rating bonus
score += category_bonus            // Category preference
effective_price = price * (1 - discount/100)
```

**Input Structure:**
```javascript
items: Array<{
  name: string,
  price: number,
  discount?: number,
  rating?: number,
  category?: string
}>

preferences: {
  maxBudget: number,
  minItems: number,
  maxItems: number,
  prioritizeDeals: boolean,
  dietaryRestrictions?: string[],
  preferredCategories?: string[]
}
```

**Output Structure:**
```javascript
{
  suggestions: Array<{
    name: string,
    price: number,
    effectivePrice: number,
    discount?: number,
    reason: string,
    category: string
  }>,
  totalCost: number,
  originalCost: number,
  savings: number,
  savingsPercent: number,
  itemCount: number
}
```

### 5. popup.html/js (User Interface)
**UI Structure:**

```
┌─────────────────────────┐
│     Header (Green)      │ ← Settings btn
├─────────────────────────┤
│ Menu Info               │
├─────────────────────────┤
│ Preferences Panel       │ ← Budget, items, etc.
│  [Optimize Button]      │
├─────────────────────────┤
│ Recommendations Panel   │
│ (appears after click)   │
├─────────────────────────┤
│ Footer                  │
└─────────────────────────┘
```

**State Management:**
```javascript
// Global state in popup
let currentMenuData = null
let currentRecommendations = null

// Preferences persisted to storage
chrome.storage.local.set({
  maxBudget: 50,
  minItems: 1,
  maxItems: 10,
  prioritizeDeals: true
})
```

**Communication Flow:**
```
popup.js
  │
  ├─→ content-script.js: "Get menu data"
  │   ▼
  ├─← content-script.js: Returns menu
  │
  └─→ background.js: "Optimize order"
      ▼
  ← background.js: Returns recommendations
```

### 6. styles.css (Styling)
**Design System:**

```
Colors:
- Primary: #00d084 (Uber Green)
- Secondary: #009070 (Dark Green)
- Background: #ffffff (Light)
- Dark mode: #1e1e1e (Dark)
- Error: #ff4757 (Red)
- Success: #2ed573 (Green)

Typography:
- Font: System fonts (-apple-system, Segoe UI)
- Header: 18px, 600 weight
- Body: 12-13px
- Small: 11px

Components:
- Buttons: 10px padding, 6px border-radius
- Cards: 12px padding, 8px border-radius
- Shadows: 0 10px 40px rgba(0,0,0,0.15)
```

## Data Flow Sequences

### Sequence 1: Menu Capture
```
User visits UberEats page
        ↓
content-script loads
        ↓
DOM ready event fires
        ↓
captureMenuData() executes
        ↓
Tries 3 methods to extract menu
        ↓
Sends MENU_DATA_CAPTURED message
        ↓
background.js receives
        ↓
Stores in memory + chrome.storage.local
        ↓
Content script creates overlay with data
```

### Sequence 2: Optimization Request
```
User clicks "Optimize Order"
        ↓
popup.js collects preferences
        ↓
Sends OPTIMIZE_ORDER to background
        ↓
background.js receives
        ↓
Imports and runs optimizer.js
        ↓
Calculates recommendations
        ↓
Sends back to popup
        ↓
popup.js displays results
        ↓
User can copy/highlight/save
```

### Sequence 3: Item Highlighting
```
User clicks "Highlight Items"
        ↓
popup.js sends HIGHLIGHT_ITEMS
        ↓
content-script receives items
        ↓
Queries page for matching items
        ↓
Applies CSS: border + background
        ↓
Items highlighted on page
```

## Performance Considerations

### Optimization Algorithm
- **Small menu (< 50 items)**: Greedy O(n log n) ~1ms
- **Large menu (100+ items)**: Consider DP ~10-50ms
- **Current default**: Greedy (instant response)

### Memory Usage
- Menu data: ~50-200KB (typical)
- Overlay CSS: ~10KB inline
- Recommendations: ~5-20KB
- **Total**: Usually < 1MB

### Network Impact
- **Zero network calls** from extension
- No external API usage
- All processing local

### Page Performance
- Content script: Minimal DOM queries
- Mutation observer debounced (2s intervals)
- Non-blocking overlay injection
- No page slowdown

## Extension Communication Protocol

### Message Types

**MENU_DATA_CAPTURED**
```javascript
{
  type: 'MENU_DATA_CAPTURED',
  data: { items: [...], restaurantName: '...' }
}
// Sent from: content-script → background
```

**OPTIMIZE_ORDER**
```javascript
{
  type: 'OPTIMIZE_ORDER',
  data: { items: [...], ...menuData },
  preferences: { maxBudget: 50, ... }
}
// Sent from: popup/content-script → background
// Response: { success: true, recommendations: [...], totalCost: 45.50 }
```

**HIGHLIGHT_ITEMS**
```javascript
{
  type: 'HIGHLIGHT_ITEMS',
  items: [{ name: 'Burger', ... }, ...]
}
// Sent from: popup → content-script
```

**GET_MENU_DATA**
```javascript
{ type: 'GET_MENU_DATA' }
// Sent from: popup → content-script
// Response: { data: { items: [...], ... } }
```

## Error Handling

### Content Script Failures
- Fallback between capture methods
- Return null if no data found
- Show user-friendly error

### Optimization Errors
- Validate input data
- Try-catch blocks in algorithm
- Return default recommendations

### Storage Errors
- Graceful fallback to in-memory
- No persistence if storage fails
- Clear on extension reload

## Security Considerations

### XSS Prevention
- No `innerHTML` with user input
- Only use `textContent` for display
- CSS-safe highlighting only

### Storage Security
- No sensitive data stored
- No authentication tokens
- No user personal info

### Permissions
- Minimal permissions requested
- Only what's needed for function
- No background network access

## Extensibility Points

### Adding Features
1. **New capture methods**: Add to `content-script.js`
2. **New algorithms**: Add to `optimizer.js`
3. **UI changes**: Update `popup.html/js`
4. **Styling**: Modify `styles.css`

### Integration Hooks
- `chrome.runtime.sendMessage()` - Safe messaging
- `chrome.storage.local` - Data persistence
- `chrome.tabs` - Tab management

---

**Architecture Version**: 1.0.0
**Last Updated**: November 2025
