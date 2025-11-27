# 🚀 Installation Guide - UberEats Order Optimizer

## Download & Install (2 Minutes)

### Step 1: Get the ZIP File
- ✅ File: `ubereats-optimizer.zip` 
- Size: ~37 KB
- Location: Your Downloads folder

### Step 2: Extract the ZIP
1. **Right-click** `ubereats-optimizer.zip`
2. Select **"Extract All..."**
3. Click **"Extract"** (or choose a location)
4. A folder `ubereats-optimizer` will be created

### Step 3: Load into Chrome
1. Open **Google Chrome**
2. Go to: `chrome://extensions/`
3. Toggle **"Developer mode"** ON (top-right)
4. Click **"Load unpacked"**
5. Select the extracted `ubereats-optimizer` folder
6. ✅ **Done!** Extension installed!

### Step 4: Verify Installation
- 🍕 Icon appears in Chrome toolbar (top-right)
- Click it to see the popup
- No errors in console (F12)

---

## 🎯 First Use (2 Minutes)

1. **Go to UberEats**
   - Open https://www.ubereats.com
   - Select any restaurant

2. **Click Extension Icon**
   - Should show menu detected
   - If not, wait 2-3 seconds and refresh

3. **Configure Settings**
   - Set max budget: $50
   - Min items: 1
   - Max items: 10
   - Toggle: "Prioritize Deals"

4. **Get Recommendations**
   - Click **"Optimize Order"**
   - View suggestions
   - See total cost & savings

5. **Use Results**
   - **Copy Items** → Paste elsewhere
   - **Highlight Items** → See on page
   - **New Analysis** → Try different settings

---

## 📦 What's in the ZIP

```
ubereats-optimizer/
├── manifest.json          ← Extension config
├── background.js          ← Service worker
├── content-script.js      ← Page interaction
├── popup.html            ← UI
├── popup.js              ← UI logic
├── optimizer.js          ← Algorithm
├── styles.css            ← Styling
├── START_HERE.md         ← Quick overview
├── QUICKSTART.md         ← 2-minute guide
├── EXTENSION_GUIDE.md    ← Full user guide
├── ARCHITECTURE.md       ← Technical details
├── BUILD_SUMMARY.md      ← Project overview
├── QUICK_REFERENCE.md    ← Dev reference
└── FILE_INDEX.md         ← File details
```

---

## ❓ FAQ

**Q: Where do I extract the ZIP?**
- A: Anywhere! Desktop, Documents, Downloads - doesn't matter
- The extension uses absolute paths, so location is flexible

**Q: Can I move the folder after loading?**
- A: No, keep it in the same place
- Chrome remembers the path
- If you move it, the extension will break
- Solution: Load it again from new location

**Q: What if I see errors?**
- Check: Open `chrome://extensions/`
- Click: UberEats Optimizer
- Check: "Errors" section for messages
- Solution: See troubleshooting below

**Q: How do I uninstall?**
- Go to: `chrome://extensions/`
- Find: UberEats Optimizer
- Click: Trash/Remove icon
- Done!

**Q: Can I share the ZIP with friends?**
- Yes! Just send them this ZIP file
- They follow same steps to install
- No key/license needed

---

## 🐛 Troubleshooting

### Extension icon not showing?
```
1. Reload Chrome (close and reopen)
2. Go to chrome://extensions/
3. Verify extension is enabled (toggle ON)
4. Refresh the page you're on
```

### Menu not detecting?
```
1. Go to ubereats.com
2. Wait 2-3 seconds for page load
3. Refresh page (F5)
4. Check browser console (F12)
5. Click "Retry" in popup
```

### No recommendations showing?
```
1. Increase your budget
2. Lower "Min items" to 1
3. Check console for errors
4. Try different restaurant
```

### Items not highlighting?
```
1. This varies by page layout
2. Use "Copy Items" instead
3. Manually search for items
4. Scroll page to find them
```

---

## 📱 Browser Support

✅ **Chrome** - 90 and newer
✅ **Edge** - 90 and newer  
✅ **Brave** - Works great
✅ **Other Chromium** - Should work

---

## 🔄 Update the Extension

When updates are available:

1. **Download** new `ubereats-optimizer.zip`
2. **Extract** to a new folder (or overwrite)
3. Go to `chrome://extensions/`
4. Find UberEats Optimizer
5. Click the ⚙️ settings icon
6. If moved: Load unpacked → select new folder
7. If same location: Just refresh

---

## 💡 Pro Tips

✨ **Budget Tip**
- Set budget 10-15% below actual budget for safety buffer

✨ **Deals Tip**  
- Enable "Prioritize Deals" to maximize savings

✨ **Speed Tip**
- Multiple restaurants load differently
- First use on a restaurant can take 2-3 seconds
- Subsequent uses are instant

✨ **Night Mode**
- Enable dark mode in settings for comfortable browsing

---

## 🎓 Next Steps

1. **Explore** - Try different restaurants and budgets
2. **Customize** - Adjust settings in popup
3. **Learn** - Read documentation files in ZIP
4. **Extend** - Edit files to add features (see ARCHITECTURE.md)

---

## 📞 Need Help?

Check these in order:

1. **README or START_HERE.md** in the ZIP
2. **QUICKSTART.md** - Quick troubleshooting
3. **EXTENSION_GUIDE.md** - Detailed user guide
4. **Browser console** (F12) - Check for errors
5. **chrome://extensions/** - Check extension status

---

## ✅ You're Ready!

Everything is set up. Now:

1. Download the ZIP ✅
2. Extract it ✅
3. Load into Chrome ✅
4. Start optimizing UberEats orders! 🍕🚀

---

**Happy saving! 💰**

Version 1.0.0 | November 27, 2025
