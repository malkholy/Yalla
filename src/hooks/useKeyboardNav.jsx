import { useState, useEffect, useCallback } from "react";

export default function useKeyboardNav(rows, onSelect) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKey = useCallback((e) => {
    if (!rows.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (onSelect) onSelect(rows[activeIndex]);
    } else if (e.key === "Escape") {
      setActiveIndex(-1);
    }
  }, [rows, activeIndex, onSelect]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Auto scroll active row into view
  useEffect(() => {
    if (activeIndex >= 0) {
      const el = document.querySelector(`[data-row-index="${activeIndex}"]`);
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex]);

  function rowProps(index, row) {
    const isActive = activeIndex === index;
    return {
      "data-row-index": index,
      onClick: () => { setActiveIndex(index); if (onSelect) onSelect(row); },
      onMouseEnter: e => { e.currentTarget.style.background = isActive ? "rgba(160,248,127,0.1)" : "rgba(160,248,127,0.04)"; },
      onMouseLeave: e => { e.currentTarget.style.background = isActive ? "rgba(160,248,127,0.1)" : "transparent"; },
      style: {
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
        background: isActive ? "rgba(160,248,127,0.1)" : "transparent",
        outline: isActive ? "1px solid rgba(160,248,127,0.3)" : "none",
        transition: "background 0.1s",
      }
    };
  }

  return { activeIndex, setActiveIndex, rowProps };
}
