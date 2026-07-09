import { Component, StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./assets/index.css";
import { registerServiceWorker } from "./shared/utils/registerSW";

registerServiceWorker();

class BootErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Renderer] Boot error:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 24, fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ marginBottom: 12 }}>Xcashme-vpro failed to render</h1>
          <pre style={{ whiteSpace: "pre-wrap", color: "#fca5a5" }}>{this.state.error}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function BootShell() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const markReady = () => setReady(true);
    markReady();
    window.addEventListener("error", (event) => {
      console.error("[Renderer] Unhandled error:", event.error || event.message);
    });
    window.addEventListener("unhandledrejection", (event) => {
      console.error("[Renderer] Unhandled rejection:", event.reason);
    });
  }, []);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif" }}>
        <div>Booting Xcashme-vpro POS...</div>
      </div>
    );
  }

  return <App />;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <BootErrorBoundary>
      <BootShell />
    </BootErrorBoundary>
  </StrictMode>,
);
