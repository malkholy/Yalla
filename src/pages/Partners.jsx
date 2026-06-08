import useSortable from "../hooks/useSortable.jsx";
import useKeyboardNav from "../hooks/useKeyboardNav.jsx";
import PartnerDetail from "./PartnerDetail.jsx";
import { ExportButtons } from "../components/PageWrapper.jsx";
import { useState, useEffect, useRef } from "react";

const STATUS_STYLE = {
  "Active":           { background:"rgba(160,248,127,0.15)", color:"#a0f87f" },
  "InActive":         { background:"rgba(248,113,113,0.15)", color:"#f87171" },
  "Approval Waiting": { background:"rgba(251,191,36,0.15)", color:"#fbbf24" },
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

  const { sorted, Th } = useSortable(data);
  // useKeyboardNav moved below filtered

  const filtered = sorted.filter(r =>
    (r.PartnerEnglishName || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.MobileNo || "").includes(search)
  );
  const { rowProps } = useKeyboardNav(filtered, setSelectedPartner);

  // KPIs
  const total    = data.length;
  const active   = data.filter(r => r.Status === "Active").length;
  const inactive = data.filter(r => r.Status === "InActive").length;
  const waiting  = data.filter(r => r.Status === "Approval Waiting").length;

  // Export Excel
  if (selectedPartner) return <PartnerDetail partner={selectedPartner} onBack={()=>setSelectedPartner(null)} apiCall={apiCall} onRefresh={load} />;
  return (
    <div id="partners-table">
      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        {[
          { label:"Total",            value:total,    color:"#6366f1", bg:"#ede9fe" },
          { label:"Active",           value:active,   color:"#16a34a", bg:"#dcfce7" },
          { label:"Inactive",         value:inactive, color:"#f87171", bg:"#fee2e2" },
          { label:"Approval Waiting", value:waiting,  color:"#d97706", bg:"#fef9c3" },
        ].map(k => (
          <div key={k.label} style={{background:"#1a2540",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)",padding:"1rem 1.25rem"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:4}}>{k.label}</div>
            <div style={{fontSize:26,fontWeight:700,color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-users" style={{fontSize:18,color:"#6366f1"}} aria-hidden="true"></i>
          <span style={{fontSize:15,fontWeight:600,color:"#fff"}}>Partners</span>
          <span style={{fontSize:12,background:"rgba(160,248,127,0.1)",color:"#a0f87f",borderRadius:20,padding:"2px 10px",fontWeight:500}}>{filtered.length}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{position:"relative"}}>
            <i className="ti ti-search" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"rgba(255,255,255,0.3)"}} aria-hidden="true"></i>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search name or mobile..."
              style={{paddingLeft:28,paddingRight:10,height:34,border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,fontSize:13,outline:"none",width:210}}/>
          </div>
          <button onClick={load} disabled={loading}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className={`ti ti-refresh${loading?" spin":""}`} style={{fontSize:14}} aria-hidden="true"></i>
            Refresh
          </button>
          <ExportButtons exportId="partners-table" filename="Partners" excelData={filtered} excelColumns={[{label:"ID",key:"PartnerID"},{label:"Name",key:"PartnerEnglishName"},{label:"Mobile",key:"MobileNo"},{label:"Address",key:"PartnerAddress"},{label:"Status",key:"Status"},{label:"Last Update",key:"LastMaintDate"}]} />
        </div>
      </div>

      {/* Table */}
      <div style={{background:"#1a2540",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}} id="partners-table">
        {loading
          ? <div style={{padding:"3rem",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>
              <i className="ti ti-loader spin" style={{fontSize:28,display:"block",marginBottom:8}} aria-hidden="true"></i>
              Loading...
            </div>
          : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#152338",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                  <Th col="PartnerID">#</Th>
                  <Th col="PartnerEnglishName">Partner</Th>
                  <Th col="MobileNo">Mobile</Th>
                  <Th col="PartnerAddress">Address</Th>
                  <Th col="Status">Status</Th>
                  <Th col="LastMaintDate">Last Update</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} style={{padding:"2rem",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>No records found</td></tr>
                  : filtered.map((r, i) => (
                    <tr key={i} {...rowProps(i, r)}>
                      <td style={td}>{r.PartnerID}</td>
                      <td style={td}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          {r.ProfileImage
                            ? <img src={r.ProfileImage} alt=""
                                style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",border:"1px solid rgba(255,255,255,0.07)"}}
                                onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
                            : null}
                          <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(160,248,127,0.1)",display:r.ProfileImage?"none":"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:"#a0f87f",flexShrink:0}}>
                            {(r.PartnerEnglishName||"?").slice(0,2).toUpperCase()}
                          </div>
                          <span style={{fontWeight:500,color:"#fff"}}>{r.PartnerEnglishName}</span>
                        </div>
                      </td>
                      <td style={td}>{r.MobileNo||"—"}</td>
                      <td style={{...td,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(255,255,255,0.4)"}}>{r.PartnerAddress||"—"}</td>
                      <td style={td}>
                        <span style={{...(STATUS_STYLE[r.Status]||{background:"#0e1520",color:"rgba(255,255,255,0.4)"}),borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:500}}>
                          {r.Status}
                        </span>
                      </td>
                      <td style={{...td,color:"rgba(255,255,255,0.3)"}}>{r.LastMaintDate?new Date(r.LastMaintDate).toLocaleDateString():"—"}</td>
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

const th = {padding:"10px 14px",textAlign:"left",fontWeight:600,color:"rgba(255,255,255,0.55)",fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em"};
const td = {padding:"10px 14px",color:"rgba(255,255,255,0.75)",verticalAlign:"middle"};
