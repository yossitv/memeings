// Content Script for Memeings Assistant
// This script runs in the context of web pages

// Listen for text selection events
document.addEventListener('mouseup', function() {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText) {
    // Send selected text to the extension
    chrome.runtime.sendMessage({
      action: 'textSelected',
      text: selectedText
    });
  }
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ text: selectedText });
  }
  return true;
});

// Add context menu integration
chrome.runtime.sendMessage({ action: 'initContextMenu' });

// Log that content script is loaded
console.log('Memeings Assistant content script loaded');
