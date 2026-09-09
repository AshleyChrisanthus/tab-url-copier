/**
 * Tab URL Copier - Utility functions for tab querying and URL formatting
 */
(function (root) {
  const TabUtils = {
    /**
     * Query tabs based on the selected scope.
     * @param {string} scope - One of: 'all-windows', 'current-window', 'right-excl', 'right-incl', 'left-excl', 'left-incl'
     * @param {chrome.tabs.Tab} [activeTab] - Optional active tab reference (useful for context menu clicks)
     * @returns {Promise<chrome.tabs.Tab[]>}
     */
    async getTabsByScope(scope, activeTab = null) {
      if (scope === 'all-windows') {
        return await chrome.tabs.query({});
      }

      if (scope === 'current-window') {
        return await chrome.tabs.query({ currentWindow: true });
      }

      // Directional scopes require reference to the active tab
      if (!activeTab) {
        const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
        activeTab = activeTabs[0];
      }

      if (!activeTab) {
        return [];
      }

      const windowTabs = await chrome.tabs.query({ windowId: activeTab.windowId });
      windowTabs.sort((a, b) => a.index - b.index);

      switch (scope) {
        case 'right-excl':
          return windowTabs.filter(t => t.index > activeTab.index);
        case 'right-incl':
          return windowTabs.filter(t => t.index >= activeTab.index);
        case 'left-excl':
          return windowTabs.filter(t => t.index < activeTab.index);
        case 'left-incl':
          return windowTabs.filter(t => t.index <= activeTab.index);
        default:
          return [];
      }
    },

    /**
     * Formats tabs into a newline-separated string of URLs.
     * @param {chrome.tabs.Tab[]} tabs
     * @returns {string}
     */
    formatUrls(tabs) {
      return tabs
        .map(t => t.url || t.pendingUrl || '')
        .filter(url => url.length > 0)
        .join('\n');
    }
  };

  root.TabUtils = TabUtils;
})(typeof self !== 'undefined' ? self : this);
