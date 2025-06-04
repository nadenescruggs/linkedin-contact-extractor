// Content script for LinkedIn Contact Extractor
console.log('LinkedIn Contact Extractor loaded');

// Create floating UI for the extension
function createFloatingUI() {
  if (document.getElementById('linkedin-extractor-ui')) {
    return; // Already exists
  }

  const floatingDiv = document.createElement('div');
  floatingDiv.id = 'linkedin-extractor-ui';
  floatingDiv.innerHTML = `
    <div class="extractor-header">
      <span>📧 Contact Extractor</span>
      <button class="toggle-btn" onclick="toggleExtractor()">−</button>
    </div>
    <div class="extractor-content">
      <div class="extractor-stats">
        <span id="live-count">0 contacts</span>
      </div>
      <div class="extractor-controls">
        <button id="extract-btn" onclick="startLiveExtraction()">Start</button>
        <button id="stop-btn" onclick="stopLiveExtraction()">Stop</button>
      </div>
      <div id="live-results" class="extractor-results"></div>
    </div>
  `;

  document.body.appendChild(floatingDiv);
}

// Global functions for the floating UI
window.toggleExtractor = function() {
  const content = document.querySelector('#linkedin-extractor-ui .extractor-content');
  const toggleBtn = document.querySelector('#linkedin-extractor-ui .toggle-btn');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    toggleBtn.textContent = '−';
  } else {
    content.style.display = 'none';
    toggleBtn.textContent = '+';
  }
};

window.startLiveExtraction = function() {
  console.log('Starting live extraction...');
  // This will be handled by the popup injection
};

window.stopLiveExtraction = function() {
  console.log('Stopping live extraction...');
};

// Initialize the floating UI when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingUI);
} else {
  createFloatingUI();
}

// Watch for dynamic content loading
const observer = new MutationObserver(() => {
  if (!document.getElementById('linkedin-extractor-ui')) {
    createFloatingUI();
  }
});
