// popup.js

document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');

  // Load saved state and set the switch
  chrome.storage.sync.get('isOutsourcingMarkingEnabled', function(data) {
    toggleSwitch.checked = data.isOutsourcingMarkingEnabled !== undefined ? data.isOutsourcingMarkingEnabled : true;
  });

  // Save state and notify content script on change
  toggleSwitch.addEventListener('change', function() {
    const isEnabled = toggleSwitch.checked;
    chrome.storage.sync.set({ 'isOutsourcingMarkingEnabled': isEnabled }, function() {
      console.log('Outsourcing marking preference saved:', isEnabled);
      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleOutsourcingMarking', enabled: isEnabled });
        } else {
            console.error("Could not get active tab ID to send message.");
        }
      });
    });
  });

  console.log('Popup DOM fully loaded and parsed');
});