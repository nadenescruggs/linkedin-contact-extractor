class LinkedInExtractor {
  constructor() {
    this.contacts = [];
    this.isRunning = false;
    this.init();
  }

  init() {
    this.loadContacts();
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    document.getElementById('startBtn').addEventListener('click', () => this.startExtraction());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopExtraction());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearContacts());
    document.getElementById('copyAllBtn').addEventListener('click', () => this.copyAllEmails());
  }

  async startExtraction() {
    this.isRunning = true;
    this.updateStatus('Starting extraction...');
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('linkedin.com')) {
        this.updateStatus('Please navigate to LinkedIn first');
        this.isRunning = false;
        return;
      }

      // Inject and run content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.injectExtractor
      });

      this.updateStatus('Extracting contacts from current page...');
      
    } catch (error) {
      console.error('Error starting extraction:', error);
      this.updateStatus('Error starting extraction');
      this.isRunning = false;
    }
  }

  stopExtraction() {
    this.isRunning = false;
    this.updateStatus('Extraction stopped');
  }

  async clearContacts() {
    this.contacts = [];
    await this.saveContacts();
    this.updateUI();
    this.updateStatus('Contacts cleared');
  }

  async copyAllEmails() {
    const emails = this.contacts
      .filter(contact => contact.email)
      .map(contact => contact.email)
      .filter((email, index, array) => array.indexOf(email) === index) // Remove duplicates
      .join('\n');
    
    if (emails) {
      await navigator.clipboard.writeText(emails);
      this.updateStatus(`Copied ${emails.split('\n').length} emails to clipboard`);
    } else {
      this.updateStatus('No emails found to copy');
    }
  }

  async copyContact(email) {
    if (email) {
      await navigator.clipboard.writeText(email);
      this.updateStatus(`Copied: ${email}`);
    }
  }

  async loadContacts() {
    try {
      const result = await chrome.storage.local.get(['linkedinContacts']);
      this.contacts = result.linkedinContacts || [];
    } catch (error) {
      console.error('Error loading contacts:', error);
      this.contacts = [];
    }
  }

  async saveContacts() {
    try {
      await chrome.storage.local.set({ linkedinContacts: this.contacts });
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  }

  updateUI() {
    const contactsList = document.getElementById('contactsList');
    const contactCount = document.getElementById('contactCount');
    const emailCount = document.getElementById('emailCount');
    const copyAllBtn = document.getElementById('copyAllBtn');

    contactCount.textContent = this.contacts.length;
    
    const emailsFound = this.contacts.filter(contact => contact.email).length;
    emailCount.textContent = emailsFound;

    if (this.contacts.length === 0) {
      contactsList.innerHTML = '<div class="empty-state">Click "Start Extracting" to begin scraping LinkedIn search results</div>';
      copyAllBtn.style.display = 'none';
    } else {
      copyAllBtn.style.display = emailsFound > 0 ? 'block' : 'none';
      
      contactsList.innerHTML = this.contacts.map(contact => `
        <div class="contact-item">
          ${contact.email ? `<button class="copy-btn" onclick="extractor.copyContact('${contact.email}')">Copy</button>` : ''}
          <div class="contact-name">${contact.name || 'Unknown'}</div>
          ${contact.email ? `<div class="contact-info contact-email">📧 ${contact.email}</div>` : ''}
          ${contact.title ? `<div class="contact-info">💼 ${contact.title}</div>` : ''}
          ${contact.company ? `<div class="contact-info">🏢 ${contact.company}</div>` : ''}
          ${contact.location ? `<div class="contact-info">📍 ${contact.location}</div>` : ''}
          ${contact.linkedinUrl ? `<div class="contact-info">🔗 <a href="${contact.linkedinUrl}" target="_blank">LinkedIn</a></div>` : ''}
        </div>
      `).join('');
    }
  }

  updateStatus(message) {
    document.getElementById('status').textContent = message;
  }

  // This function will be injected into the LinkedIn page
  injectExtractor() {
    if (window.linkedinExtractorInjected) return;
    window.linkedinExtractorInjected = true;

    class LinkedInPageExtractor {
      constructor() {
        this.extractedContacts = [];
        this.pageCount = 0;
        this.init();
      }

      init() {
        this.extractCurrentPage();
        this.setupPageWatcher();
      }

      extractCurrentPage() {
        console.log('Extracting contacts from current page...');
        
        // Extract from search results
        this.extractFromSearchResults();
        
        // Extract from profile page if we're on one
        this.extractFromProfile();
        
        this.pageCount++;
        this.sendContactsToPopup();
      }

      extractFromSearchResults() {
        // LinkedIn search result selectors (these may change)
        const resultContainers = document.querySelectorAll('[data-view-name="search-entity-result-universal-template"]');
        
        resultContainers.forEach(container => {
          const contact = this.extractContactFromElement(container);
          if (contact && contact.name) {
            this.extractedContacts.push(contact);
          }
        });

        // Also try alternative selectors
        const altContainers = document.querySelectorAll('.search-result__wrapper, .entity-result');
        altContainers.forEach(container => {
          const contact = this.extractContactFromElement(container);
          if (contact && contact.name) {
            this.extractedContacts.push(contact);
          }
        });
      }

      extractFromProfile() {
        if (window.location.pathname.includes('/in/')) {
          const contact = {
            name: this.extractTextFromSelectors([
              '.text-heading-xlarge',
              '.pv-text-details__left-panel h1',
              '.ph5 h1'
            ]),
            title: this.extractTextFromSelectors([
              '.text-body-medium.break-words',
              '.pv-text-details__left-panel .text-body-medium',
              '.ph5 .text-body-medium'
            ]),
            location: this.extractTextFromSelectors([
              '.text-body-small.inline.t-black--light.break-words',
              '.pv-text-details__left-panel .pb2'
            ]),
            linkedinUrl: window.location.href
          };

          // Try to extract email from contact info
          const contactInfoEmails = this.extractEmailsFromText(document.body.innerText);
          if (contactInfoEmails.length > 0) {
            contact.email = contactInfoEmails[0];
          }

          if (contact.name) {
            this.extractedContacts.push(contact);
          }
        }
      }

      extractContactFromElement(element) {
        const contact = {};

        // Name extraction
        contact.name = this.extractTextFromSelectors([
          '.entity-result__title-text a span[aria-hidden="true"]',
          '.actor-name',
          '.search-result__result-link',
          '.name-link',
          'a[data-field="result_title"] span[aria-hidden="true"]'
        ], element);

        // Title extraction
        contact.title = this.extractTextFromSelectors([
          '.entity-result__primary-subtitle',
          '.subline-level-1',
          '.search-result__snippets'
        ], element);

        // Company extraction
        contact.company = this.extractTextFromSelectors([
          '.entity-result__secondary-subtitle',
          '.subline-level-2'
        ], element);

        // Location extraction
        contact.location = this.extractTextFromSelectors([
          '.entity-result__summary .t-black--light',
          '.search-result__snippets .t-black--light'
        ], element);

        // LinkedIn URL extraction
        const profileLink = element.querySelector('a[href*="/in/"]');
        if (profileLink) {
          contact.linkedinUrl = profileLink.href;
        }

        // Email extraction from visible text
        const elementText = element.innerText || element.textContent || '';
        const emails = this.extractEmailsFromText(elementText);
        if (emails.length > 0) {
          contact.email = emails[0];
        }

        return contact;
      }

      extractTextFromSelectors(selectors, container = document) {
        for (const selector of selectors) {
          const element = container.querySelector(selector);
          if (element && element.textContent.trim()) {
            return element.textContent.trim();
          }
        }
        return null;
      }

      extractEmailsFromText(text) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        return text.match(emailRegex) || [];
      }

      setupPageWatcher() {
        // Watch for page changes and new content loading
        const observer = new MutationObserver((mutations) => {
          let shouldExtract = false;
          
          mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && (
                  node.classList?.contains('search-result') ||
                  node.querySelector?.('.search-result') ||
                  node.classList?.contains('entity-result') ||
                  node.querySelector?.('.entity-result')
                )) {
                  shouldExtract = true;
                }
              });
            }
          });

          if (shouldExtract) {
            setTimeout(() => this.extractCurrentPage(), 1000);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Auto-pagination handling
        this.setupAutoPagination();
      }

      setupAutoPagination() {
        setInterval(() => {
          const nextButton = document.querySelector('[aria-label="Next"]');
          const nextPageButton = document.querySelector('.artdeco-pagination__button--next');
          
          if (nextButton && !nextButton.disabled) {
            console.log('Auto-clicking next page...');
            nextButton.click();
          } else if (nextPageButton && !nextPageButton.disabled) {
            console.log('Auto-clicking next page...');
            nextPageButton.click();
          }
        }, 5000); // Check every 5 seconds
      }

      async sendContactsToPopup() {
        try {
          // Send to storage for popup to access
          const result = await chrome.storage.local.get(['linkedinContacts']);
          const existingContacts = result.linkedinContacts || [];
          
          // Merge and deduplicate
          const allContacts = [...existingContacts];
          
          this.extractedContacts.forEach(newContact => {
            const isDuplicate = allContacts.some(existing => 
              existing.name === newContact.name && 
              existing.linkedinUrl === newContact.linkedinUrl
            );
            
            if (!isDuplicate) {
              allContacts.push(newContact);
            }
          });

          await chrome.storage.local.set({ 
            linkedinContacts: allContacts,
            pageCount: this.pageCount 
          });

          console.log(`Extracted ${this.extractedContacts.length} new contacts from page ${this.pageCount}`);
          
        } catch (error) {
          console.error('Error sending contacts to popup:', error);
        }
      }
    }

    // Start the extractor
    new LinkedInPageExtractor();
  }
}

// Initialize the extractor
const extractor = new LinkedInExtractor();

// Listen for storage changes to update UI
chrome.storage.onChanged.addListener((changes) => {
  if (changes.linkedinContacts) {
    extractor.contacts = changes.linkedinContacts.newValue || [];
    extractor.updateUI();
  }
  if (changes.pageCount) {
    document.getElementById('pageCount').textContent = changes.pageCount.newValue || 0;
  }
});
