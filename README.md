# Tab URL Copier

A lightweight, powerful Manifest V3 browser extension to capture URLs of open browser tabs across customizable scopes and copy them directly to your clipboard, formatted one link per line.

## ✨ Features

- **6 Flexible Tab Scopes**:
  1. 🌐 **All Windows**: Copy all tabs across all open windows (including background & minimized windows).
  2. 🪟 **Current Window**: Copy all tabs in the currently active window.
  3. ➡️ **Right (Excl. Active)**: Copy tabs to the right of the active tab.
  4. ⏩ **Right (Incl. Active)**: Copy the active tab and all tabs to its right.
  5. ⬅️ **Left (Excl. Active)**: Copy tabs to the left of the active tab.
  6. ⏪ **Left (Incl. Active)**: Copy the active tab and all tabs to its left.
- **Dual Engagement Modes**:
  - **Popup Menu**: Click the extension icon to pick any scope with instant copy count feedback.
  - **Right-Click Context Menu**: Right-click anywhere on any webpage to copy without opening the popup.
- **Clean Output**: Formatted with standard line breaks (`\n`), ready to paste into text files, spreadsheets, emails, or chat.
- **Privacy First**: Completely local, zero tracking, no remote servers, no data leaves your browser.

## 🚀 Installation

### In Chrome, Brave, Edge, Opera (Chromium-based browsers):
1. Clone or download this repository to your local machine.
2. Open your browser and navigate to the extensions page:
   - Chrome / Brave: `chrome://extensions`
   - Edge: `edge://extensions`
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.
6. (Optional) Pin the extension icon to your toolbar for quick access!

## 📖 Usage

### Option 1: Popup Menu
1. Click the **Tab URL Copier** icon in the browser toolbar.
2. Click any of the 6 scope buttons.
3. A confirmation banner will indicate how many URLs were copied.
4. Paste (`Ctrl+V` or `Cmd+V`) wherever you need them.

### Option 2: Right-Click Context Menu
1. Right-click anywhere on any webpage.
2. Hover over **Copy Tab URLs**.
3. Select your desired scope.
4. Paste anywhere.

## 📄 License
MIT License
