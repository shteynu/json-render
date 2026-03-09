import "./globals.css";
import { mount } from "svelte";
import App from "./App.svelte";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.setAttribute(
  "data-theme",
  prefersDark ? "dark" : "light",
);
document.documentElement.style.colorScheme = prefersDark ? "dark" : "light";

mount(App, { target: document.getElementById("app")! });
