export function registerServiceWorker(): void {
  const isElectron = typeof navigator !== "undefined" && navigator.userAgent.includes("Electron");

  if (isElectron && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch((error) => {
      console.warn("[ServiceWorker] Failed to clear Electron registrations:", error);
    });
    return;
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[ServiceWorker] Successfully registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.warn("[ServiceWorker] Registration failed:", error);
        });
    });
  }
}
