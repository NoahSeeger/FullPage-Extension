let currentTab = null;

// Hole aktuelle Tab-ID
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  currentTab = tabs[0];
});

document.getElementById("captureBtn").addEventListener("click", async () => {
  const button = document.getElementById("captureBtn");
  const progressContainer = document.getElementById("progressContainer");
  const progressFill = document.getElementById("progressFill");
  const animationSpeed = document.getElementById("animationSpeed").value;

  button.disabled = true;
  progressContainer.style.display = "block";

  // Sende Nachricht an background script
  chrome.runtime.sendMessage({
    type: "startCapture",
    tabId: currentTab.id,
    animationSpeed: animationSpeed,
  });
});

// Höre auf Progress-Updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "captureProgress") {
    document.getElementById(
      "progressFill"
    ).style.width = `${message.progress}%`;
  } else if (message.type === "captureComplete") {
    window.close();
  }
});
