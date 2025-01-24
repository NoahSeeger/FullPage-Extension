document.addEventListener("DOMContentLoaded", () => {
  // Fehlermeldung aus URL auslesen und anzeigen
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get("message");
  document.getElementById("errorMessage").textContent =
    errorMessage || "Ein unbekannter Fehler ist aufgetreten";

  // Schließen-Button Funktionalität
  document.getElementById("closeButton").addEventListener("click", () => {
    window.close();
  });
});
