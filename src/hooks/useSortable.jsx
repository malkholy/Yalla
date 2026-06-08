import { useState, useMemo } from "react";

export default function useSortable(data) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (av == null || av === "") return 1;
      if (bv == null || bv === "") return -1;
      // Date
      if (typeof av === "string" && /\d{4}-\d{2}-\d{2}/.test(av)) {
        return sortDir === "asc"
          ? new Date(av) - new Date(bv)
          : new Date(bv) - new Date(av);
      }
      // Number
      const an = parseFloat(av), bn = parseFloat(bv);
      if (!isNaN(an) && !isNaN(bn)) {
        return sortDir === "asc" ? an - bn : bn - an;
      }
      // String
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDir]);

  // Return th props instead of component - avoids React component identity issue
  function thProps(col) {
    const isActive = sortKey === col;
    return {
      onClick: () => handleSort(col),
      style: {
        padding:"10px 14px", textAlign:"left", fontWeight:700,
        fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em",
        cursor:"pointer", userSelect:"none", whiteSpace:"nowrap",
        color: isActive ? "#a0f87f" : "rgba(255,255,255,0.35)",
      },
    };
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <i className="ti ti-selector" style={{fontSize:11,opacity:0.3,marginLeft:4}} aria-hidden="true"></i>;
    return <i className={`ti ti-sort-${sortDir==="asc"?"ascending":"descending"}`} style={{fontSize:11,color:"#a0f87f",marginLeft:4}} aria-hidden="true"></i>;
  }

  // Th as a render prop - not a component
  function Th({ col, children }) {
    return <th {...thProps(col)}>{children}<SortIcon col={col}/></th>;
  }

  return { sorted, Th, sortKey, sortDir };
}
