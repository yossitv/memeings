// Background Script for Memeings Assistant

// Store selected text
let selectedText = '';

// Initialize context menu
function initContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'generateImage',
      title: 'Generate image with Memeings',
      contexts: ['selection']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generateImage' && info.selectionText) {
    selectedText = info.selectionText.trim();
    
    // Store selected text in Chrome storage
    chrome.storage.local.set({ 'memeings_selected_text': selectedText }, () => {
      console.log('Selected text saved:', selectedText);
    });
    
    // Open popup
    chrome.action.openPopup();
  }
});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Initialize context menu
  if (request.action === 'initContextMenu') {
    initContextMenu();
    sendResponse({ success: true });
  }
  
  // Save selected text
  else if (request.action === 'textSelected') {
    selectedText = request.text;
    
    // Store selected text in Chrome storage
    chrome.storage.local.set({ 'memeings_selected_text': selectedText }, () => {
      console.log('Selected text saved:', selectedText);
    });
    
    sendResponse({ success: true });
  }
  
  // Get selected text
  else if (request.action === 'getSelectedText') {
    sendResponse({ text: selectedText });
  }
  
  return true;
});

// Initialize context menu on install
chrome.runtime.onInstalled.addListener(() => {
  initContextMenu();
  console.log('Memeings Assistant background script initialized');
});
