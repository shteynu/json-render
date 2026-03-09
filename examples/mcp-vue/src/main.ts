import "./globals.css";
import { createApp } from "vue";
import App from "./App.vue";

// Fallback theme before MCP host provides context
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.setAttribute(
  "data-theme",
  prefersDark ? "dark" : "light",
);
document.documentElement.style.colorScheme = prefersDark ? "dark" : "light";

createApp(App).mount("#app");
