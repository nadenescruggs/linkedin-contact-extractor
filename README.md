# LinkedIn Contact Extractor Chrome Extension

A Chrome extension that extracts contact information from LinkedIn search results and profiles.

## 🚀 Features

- 🔍 Extract contact information from LinkedIn search results
- 📧 Find visible email addresses and contact details
- 📄 Unlimited page scraping with auto-pagination
- 💾 Store and manage extracted contacts
- 📋 Copy individual emails or bulk copy all emails
- 🎯 Works on search results and individual profiles
- ⚡ Real-time extraction with floating UI

## 📦 Installation

1. **Download this repository** as a ZIP file (green "Code" button → "Download ZIP")
2. **Extract the ZIP file** to your local machine
3. **Open Chrome** and go to `chrome://extensions/`
4. **Enable "Developer mode"** (toggle in top right)
5. **Click "Load unpacked"** and select the extracted folder
6. **Done!** The extension should now appear in your extensions

## 🎯 How to Use

### Method 1: Extension Popup
1. Navigate to **LinkedIn.com**
2. Perform a **people search** or browse profiles
3. **Click the extension icon** in Chrome toolbar
4. **Click "Start Extracting"** to begin scraping
5. **View extracted contacts** in the popup
6. **Copy emails** individually or use "Copy All Emails"

### Method 2: Floating UI
1. Navigate to **LinkedIn search results**
2. A **floating widget** appears in the top-right corner
3. **Click "Start"** to begin live extraction
4. **View results** in real-time as you browse

## 📊 What Gets Extracted

- 👤 **Names** - Full contact names
- 💼 **Job Titles** - Current positions
- 🏢 **Companies** - Current workplaces
- 📍 **Locations** - Geographic locations
- 🔗 **LinkedIn URLs** - Direct profile links
- 📧 **Email Addresses** - Any visible emails (limited availability)

## ⚠️ Important Notes

**Email Availability**: LinkedIn typically doesn't display email addresses publicly in search results. Emails are usually only visible in the "Contact Info" section of individual profiles and require appropriate permissions.

**Terms of Service**: Please ensure your use of this extension complies with LinkedIn's Terms of Service and applicable data protection laws.

**Rate Limiting**: The extension includes delays to avoid triggering LinkedIn's anti-scraping measures.

## 🔧 Features

### Auto-Pagination
Automatically detects and clicks "Next" buttons to scrape multiple pages of search results.

### Duplicate Detection
Contacts are automatically deduplicated based on name and LinkedIn URL.

### Data Persistence
All extracted contacts are stored locally in Chrome's storage.

### Copy Functionality
- Copy individual email addresses with one click
- Bulk copy all extracted emails at once
- Clipboard integration for easy data transfer

## 🛠️ Troubleshooting

1. **Extension not working**: Ensure you're on LinkedIn.com and have given necessary permissions
2. **No contacts extracted**: Try refreshing the page or navigating to different LinkedIn pages
3. **Limited email addresses**: This is normal - LinkedIn restricts email visibility
4. **Content not loading**: Clear browser cache and reload LinkedIn

## 🔒 Privacy

This extension:
- Only works on LinkedIn.com domains
- Stores data locally in your browser
- Does not send data to external servers
- Respects LinkedIn's content structure and visibility rules

## 🏗️ File Structure

linkedin-contact-extractor/ ├── manifest.json # Extension configuration ├── popup.html # Extension popup interface ├── popup.js # Popup functionality ├── content.js # Page interaction script ├── content.css # Styling for floating UI ├── background.js # Background service worker └── README.md # This documentation


## 📝 License

This extension is provided as-is for educational and personal use. Please respect LinkedIn's Terms of Service and applicable data protection laws when using this tool.
