# Memeings Assistant Chrome Extension

A Chrome extension that allows users to generate images from selected text using the Memeings API. The extension includes Firebase authentication to manage user sessions and secure API requests.

## Features

- **User Authentication**
  - Google Sign-in using Firebase Authentication
  - Popup authentication flow with a dedicated auth window
  - Secure token storage in Chrome's local storage
  - Authentication state management throughout the extension
  - Logout functionality

- **Text Selection and Processing**
  - Detect and capture text selected by the user on any webpage
  - Store the selected text temporarily in Chrome's local storage
  - Display the selected text in the extension popup

- **Image Generation**
  - Send the selected text to the Memeings API to generate images
  - Display loading indicators during image generation
  - Show the generated image in the extension popup
  - Options to copy or download the generated image

- **User Interface**
  - Clean popup interface with login/logout buttons
  - Display user profile information when logged in
  - Show appropriate UI states (logged in/out, loading, results)
  - Error handling with user-friendly messages

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The Memeings Assistant extension should now be installed and visible in your Chrome toolbar

## Configuration

Before using the extension, you need to configure Firebase:

1. Open `firebase-config.js` and replace the placeholder values with your Firebase project configuration
2. Make sure your Firebase project has Google authentication enabled
3. Configure the API base URL in `firebase-config.js` if needed

## Usage

1. Log in to the extension using your Google account
2. Select text on any webpage
3. Click the Memeings Assistant icon in your Chrome toolbar to open the popup
4. The selected text will be displayed in the popup
5. Click "Generate Image" to create an image based on the selected text
6. Once the image is generated, you can copy or download it

## Development

### Project Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main extension popup
- `popup.css` - Styles for the popup
- `popup.js` - JavaScript for the popup
- `background.js` - Background script for handling events
- `content.js` - Content script for detecting text selection
- `firebase-config.js` - Firebase configuration
- `firebase-auth.js` - Firebase authentication module
- `api.js` - API communication module
- `auth_callback.html` - Authentication callback page

### Building and Testing

The extension can be loaded directly into Chrome without a build step. For development:

1. Make changes to the source code
2. Reload the extension in `chrome://extensions/` by clicking the refresh icon
3. Test the changes in Chrome

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Firebase](https://firebase.google.com/) - Authentication and backend services
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/) - Extension development documentation
- [Memeings API](https://memeings.com/api-docs) - Image generation API
