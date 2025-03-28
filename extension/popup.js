// Popup Script for Memeings Assistant

// DOM Elements
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const notLoggedIn = document.getElementById('not-logged-in');
const loggedInContent = document.getElementById('logged-in-content');
const selectedTextElement = document.getElementById('selectedText');
const generateButton = document.getElementById('generateButton');
const loading = document.getElementById('loading');
const resultSection = document.getElementById('result-section');
const resultImage = document.getElementById('resultImage');
const copyButton = document.getElementById('copyButton');
const downloadButton = document.getElementById('downloadButton');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('errorMessage');

// Authentication state
let isAuthenticated = false;
let currentUser = null;

// Selected text
let selectedText = '';

/**
 * Initialize the popup
 */
async function initPopup() {
  try {
    // Check authentication state
    await checkAuthState();
    
    // Get selected text
    await getSelectedText();
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Popup initialization error:', error);
    showError('Failed to initialize: ' + error.message);
  }
}

/**
 * Check authentication state
 */
async function checkAuthState() {
  try {
    // Get authentication state
    let authState;
    
    if (window.MemeingsAuth && window.MemeingsAuth.getAuthState) {
      authState = await window.MemeingsAuth.getAuthState();
    } else {
      // Fallback to direct storage access
      authState = await new Promise((resolve) => {
        chrome.storage.local.get([window.MemeingsConfig.AUTH_TOKEN_KEY, window.MemeingsConfig.USER_INFO_KEY], (result) => {
          if (result[window.MemeingsConfig.AUTH_TOKEN_KEY]) {
            resolve({
              isAuthenticated: true,
              token: result[window.MemeingsConfig.AUTH_TOKEN_KEY],
              user: result[window.MemeingsConfig.USER_INFO_KEY]
            });
          } else {
            resolve({
              isAuthenticated: false,
              token: null,
              user: null
            });
          }
        });
      });
    }
    
    // Update UI based on authentication state
    isAuthenticated = authState.isAuthenticated;
    currentUser = authState.user;
    
    if (isAuthenticated && currentUser) {
      // User is authenticated
      loginButton.style.display = 'none';
      userInfo.style.display = 'flex';
      notLoggedIn.style.display = 'none';
      loggedInContent.style.display = 'block';
      
      // Set user info
      userName.textContent = currentUser.displayName || currentUser.email || 'User';
      if (currentUser.photoURL) {
        userAvatar.src = currentUser.photoURL;
        userAvatar.style.display = 'block';
      } else {
        userAvatar.style.display = 'none';
      }
    } else {
      // User is not authenticated
      loginButton.style.display = 'block';
      userInfo.style.display = 'none';
      notLoggedIn.style.display = 'block';
      loggedInContent.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
    showError('Authentication error: ' + error.message);
  }
}

/**
 * Get selected text from storage or content script
 */
async function getSelectedText() {
  try {
    // First try to get from storage
    const storageResult = await new Promise((resolve) => {
      chrome.storage.local.get(['memeings_selected_text'], (result) => {
        resolve(result.memeings_selected_text || '');
      });
    });
    
    if (storageResult) {
      selectedText = storageResult;
      selectedTextElement.textContent = selectedText;
      generateButton.disabled = !selectedText;
      return;
    }
    
    // Then try to get from background script
    chrome.runtime.sendMessage({ action: 'getSelectedText' }, (response) => {
      if (response && response.text) {
        selectedText = response.text;
        selectedTextElement.textContent = selectedText;
        generateButton.disabled = !selectedText;
      }
    });
    
    // Finally try to get from active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error getting selected text from content script:', chrome.runtime.lastError);
            return;
          }
          
          if (response && response.text) {
            selectedText = response.text;
            selectedTextElement.textContent = selectedText;
            generateButton.disabled = !selectedText;
          }
        });
      }
    });
  } catch (error) {
    console.error('Error getting selected text:', error);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Login button
  loginButton.addEventListener('click', async () => {
    try {
      hideError();
      
      if (window.MemeingsAuth && window.MemeingsAuth.signInWithGoogle) {
        const result = await window.MemeingsAuth.signInWithGoogle();
        if (result && result.user) {
          await checkAuthState();
        }
      } else {
        showError('Authentication module not available');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed: ' + error.message);
    }
  });
  
  // Logout button
  logoutButton.addEventListener('click', async () => {
    try {
      hideError();
      
      if (window.MemeingsAuth && window.MemeingsAuth.signOut) {
        await window.MemeingsAuth.signOut();
        await checkAuthState();
      } else {
        // Fallback to direct storage access
        await new Promise((resolve) => {
          chrome.storage.local.remove([window.MemeingsConfig.AUTH_TOKEN_KEY, window.MemeingsConfig.USER_INFO_KEY], resolve);
        });
        await checkAuthState();
      }
    } catch (error) {
      console.error('Logout error:', error);
      showError('Logout failed: ' + error.message);
    }
  });
  
  // Generate button
  generateButton.addEventListener('click', async () => {
    try {
      hideError();
      
      if (!isAuthenticated) {
        showError('Please login first');
        return;
      }
      
      if (!selectedText) {
        showError('Please select text first');
        return;
      }
      
      // Show loading
      loading.style.display = 'flex';
      resultSection.style.display = 'none';
      generateButton.disabled = true;
      
      // Generate image
      const result = await window.MemeingsApi.generateImage(selectedText);
      
      // Hide loading
      loading.style.display = 'none';
      
      if (result && result.image) {
        // Show result
        resultImage.src = result.image;
        resultSection.style.display = 'block';
      } else {
        showError('Failed to generate image');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      showError('Image generation failed: ' + error.message);
      loading.style.display = 'none';
    } finally {
      generateButton.disabled = false;
    }
  });
  
  // Copy button
  copyButton.addEventListener('click', async () => {
    try {
      hideError();
      
      if (!resultImage.src) {
        showError('No image to copy');
        return;
      }
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match the image
      canvas.width = resultImage.naturalWidth;
      canvas.height = resultImage.naturalHeight;
      
      // Draw the image on the canvas
      ctx.drawImage(resultImage, 0, 0);
      
      // Get the image data as a blob
      canvas.toBlob(async (blob) => {
        try {
          // Copy the image to clipboard
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          
          // Show success message
          showError('Image copied to clipboard', 'success');
        } catch (error) {
          console.error('Copy to clipboard error:', error);
          showError('Failed to copy image: ' + error.message);
        }
      });
    } catch (error) {
      console.error('Copy error:', error);
      showError('Failed to copy image: ' + error.message);
    }
  });
  
  // Download button
  downloadButton.addEventListener('click', () => {
    try {
      hideError();
      
      if (!resultImage.src) {
        showError('No image to download');
        return;
      }
      
      // Create a download link
      const link = document.createElement('a');
      link.href = resultImage.src;
      link.download = 'memeings-image-' + Date.now() + '.jpg';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      showError('Image downloaded', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download image: ' + error.message);
    }
  });
}

/**
 * Show error message
 * @param {string} message - Error message
 * @param {string} type - Error type (error, success)
 */
function showError(message, type = 'error') {
  errorMessage.textContent = message;
  errorContainer.style.display = 'block';
  
  if (type === 'success') {
    errorContainer.style.backgroundColor = '#e8f5e9';
    errorContainer.style.borderColor = '#c8e6c9';
    errorMessage.style.color = '#2e7d32';
  } else {
    errorContainer.style.backgroundColor = '#ffebee';
    errorContainer.style.borderColor = '#ffcdd2';
    errorMessage.style.color = '#c62828';
  }
  
  // Hide error after 3 seconds
  setTimeout(() => {
    hideError();
  }, 3000);
}

/**
 * Hide error message
 */
function hideError() {
  errorContainer.style.display = 'none';
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', initPopup);
