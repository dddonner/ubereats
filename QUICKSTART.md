# Quick Start Guide - UberEats Order Optimizer Extension

## ⚡ Installation (2 minutes)

### Step 1: Open Chrome Developer Mode
1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Toggle **Developer mode** ON (top-right corner)

### Step 2: Load the Extension
1. Click **Load unpacked**
2. Navigate to this folder (where manifest.json is)
3. Select the folder and click "Open"
4. ✅ Extension installed! Check your Chrome toolbar

## 🚀 First Use

### On UberEats Page:
1. Go to any UberEats restaurant
2. Wait for menu to load (2-3 seconds)
3. Click the **🍕 UberEats Optimizer** extension icon in toolbar
4. Popup should show menu data

### Get Recommendations:
1. Set your **Max Budget** (e.g., $50)
2. Adjust **Min/Max Items** if needed
3. Toggle **Prioritize Deals** ON to favor discounts
4. Click **Optimize Order** button
5. See recommendations with prices and savings!

### Use Recommendations:
- **Copy Items** → Paste to notes or clipboard
- **Highlight Items** → Items highlighted on page
- **New Analysis** → Try different settings

## 🎯 Quick Tips

- **Budget Tip**: Set budget 10-15% below your actual limit for buffer
- **Deals First**: Check "Prioritize Deals" for maximum savings
- **Multiple Analysis**: Try different budgets to explore options
- **Dark Mode**: Click ⚙️ → Enable for night browsing

## 📋 What Gets Captured

The extension automatically captures:
- ✅ Item names
- ✅ Prices
- ✅ Discounts/deals
- ✅ Ratings (if available)
- ✅ Restaurant name

## ❓ Troubleshooting

**Extension not showing?**
- Reload the page (F5)
- Wait 2-3 seconds for menu to load
- Ensure you're on ubereats.com

**No recommendations?**
- Increase your budget
- Check browser console (F12) for errors
- Try "Retry" button

**Items not highlighting?**
- Page structure varies by region
- Use "Copy Items" instead
- Try scrolling manually

## 📂 Files in This Extension

```
manifest.json         - Extension configuration
background.js         - Background processor
content-script.js     - Page interaction
popup.html/js         - User interface
optimizer.js          - Algorithm
styles.css            - Styling
```

## 🔒 Privacy

- ✅ No data sent to servers
- ✅ No tracking
- ✅ No ads
- ✅ Works offline
- ✅ Data cleared on tab close

## 📱 Works On

- Chrome 90+
- Edge 90+
- Brave Browser
- Any Chromium browser

---

**Ready to save on UberEats? Let's optimize! 🚀**
