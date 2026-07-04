export function registerServiceWorker(): void {
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
