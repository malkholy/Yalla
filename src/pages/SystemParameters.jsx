import { useState, useEffect } from "react";
import useSortable from "../hooks/useSortable.jsx";
import { ExportButtons } from "../components/PageWrapper.jsx";

export default function SystemParameters({ apiCall }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await apiCall({ Operation: "Get System Parameters" });
      setData(d?.List || d?.List0 || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const { sorted, Th } = useSortable(data);
  const filtered = sorted.filter(r =>
    (r.ParameterName || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.ParameterValue || "").toLowerCase().includes(search.toLowerCase()) ||
    String(r.ParameterID || "").includes(search)
  );

  async function saveEdit() {
    setSaving(true);
    try {
      const lineData = JSON.stringify({
        ParameterID: editing.ParameterID,
        ParameterName: editName,
        ParameterValue: editValue
      });
      // Call both plural and singular operations to ensure compatibility with backend SP design
      await apiCall({ Operation: "Edit System Parameters", LineData: lineData });
      
      setToast({ type: "success", msg: "Saved successfully" });
      await load();
      setEditing(null);
    } catch {
      setToast({ type: "error", msg: "Connection error" });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  }

  function openEdit(r) {
    setEditing(r);
    setEditName(r.ParameterName || "");
    setEditValue(r.ParameterValue || "");
  }

  const excelColumns = [
    { label: "ID", key: "ParameterID" },
    { label: "Parameter Name", key: "ParameterName" },
    { label: "Parameter Value", key: "ParameterValue" }
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          <i className={`ti ${toast.type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} style={{ fontSize: 16 }} aria-hidden="true"></i>
          {toast.msg}
        </div>
      )}

      {editing ? (
        <div style={{ padding: "1rem 0" }}>
          {/* Breadcrumb / Back button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
            <button onClick={() => setEditing(null)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
              <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true"></i>
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                <span>System Parameters</span>
                <span>/</span>
                <span>Edit</span>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 4 }}>
                Edit Parameter: <span style={{ color: "#a0f87f" }}>{editing.ParameterName}</span>
              </h1>
            </div>
          </div>

          {/* Form Card */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            backdropFilter: "blur(8px)"
          }}>
            {/* ID Banner */}
            <div style={{
              background: "rgba(160,248,127,0.08)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#a0f87f" }}>Parameter ID: {editing.ParameterID}</span>
            </div>

            {/* Form Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Parameter Name</label>
                <input type="text" value={editName} readOnly
                  style={{ width: "100%", height: 42, padding: "0 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 14, color: "rgba(255,255,255,0.5)", outline: "none", fontFamily: "inherit", cursor: "not-allowed" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4, display: "block" }}>System identifiers are read-only.</span>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Parameter Value</label>
                <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
                  style={{ width: "100%", height: 42, padding: "0 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 14, color: "#fff", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "rgba(160,248,127,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
            </div>

            {/* Actions Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "2rem 0" }}></div>

            {/* Form Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => setEditing(null)}
                style={{
                  height: 42,
                  padding: "0 24px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                style={{
                  height: 42,
                  padding: "0 28px",
                  background: "linear-gradient(135deg,#573ad2,#2e139e)",
                  color: "#fff",
                  border: "1px solid rgba(160,248,127,0.25)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  if (!saving) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(87,58,210,0.4)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                {saving ? (
                  <>
                    <i className="ti ti-loader spin" style={{ fontSize: 16 }} aria-hidden="true"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="ti ti-check" style={{ fontSize: 16 }} aria-hidden="true"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div id="system-parameters-table">
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.25rem" }}>
            {[
              { label: "Total Parameters", value: data.length, color: "#a0f87f" },
              { label: "Numeric Settings", value: data.filter(r => !isNaN(r.ParameterValue)).length, color: "#fbbf24" },
              { label: "Text Settings", value: data.filter(r => isNaN(r.ParameterValue)).length, color: "#38bdf8" },
            ].map(k => (
              <div key={k.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-settings" style={{ fontSize: 18, color: "#a0f87f" }} aria-hidden="true"></i>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>System Parameters</span>
              <span style={{ fontSize: 12, background: "rgba(160,248,127,0.12)", color: "#a0f87f", borderRadius: 20, padding: "2px 10px", fontWeight: 500 }}>{filtered.length}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,0.25)" }} aria-hidden="true"></i>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  style={{ paddingLeft: 28, paddingRight: 10, height: 34, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 13, outline: "none", width: 180, color: "#fff" }} />
              </div>
              <button onClick={load} disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: 5, height: 34, padding: "0 12px", background: "#573ad2", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                <i className={`ti ti-refresh${loading ? " spin" : ""}`} style={{ fontSize: 14 }} aria-hidden="true"></i>Refresh
              </button>
              <ExportButtons exportId="system-parameters-table" filename="SystemParameters" excelData={filtered} excelColumns={excelColumns} />
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                <i className="ti ti-loader spin" style={{ fontSize: 28, display: "block", marginBottom: 8 }} aria-hidden="true"></i>Loading...
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <Th col="ParameterID">#</Th>
                    <Th col="ParameterName">Parameter Name</Th>
                    <Th col="ParameterValue">Parameter Value</Th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>No records found</td></tr>
                  ) : (
                    filtered.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(160,248,127,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ ...td, color: "rgba(255,255,255,0.35)" }}>{r.ParameterID}</td>
                        <td style={{ ...td, fontWeight: 500, color: "#fff" }}>{r.ParameterName}</td>
                        <td style={td}>
                          <span style={{ background: "rgba(255,255,255,0.06)", color: "#38bdf8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", fontFamily: "monospace", fontSize: 12 }}>
                            {r.ParameterValue}
                          </span>
                        </td>
                        <td style={td}>
                          <button onClick={() => openEdit(r)}
                            style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 10px", background: "rgba(160,248,127,0.08)", color: "#a0f87f", border: "1px solid rgba(160,248,127,0.2)", borderRadius: 7, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                            <i className="ti ti-pencil" style={{ fontSize: 12 }} aria-hidden="true"></i>Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: "12px 14px", textAlign: "left", fontWeight: 700, color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" };
const td = { padding: "12px 14px", color: "rgba(255,255,255,0.7)", verticalAlign: "middle" };
