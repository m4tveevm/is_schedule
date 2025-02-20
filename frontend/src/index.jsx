import React from "react";
import ReactDOM from "react-dom/client";

import * as Sentry from "@sentry/react";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

Sentry.init({
  dsn: "https://f1d1704e07b5e51d96e12fd432f9de59@o4508100133978112.ingest.de.sentry.io/4508414552506448",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
