(() => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // For local development, keep same-origin API calls.
  // For GitHub Pages production, set this to your deployed backend URL.
  window.PORTFOLIO_API_BASE = isLocalhost
    ? ""
    : "https://REPLACE_WITH_RENDER_BACKEND_URL";
})();
