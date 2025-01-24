// Screenshot-Bild Element
const screenshotImg = document.getElementById("screenshot");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

// Screenshot von background.js empfangen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Nachricht empfangen:", message);
  if (message.type === "showScreenshot") {
    screenshotImg.src = message.screenshot;
    sendResponse({ status: "success" });
  }
  return true;
});

// Download-Funktion
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `screenshot-${Date.now()}.png`;
  link.href = screenshotImg.src;
  link.click();
});

// Kopier-Funktion
copyBtn.addEventListener("click", async () => {
  try {
    const response = await fetch(screenshotImg.src);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    alert("Screenshot wurde in die Zwischenablage kopiert!");
  } catch (err) {
    console.error("Fehler beim Kopieren:", err);
    alert("Fehler beim Kopieren des Screenshots.");
  }
});

// Cleanup beim Schließen
window.addEventListener("unload", () => {
  if (screenshotImg.src.startsWith("blob:")) {
    URL.revokeObjectURL(screenshotImg.src);
  }
});
