const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Evaluate tabUtils in a sandbox environment simulating the browser
const tabUtilsCode = fs.readFileSync(path.join(__dirname, '../src/tabUtils.js'), 'utf8');

function createEnvironment(mockTabs, activeTab) {
  const env = {
    self: {},
    chrome: {
      tabs: {
        async query(filter) {
          if (filter.windowId !== undefined) {
            return mockTabs.filter(t => t.windowId === filter.windowId);
          }
          if (filter.currentWindow) {
            if (filter.active) {
              return [activeTab];
            }
            return mockTabs.filter(t => t.windowId === activeTab.windowId);
          }
          // All windows
          return mockTabs;
        }
      }
    }
  };

  const fn = new Function('self', 'chrome', `${tabUtilsCode}; return self.TabUtils;`);
  return fn(env.self, env.chrome);
}

// Sample mock data: 2 windows, 5 tabs total
// Window 1: Tab 0 (idx 0), Tab 1 (idx 1 - Active), Tab 2 (idx 2), Tab 3 (idx 3)
// Window 2: Tab 4 (idx 0)
const mockTabs = [
  { id: 10, windowId: 1, index: 0, url: 'https://example.com/tab0' },
  { id: 11, windowId: 1, index: 1, url: 'https://example.com/tab1' }, // Active
  { id: 12, windowId: 1, index: 2, url: 'https://example.com/tab2' },
  { id: 13, windowId: 1, index: 3, url: 'https://example.com/tab3' },
  { id: 20, windowId: 2, index: 0, url: 'https://example.com/other-window' }
];
const activeTab = mockTabs[1]; // tab1 at index 1

async function runTests() {
  const TabUtils = createEnvironment(mockTabs, activeTab);

  console.log('Testing: all-windows');
  const allTabs = await TabUtils.getTabsByScope('all-windows');
  assert.equal(allTabs.length, 5, 'Should return all 5 tabs across all windows');

  console.log('Testing: current-window');
  const currentWindowTabs = await TabUtils.getTabsByScope('current-window');
  assert.equal(currentWindowTabs.length, 4, 'Should return 4 tabs in window 1');

  console.log('Testing: right-excl (excluding active)');
  const rightExclTabs = await TabUtils.getTabsByScope('right-excl', activeTab);
  assert.equal(rightExclTabs.length, 2, 'Should return 2 tabs to the right (tab2, tab3)');
  assert.deepEqual(rightExclTabs.map(t => t.id), [12, 13]);

  console.log('Testing: right-incl (including active)');
  const rightInclTabs = await TabUtils.getTabsByScope('right-incl', activeTab);
  assert.equal(rightInclTabs.length, 3, 'Should return 3 tabs to the right including active');
  assert.deepEqual(rightInclTabs.map(t => t.id), [11, 12, 13]);

  console.log('Testing: left-excl (excluding active)');
  const leftExclTabs = await TabUtils.getTabsByScope('left-excl', activeTab);
  assert.equal(leftExclTabs.length, 1, 'Should return 1 tab to the left (tab0)');
  assert.deepEqual(leftExclTabs.map(t => t.id), [10]);

  console.log('Testing: left-incl (including active)');
  const leftInclTabs = await TabUtils.getTabsByScope('left-incl', activeTab);
  assert.equal(leftInclTabs.length, 2, 'Should return 2 tabs to the left including active');
  assert.deepEqual(leftInclTabs.map(t => t.id), [10, 11]);

  console.log('Testing: formatUrls (newline separation)');
  const formatted = TabUtils.formatUrls(rightInclTabs);
  assert.equal(
    formatted,
    'https://example.com/tab1\nhttps://example.com/tab2\nhttps://example.com/tab3',
    'URLs should be separated by newline'
  );

  console.log('Testing: pendingUrl fallback when tab is still loading');
  const pendingTabs = [{ url: '', pendingUrl: 'https://example.com/loading' }];
  const formattedPending = TabUtils.formatUrls(pendingTabs);
  assert.equal(formattedPending, 'https://example.com/loading');

  console.log('All TabUtils tests passed successfully! ✅');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
