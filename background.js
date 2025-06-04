// Background script for LinkedIn Contact Extractor
/* global chrome */

// Install/update handler
chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Contact Extractor installed');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContacts') {
    handleContactExtraction(request.data, sender.tab);
  } else if (request.action === 'getContacts') {
    getStoredContacts().then(sendResponse);
    return true; // Will respond asynchronously
  }
});

async function handleContactExtraction(contacts, tab) {
  try {
    // Get existing contacts
    const result = await chrome.storage.local.get(['linkedinContacts', 'pageCount']);
    const existingContacts = result.linkedinContacts || [];
    const pageCount = (result.pageCount || 0) + 1;
    
    // Merge and deduplicate contacts
    const allContacts = [...existingContacts];
    let newContactsCount = 0;
    
    contacts.forEach(newContact => {
      const isDuplicate = allContacts.some(existing => 
        existing.name === newContact.name && 
        (existing.linkedinUrl === newContact.linkedinUrl || 
         existing.email === newContact.email)
      );
      
      if (!isDuplicate && newContact.name) {
        allContacts.push(newContact);
        newContactsCount++;
      }
    });

    // Save updated contacts
    await chrome.storage.local.set({ 
      linkedinContacts: allContacts,
      pageCount: pageCount
    });

    console.log(`Processed ${contacts.length} contacts, ${newContactsCount} new ones added`);
    
  } catch (error) {
    console.error('Error handling contact extraction:', error);
  }
}

async function getStoredContacts() {
  try {
    const result = await chrome.storage.local.get(['linkedinContacts']);
    return result.linkedinContacts || [];
  } catch (error) {
    console.error('Error getting stored contacts:', error);
    return [];
  }
}

// Handle tab updates to detect LinkedIn navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('linkedin.com')) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Ignore errors - might already be injected
    });
  }
});
