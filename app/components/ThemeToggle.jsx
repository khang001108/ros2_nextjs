"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        background: "var(--bg-panel)",
        border: `1px solid var(--border)`,
        borderRadius: 6,
        cursor: "pointer",
        color: "var(--text-main)",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
