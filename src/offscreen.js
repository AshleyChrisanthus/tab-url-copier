/**
 * Tab URL Copier - Offscreen script for background clipboard access
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'offscreen' && message.type === 'copy-to-clipboard') {
    copyToClipboard(message.data)
      .then(() => sendResponse({ success: true }))
      .catch((err) => {
        console.error('Offscreen copy failed:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep channel open for async response
  }
});

async function copyToClipboard(text) {
  if (typeof text !== 'string') {
    throw new TypeError(`Value provided must be a string, got ${typeof text}`);
  }

  // Use DOM textarea execCommand first in offscreen as it doesn't require document focus
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (success) {
      return;
    }
  } catch (err) {
    console.warn('execCommand copy failed, falling back to navigator.clipboard:', err);
  }

  // Fallback to Clipboard API
  await navigator.clipboard.writeText(text);
}
