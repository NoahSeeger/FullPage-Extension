// Rate Limiter Funktion
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Funktion zum Erfassen des Screenshots
async function captureFullPage(tab, animationSpeed = "fast") {
  const delays = {
    fast: { scroll: 250, animation: 250 },
    normal: { scroll: 500, animation: 1000 },
    slow: { scroll: 1000, animation: 2000 },
  };
  const currentDelay = delays[animationSpeed];

  try {
    if (
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://")
    ) {
      throw new Error(
        "Screenshots können nicht von Chrome-System-Seiten erstellt werden"
      );
    }

    // Permissions check...

    // 1. Ermittle die exakte Seitenhöhe und setze initiale Werte
    const pageInfo = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return new Promise((resolve) => {
          // Scrolle ganz nach oben
          window.scrollTo(0, 0);

          setTimeout(() => {
            // Verstecke Scrollbar
            const style = document.createElement("style");
            style.id = "hide-scrollbar-style";
            style.textContent = `
              html, body {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              html::-webkit-scrollbar,
              body::-webkit-scrollbar {
                width: 0 !important;
                display: none !important;
              }
            `;
            document.head.appendChild(style);

            // Berechne tatsächliche Seitenhöhe
            const docHeight = Math.max(
              document.documentElement.scrollHeight,
              document.body.scrollHeight,
              document.documentElement.offsetHeight,
              document.body.offsetHeight
            );

            resolve({
              totalHeight: docHeight,
              viewportHeight: window.innerHeight,
              viewportWidth: window.innerWidth,
              devicePixelRatio: window.devicePixelRatio || 1,
            });
          }, 500);
        });
      },
    });

    const { totalHeight, viewportHeight, viewportWidth, devicePixelRatio } =
      pageInfo[0].result;

    // 2. Erstelle Canvas mit exakter Seitenhöhe
    const canvas = new OffscreenCanvas(
      viewportWidth * devicePixelRatio,
      totalHeight * devicePixelRatio
    );
    const ctx = canvas.getContext("2d");

    // 3. Berechne die notwendigen Scroll-Schritte mit Überlappung
    const OVERLAP = 20; // Kleine Überlappung in Pixeln
    const steps = [];
    let currentScroll = 0;
    const effectiveViewportHeight = viewportHeight - OVERLAP;

    while (currentScroll < totalHeight) {
      steps.push(currentScroll);
      currentScroll += effectiveViewportHeight;
    }

    // Korrigiere den letzten Schritt
    if (steps[steps.length - 1] + viewportHeight > totalHeight) {
      steps[steps.length - 1] = totalHeight - viewportHeight;
    }

    // 4. Mache Screenshots für jeden Scroll-Schritt
    for (let i = 0; i < steps.length; i++) {
      const scrollTop = steps[i];
      const isLastStep = i === steps.length - 1;

      // Update Progress
      chrome.runtime.sendMessage({
        type: "captureProgress",
        progress: (((i + 1) / steps.length) * 100).toFixed(0),
      });

      // Scrolle zur exakten Position
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (scrollTop, isFirst, isLast) => {
          return new Promise((resolve) => {
            // Verwalte fixed/sticky Elemente
            document.querySelectorAll("*").forEach((el) => {
              const style = window.getComputedStyle(el);

              if (style.position === "fixed" || style.position === "sticky") {
                el.style.visibility = isFirst ? "" : "hidden";
              } else if (
                el.classList.contains("scroll-to-top") ||
                el.classList.contains("back-to-top") ||
                el.matches("[data-testid='back-to-top']") ||
                el.classList.contains("call-button") ||
                el.classList.contains("action-button")
              ) {
                el.style.visibility = isLast ? "" : "hidden";
              }
            });

            window.scrollTo(0, scrollTop);
            setTimeout(resolve, 250);
          });
        },
        args: [scrollTop, i === 0, isLastStep],
      });

      await delay(currentDelay.animation);

      // Mache Screenshot
      const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: "png",
      });

      await delay(currentDelay.scroll);

      // Füge Screenshot an exakter Position ein
      const img = await createImageBitmap(
        await (await fetch(screenshot)).blob()
      );

      // Berechne die Y-Position für das Einfügen
      const yPosition =
        i === 0
          ? 0
          : scrollTop * devicePixelRatio + (OVERLAP * devicePixelRatio) / 2;

      ctx.drawImage(
        img,
        0,
        yPosition,
        viewportWidth * devicePixelRatio,
        viewportHeight * devicePixelRatio
      );
    }

    // 5. Cleanup und Wiederherstellung
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.getElementById("hide-scrollbar-style")?.remove();
        document.querySelectorAll("*").forEach((el) => {
          if (el.style.visibility === "hidden") {
            el.style.visibility = "";
          }
        });
        window.scrollTo(0, 0);
      },
    });

    // 6. Konvertiere und zeige Screenshot
    const blob = await canvas.convertToBlob({ type: "image/png" });
    const reader = new FileReader();
    const screenshot = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    // Benachrichtige Popup über Fertigstellung
    chrome.runtime.sendMessage({ type: "captureComplete" });

    // Öffne Viewer
    const newTab = await chrome.tabs.create({
      url: chrome.runtime.getURL("viewer.html"),
      active: true,
    });

    // Warte kurz bis die Seite geladen ist
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(newTab.id, {
          type: "showScreenshot",
          screenshot: screenshot,
        });
      } catch (error) {
        console.error("Fehler beim Senden des Screenshots:", error);
      }
    }, 1000);
  } catch (error) {
    // Stelle Originalzustand bei Fehler wieder her
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.getElementById("hide-scrollbar-style")?.remove();
        document.querySelectorAll("*").forEach((el) => {
          if (el.style.visibility === "hidden") {
            el.style.visibility = "";
          }
        });
        window.scrollTo(0, 0);
      },
    });

    console.error("Screenshot Fehler:", error);
    chrome.runtime.sendMessage({ type: "captureComplete" });
    chrome.tabs.create({
      url: `error.html?message=${encodeURIComponent(error.message)}`,
      active: true,
    });
  }
}

// Event Listener für den Extension-Button
chrome.action.onClicked.addListener((tab) => {
  captureFullPage(tab);
});

// Höre auf Nachrichten vom Popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "startCapture") {
    try {
      const tab = await chrome.tabs.get(message.tabId);
      captureFullPage(tab, message.animationSpeed);
    } catch (error) {
      console.error("Fehler beim Starten des Screenshots:", error);
    }
  }
});
