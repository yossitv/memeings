// Firebase Authentication Module for Memeings Assistant

// Import Firebase SDK
// Note: In a production environment, you should import Firebase SDK via npm
// and use a bundler like webpack or Rollup

// Firebase auth redirect URL
const REDIRECT_URL = chrome.runtime.getURL('auth_callback.html');

// Initialize Firebase if it's available
let auth = null;

function initializeFirebase() {
  if (typeof firebase !== 'undefined') {
    // Initialize Firebase
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(window.MemeingsConfig.firebaseConfig);
    }
    auth = firebase.auth();
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase SDK not available');
  }
}

/**
 * Sign in with Google using Firebase Authentication
 * @returns {Promise<Object>} Authentication result
 */
async function signInWithGoogle() {
  try {
    console.log('Starting Google sign-in process');
    console.log('Redirect URL:', REDIRECT_URL);
    
    // Create authentication URL
    const authURL = `${window.MemeingsConfig.API_BASE_URL}/auth/google?redirect_url=${encodeURIComponent(REDIRECT_URL)}`;
    console.log('Auth URL:', authURL);
    
    return new Promise((resolve, reject) => {
      // Open authentication window
      chrome.windows.create({
        url: authURL,
        type: 'popup',
        width: 600,
        height: 700
      }, (window) => {
        console.log('Auth window opened:', window ? window.id : 'unknown');
        
        // Monitor authentication completion
        const checkAuthCompletion = setInterval(() => {
          chrome.storage.local.get([window.MemeingsConfig.AUTH_TOKEN_KEY, window.MemeingsConfig.USER_INFO_KEY], function(result) {
            if (result[window.MemeingsConfig.AUTH_TOKEN_KEY]) {
              // Authentication completed
              console.log('Auth token detected in storage, authentication complete');
              clearInterval(checkAuthCompletion);
              
              // Close the window
              if (window && window.id) {
                chrome.windows.remove(window.id);
                console.log('Auth window closed');
              }
              
              resolve({
                user: result[window.MemeingsConfig.USER_INFO_KEY],
                token: result[window.MemeingsConfig.AUTH_TOKEN_KEY]
              });
            }
          });
        }, 1000);
        
        // Set timeout to prevent infinite checking
        setTimeout(() => {
          clearInterval(checkAuthCompletion);
          if (window && window.id) {
            chrome.windows.remove(window.id);
          }
          reject(new Error('Authentication timed out'));
        }, 300000); // 5 minutes timeout
      });
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
async function signOut() {
  try {
    console.log('Signing out');
    
    // Clear authentication data from storage
    await new Promise((resolve) => {
      chrome.storage.local.remove([window.MemeingsConfig.AUTH_TOKEN_KEY, window.MemeingsConfig.USER_INFO_KEY], resolve);
    });
    
    console.log('User signed out successfully');
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Save authentication state to Chrome storage
 * @param {string} token - Authentication token
 * @param {Object} userInfo - User information
 * @returns {Promise<void>}
 */
async function saveAuthState(token, userInfo) {
  return new Promise((resolve, reject) => {
    try {
      const data = {};
      data[window.MemeingsConfig.AUTH_TOKEN_KEY] = token;
      data[window.MemeingsConfig.USER_INFO_KEY] = userInfo;
      
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log('Auth state saved successfully');
          resolve();
        }
      });
    } catch (error) {
      console.error('Error saving auth state:', error);
      reject(error);
    }
  });
}

/**
 * Get current authentication state
 * @returns {Promise<Object>} Authentication state
 */
async function getAuthState() {
  return new Promise((resolve) => {
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

// Initialize Firebase
initializeFirebase();

// Export authentication functions
window.MemeingsAuth = {
  signInWithGoogle,
  signOut,
  saveAuthState,
  getAuthState
};
