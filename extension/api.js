// API Communication Module for Memeings Assistant

/**
 * Get authentication token from Chrome storage
 * @returns {Promise<string|null>} Authentication token or null if not authenticated
 */
const getAuthToken = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get([window.MemeingsConfig.AUTH_TOKEN_KEY], (result) => {
      resolve(result[window.MemeingsConfig.AUTH_TOKEN_KEY] || null);
    });
  });
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    if (!token && options.requireAuth !== false) {
      throw new Error('Authentication required');
    }
    
    const url = `${window.MemeingsConfig.API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    // Log response for debugging
    console.log(`API ${options.method || 'GET'} ${endpoint} response:`, {
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Generate an image from text
 * @param {string} prompt - Text prompt for image generation
 * @returns {Promise<Object>} Generated image data
 */
const generateImage = async (prompt) => {
  try {
    console.log('Generating image with prompt:', prompt);
    
    const response = await apiRequest('/generate-image', {
      method: 'POST',
      body: { prompt }
    });
    
    if (!response.image) {
      throw new Error('No image data received from API');
    }
    
    return {
      text: response.text || 'Image generated successfully',
      image: processImageData(response.image)
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};

/**
 * Process image data from API response
 * @param {string} image - Image data from API
 * @returns {string} Processed image data URI
 */
const processImageData = (image) => {
  if (!image || typeof image !== 'string') {
    console.error('Invalid image data:', image);
    return null;
  }
  
  try {
    // If already a data URI, return as is
    if (image.startsWith('data:')) {
      return image;
    }
    
    // If base64 encoded, add data URI prefix
    if (isBase64(image)) {
      return `data:image/jpeg;base64,${image}`;
    }
    
    // If path starting with /, add API base URL
    if (image.startsWith('/')) {
      return `${window.MemeingsConfig.API_BASE_URL}${image}`;
    }
    
    // Otherwise, use as is (complete URL)
    return image;
  } catch (error) {
    console.error('Error processing image data:', error);
    return null;
  }
};

/**
 * Check if a string is base64 encoded
 * @param {string} str - String to check
 * @returns {boolean} True if base64 encoded
 */
const isBase64 = (str) => {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};

// Export API functions
window.MemeingsApi = {
  generateImage,
  processImageData
};
