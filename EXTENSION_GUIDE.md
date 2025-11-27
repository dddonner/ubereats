# UberEats Order Optimizer Chrome Extension

A smart Chrome extension that analyzes UberEats menus and suggests optimal orders based on your budget, preferences, and available discounts.

## Features

✨ **Smart Optimization**
- Analyzes menu items based on price, discounts, and ratings
- Suggests the best combination of items within your budget
- Calculates total cost and potential savings

🎯 **Budget Control**
- Set maximum budget for your order
- Configure minimum and maximum number of items
- Prioritize discounted items

💰 **Savings Tracking**
- See exact price breakdown for each item
- Track total savings from discounts
- View original vs. effective prices

🎨 **User-Friendly Interface**
- Clean, intuitive popup UI
- Floating overlay on UberEats pages
- Dark mode support
- Copy recommendations to clipboard
- Highlight recommended items on the page

🔍 **Smart Menu Capture**
- Multiple methods to capture menu data
- Intercepts network requests
- Parses DOM structure
- Extracts from JavaScript variables

## Installation

### 1. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the extension folder (where manifest.json is located)
5. The extension should appear in your extensions list

### 2. Verify Installation

- Look for the UberEats Optimizer icon in your Chrome toolbar
- Visit [UberEats](https://www.ubereats.com) to test
- Click the extension icon to open the popup

## Usage

### Basic Workflow

1. **Open UberEats**
   - Navigate to any UberEats restaurant page
   - The extension will automatically detect the menu

2. **Configure Preferences**
   - In the popup, set your max budget
   - Adjust min/max items as needed
   - Check "Prioritize Deals" for discount-focused recommendations

3. **Get Recommendations**
   - Click the **Optimize Order** button
   - View suggestions with detailed information
   - See total cost and potential savings

4. **Take Action**
   - Copy recommendations to clipboard
   - Click **Highlight Items** to see items on the page
   - Add highlighted items to your cart manually

### Popup UI

The extension popup provides:

- **Menu Info**: Restaurant name and total items available
- **Preferences Panel**: Budget and item count settings
- **Recommendations**: Suggested items with prices and discounts
- **Summary**: Total cost and savings calculation
- **Quick Actions**: Copy items, highlight on page, new analysis

### Settings

Access settings by clicking the ⚙️ icon:

- **Dark Mode**: Toggle dark theme
- **Auto-Optimize**: Automatically optimize when menu loads
- **Notifications**: Enable/disable popup notifications
- **Clear Data**: Remove all stored menu data

## How It Works

### Menu Data Capture

The extension uses multiple methods to capture menu data:

1. **Window Variables** - Reads `window.__TE_initialData__` and similar globals
2. **Script Tags** - Parses JSON from script tags containing menu data
3. **DOM Parsing** - Analyzes page structure to extract item information

### Optimization Algorithm

The algorithm uses a scoring system considering:

- **Item Price**: Lower prices = higher score
- **Discounts**: Bonus points for discounted items
- **Ratings**: Higher-rated items get priority
- **Budget Constraint**: Respects maximum spending limit
- **Item Count**: Meets minimum and maximum requirements

The algorithm then uses a knapsack-style selection to maximize value within your budget.

## File Structure

```
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker for background tasks
├── content-script.js      # Runs on UberEats pages
├── popup.html            # Popup UI
├── popup.js              # Popup logic and interactions
├── optimizer.js          # Order optimization algorithm
├── styles.css            # UI styling
└── EXTENSION_GUIDE.md    # This file
```

### Key Components

#### manifest.json
- Defines extension metadata
- Specifies permissions and host permissions
- Registers service worker and content scripts
- Configures popup and UI

#### background.js
- Service worker that runs continuously
- Handles messages from content scripts
- Manages menu data storage
- Performs order optimization

#### content-script.js
- Injects into UberEats pages
- Captures menu data from the page
- Creates floating overlay widget
- Communicates with background script

#### popup.html/js
- User-friendly popup interface
- Handles preference management
- Displays recommendations
- Manages settings

#### optimizer.js
- Core optimization algorithm
- Multiple strategies (greedy, dynamic programming)
- Score calculation for items
- Budget-constrained item selection

#### styles.css
- Modern, responsive UI design
- Dark mode support
- Smooth animations and transitions

## Advanced Features

### Custom Preferences

You can extend the preferences object in `popup.js`:

```javascript
const preferences = {
  maxBudget: 50,
  minItems: 1,
  maxItems: 10,
  prioritizeDeals: true,
  dietaryRestrictions: [],          // Add dietary filters
  preferredCategories: [],           // Prioritize certain categories
  // Custom weights for algorithm
};
```

### Optimization Strategies

The `optimizer.js` includes multiple strategies:

1. **Greedy Algorithm** (default): Fast, good for small menus
2. **Dynamic Programming**: Optimal for larger menus
3. **Category-Based**: Optimize per category separately

### Extending the Extension

**Add new features:**

1. Modify `content-script.js` to capture additional data
2. Add new optimization logic to `optimizer.js`
3. Update popup UI in `popup.html/js`
4. Add CSS styling to `styles.css`

**Example: Add dietary restrictions UI**

```html
<div class="form-group">
  <label for="dietary">Dietary Restrictions</label>
  <select id="dietary" multiple>
    <option>Vegetarian</option>
    <option>Vegan</option>
    <option>Gluten-Free</option>
  </select>
</div>
```

## Troubleshooting

### Extension Not Detecting Menu

1. Make sure you're on an UberEats restaurant page
2. Wait 2-3 seconds for the page to fully load
3. Refresh the page
4. Check browser console (F12) for errors

### Recommendations Not Showing

1. Ensure menu data was captured (check popup status)
2. Verify your budget allows at least one item
3. Try adjusting budget and item count settings
4. Click "Retry" to re-capture menu data

### Items Not Highlighting

1. The highlighting depends on page structure
2. Try manually scrolling to find highlighted items
3. UberEats page layout may vary by region
4. Use "Copy Items" as an alternative

### Permission Errors

1. Ensure extension is enabled in Chrome
2. Check that UberEats is in host permissions
3. Reload the extension: Go to `chrome://extensions/` and toggle off/on

## Performance Notes

- Menu capture is optimized to minimize page impact
- Optimization algorithm runs instantly for most menus
- Floating widget has minimal performance footprint
- All processing happens locally (no server calls)

## Privacy

- **Local Processing**: All data stays on your device
- **No External Calls**: No data sent to external servers
- **Menu Data**: Stored temporarily and cleared when tab closes
- **Settings**: Stored in Chrome's local storage only

## Browser Compatibility

- **Chrome**: 90+ (Manifest V3)
- **Edge**: 90+ (Chromium-based)
- **Brave**: Compatible
- **Other Chromium browsers**: Should work

## Limitations

- Only works on ubereats.com domains
- Menu structure varies by region (capturing may need adjustments)
- Some restaurants may have dynamic/lazy-loaded menus
- Highlighting depends on page's HTML structure

## Future Enhancements

Planned features:

- [ ] Export recommendations as image
- [ ] Price tracking over time
- [ ] Restaurant comparison
- [ ] Favorite menu items
- [ ] Sync across devices
- [ ] Historical order analysis
- [ ] Integration with loyalty programs
- [ ] ML-based preference learning

## Support & Contribution

For issues or improvements:

1. Check the troubleshooting section
2. Review browser console (F12) for errors
3. Try the "Retry" or "Refresh" options
4. Clear extension data and reload

## License

This extension is provided as-is for personal use.

## Disclaimer

- This extension is not affiliated with Uber/UberEats
- Use responsibly and respect UberEats terms of service
- Menu data may not always be accurate
- Always verify prices before ordering

---

**Happy optimizing! 🍕🚀**

Version 1.0.0 | Last Updated: November 2025
