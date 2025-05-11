import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme-toggle";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="muslimnet-theme">
    <App />
  </ThemeProvider>
);
