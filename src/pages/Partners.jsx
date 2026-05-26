import PartnerDetail from "./PartnerDetail.jsx";
import { exportToPDF } from "../utils/exportPDF.js";
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

const STATUS_STYLE = {
  "Active":           { background:"#dcfce7", color:"#15803d" },
  "InActive":         { background:"#fee2e2", color:"#dc2626" },
  "Approval Waiting": { background:"#fef9c3", color:"#a16207" },
};

export default function Partners({ apiCall }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const tableRef              = useRef();

  async function load() {
    setLoading(true);
    try {
      const d = await apiCall({ Operation: "Get Partners" });
      setData(d?.List || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = data.filter(r =>
    (r.PartnerEnglishName || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.MobileNo || "").includes(search)
  );

  // KPIs
  const total    = data.length;
  const active   = data.filter(r => r.Status === "Active").length;
  const inactive = data.filter(r => r.Status === "InActive").length;
  const waiting  = data.filter(r => r.Status === "Approval Waiting").length;

  // Export Excel
  function exportExcel() {
    const rows = filtered.map(r => ({
      ID:           r.PartnerID,
      Name:         r.PartnerEnglishName,
      Mobile:       r.MobileNo,
      Address:      r.PartnerAddress,
      Status:       r.Status,
      "Last Update": r.LastMaintDate ? new Date(r.LastMaintDate).toLocaleDateString() : "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Partners");
    XLSX.writeFile(wb, "Partners.xlsx");
  }

  // Export PDF
  function exportPDF() { exportToPDF("partners-table", "Partners.pdf"); }
  if (selectedPartner) return <PartnerDetail partner={selectedPartner} onBack={()=>setSelectedPartner(null)} apiCall={apiCall} onRefresh={load} />;
  return (
    <div id="partners-table">
      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        {[
          { label:"Total",            value:total,    color:"#6366f1", bg:"#ede9fe" },
          { label:"Active",           value:active,   color:"#16a34a", bg:"#dcfce7" },
          { label:"Inactive",         value:inactive, color:"#dc2626", bg:"#fee2e2" },
          { label:"Approval Waiting", value:waiting,  color:"#d97706", bg:"#fef9c3" },
        ].map(k => (
          <div key={k.label} style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",padding:"1rem 1.25rem"}}>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:4}}>{k.label}</div>
            <div style={{fontSize:26,fontWeight:700,color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-users" style={{fontSize:18,color:"#6366f1"}} aria-hidden="true"></i>
          <span style={{fontSize:15,fontWeight:600,color:"#1e293b"}}>Partners</span>
          <span style={{fontSize:12,background:"#ede9fe",color:"#6d28d9",borderRadius:20,padding:"2px 10px",fontWeight:500}}>{filtered.length}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{position:"relative"}}>
            <i className="ti ti-search" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#94a3b8"}} aria-hidden="true"></i>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search name or mobile..."
              style={{paddingLeft:28,paddingRight:10,height:34,border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",width:210}}/>
          </div>
          <button onClick={load} disabled={loading}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className={`ti ti-refresh${loading?" spin":""}`} style={{fontSize:14}} aria-hidden="true"></i>
            Refresh
          </button>
          <button onClick={exportExcel}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#16a34a",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className="ti ti-file-spreadsheet" style={{fontSize:14}} aria-hidden="true"></i>
            Excel
          </button>
          <button onClick={exportPDF}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#dc2626",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className="ti ti-file-type-pdf" style={{fontSize:14}} aria-hidden="true"></i>
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden"}} id="partners-table">
        {loading
          ? <div style={{padding:"3rem",textAlign:"center",color:"#94a3b8"}}>
              <i className="ti ti-loader spin" style={{fontSize:28,display:"block",marginBottom:8}} aria-hidden="true"></i>
              Loading...
            </div>
          : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
                  <th style={th}>#</th>
                  <th style={th}>Partner</th>
                  <th style={th}>Mobile</th>
                  <th style={th}>Address</th>
                  <th style={th}>Status</th>
                  <th style={th}>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} style={{padding:"2rem",textAlign:"center",color:"#94a3b8"}}>No records found</td></tr>
                  : filtered.map(r => (
                    <tr key={r.PartnerID} style={{borderBottom:"1px solid #f1f5f9"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8f7ff"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"} onClick={()=>setSelectedPartner(r)}>
                      <td style={td}>{r.PartnerID}</td>
                      <td style={td}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          {r.ProfileImage
                            ? <img src={r.ProfileImage} alt=""
                                style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",border:"1px solid #e2e8f0"}}
                                onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
                            : null}
                          <div style={{width:34,height:34,borderRadius:"50%",background:"#ede9fe",display:r.ProfileImage?"none":"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:"#6d28d9",flexShrink:0}}>
                            {(r.PartnerEnglishName||"?").slice(0,2).toUpperCase()}
                          </div>
                          <span style={{fontWeight:500,color:"#1e293b"}}>{r.PartnerEnglishName}</span>
                        </div>
                      </td>
                      <td style={td}>{r.MobileNo||"—"}</td>
                      <td style={{...td,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#64748b"}}>{r.PartnerAddress||"—"}</td>
                      <td style={td}>
                        <span style={{...(STATUS_STYLE[r.Status]||{background:"#f1f5f9",color:"#64748b"}),borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:500}}>
                          {r.Status}
                        </span>
                      </td>
                      <td style={{...td,color:"#94a3b8"}}>{r.LastMaintDate?new Date(r.LastMaintDate).toLocaleDateString():"—"}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}

const th = {padding:"10px 14px",textAlign:"left",fontWeight:600,color:"#475569",fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em"};
const td = {padding:"10px 14px",color:"#334155",verticalAlign:"middle"};
