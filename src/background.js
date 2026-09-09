/**
 * Tab URL Copier - Background Service Worker
 */
importScripts('tabUtils.js');

const PARENT_MENU_ID = 'tab-url-copier-root';

const CONTEXT_MENU_ITEMS = [
  { id: 'all-windows', title: '🌐 All Windows' },
  { id: 'current-window', title: '🪟 Current Window' },
  { id: 'sep-1', type: 'separator' },
  { id: 'left-excl', title: '⬅️ Left of Active (Excl. Active)' },
  { id: 'left-incl', title: '⏪ Left of Active (Incl. Active)' },
  { id: 'sep-2', type: 'separator' },
  { id: 'right-excl', title: '➡️ Right of Active (Excl. Active)' },
  { id: 'right-incl', title: '⏩ Right of Active (Incl. Active)' }
];

/**
 * Register context menus
 */
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: PARENT_MENU_ID,
      title: 'Copy Tab URLs',
      contexts: ['all']
    });

    for (const item of CONTEXT_MENU_ITEMS) {
      if (item.type === 'separator') {
        chrome.contextMenus.create({
          id: item.id,
          parentId: PARENT_MENU_ID,
          type: 'separator',
          contexts: ['all']
        });
      } else {
        chrome.contextMenus.create({
          id: item.id,
          parentId: PARENT_MENU_ID,
          title: item.title,
          contexts: ['all']
        });
      }
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  setupContextMenus();
});

/**
 * Ensure offscreen document is available for clipboard operations
 */
async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('src/offscreen.html');

  if ('getContexts' in chrome.runtime) {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl]
    });
    if (existingContexts.length > 0) {
      return;
    }
  }

  await chrome.offscreen.createDocument({
    url: 'src/offscreen.html',
    reasons: ['CLIPBOARD'],
    justification: 'Write tab URLs to clipboard from context menu'
  });
}

/**
 * Copy text to clipboard using offscreen document
 * @param {string} text
 */
async function copyViaOffscreen(text) {
  await ensureOffscreenDocument();
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        target: 'offscreen',
        type: 'copy-to-clipboard',
        data: text
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve();
        } else {
          reject(new Error(response?.error || 'Failed to copy to clipboard'));
        }
      }
    );
  });
}

/**
 * Flash badge on action icon
 * @param {string} text
 * @param {string} color
 */
function flashBadge(text, color = '#22c55e') {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });

  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
  }, 2500);
}

/**
 * Listen for context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const scope = info.menuItemId;
  if (!scope || scope.startsWith('sep-') || scope === PARENT_MENU_ID) {
    return;
  }

  try {
    const tabs = await self.TabUtils.getTabsByScope(scope, tab);

    if (!tabs || tabs.length === 0) {
      flashBadge('0', '#f59e0b');
      return;
    }

    const formattedUrls = self.TabUtils.formatUrls(tabs);

    if (!formattedUrls) {
      flashBadge('0', '#f59e0b');
      return;
    }

    await copyViaOffscreen(formattedUrls);
    flashBadge(`${tabs.length}`, '#22c55e');
  } catch (err) {
    console.error('Error handling context menu copy:', err);
    flashBadge('!', '#ef4444');
  }
});
