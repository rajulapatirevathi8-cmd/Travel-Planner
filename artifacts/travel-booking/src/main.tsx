import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/migrate-bookings"; // Enable booking debug tools

// Enable Mock Service Worker in development
// This will mock the backend API until a real backend is available
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    
    return worker.start({
      onUnhandledRequest: 'bypass', // Allow non-mocked requests to pass through
    });
  }
  return Promise.resolve();
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
