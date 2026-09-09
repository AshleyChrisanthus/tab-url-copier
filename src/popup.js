/**
 * Tab URL Copier - Popup script
 */
document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');
  const buttons = document.querySelectorAll('button[data-scope]');
  let statusTimeout = null;

  /**
   * Show feedback message in status banner
   * @param {string} message
   * @param {'success' | 'warning'} type
   */
  function showStatus(message, type = 'success') {
    if (statusTimeout) {
      clearTimeout(statusTimeout);
    }
    statusEl.textContent = message;
    statusEl.className = `status-banner ${type}`;

    statusTimeout = setTimeout(() => {
      statusEl.className = 'status-banner';
      statusEl.textContent = '';
    }, 3000);
  }

  /**
   * Handle scope button click
   * @param {string} scope
   */
  async function handleCopy(scope) {
    try {
      const tabs = await window.TabUtils.getTabsByScope(scope);

      if (!tabs || tabs.length === 0) {
        showStatus('⚠️ No tabs found in this scope', 'warning');
        return;
      }

      const formattedUrls = window.TabUtils.formatUrls(tabs);

      if (!formattedUrls) {
        showStatus('⚠️ No valid URLs found to copy', 'warning');
        return;
      }

      await navigator.clipboard.writeText(formattedUrls);

      const tabWord = tabs.length === 1 ? 'tab' : 'tabs';
      showStatus(`✓ Copied ${tabs.length} ${tabWord} to clipboard!`, 'success');
    } catch (err) {
      console.error('Failed to copy tabs:', err);
      showStatus('❌ Failed to copy to clipboard', 'warning');
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const scope = btn.getAttribute('data-scope');
      if (scope) {
        handleCopy(scope);
      }
    });
  });
});
