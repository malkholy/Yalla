import { useState, useEffect } from "react";
import { ExportButtons } from "../components/PageWrapper.jsx";
import ClientDetail from "./ClientDetail.jsx";

export default function Clients({ apiCall }) {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await apiCall({ Operation: "Get Clients" });
      setData(d?.List || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = data.filter(r =>
    (r.ClientName || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.ClientMobile || "").includes(search)
  );

  const totalOrders     = data.reduce((s,r) => s + (r.TotalOrders||0), 0);
  const totalCompleted  = data.reduce((s,r) => s + (r.TotalCompletedOrders||0), 0);
  const totalPending    = data.reduce((s,r) => s + (r.TotalNotCompletedOrders||0), 0);


  if (selectedClient) return <ClientDetail client={selectedClient} onBack={()=>setSelectedClient(null)} onRefresh={load} apiCall={apiCall} />;

  return (
    <div>
      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        {[
          { label:"Total Clients",   value:data.length,    color:"#6366f1" },
          { label:"Total Orders",    value:totalOrders,    color:"#38bdf8" },
          { label:"Completed",       value:totalCompleted, color:"#16a34a" },
          { label:"Not Completed",   value:totalPending,   color:"#f87171" },
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
          <i className="ti ti-building" style={{fontSize:18,color:"#6366f1"}} aria-hidden="true"></i>
          <span style={{fontSize:15,fontWeight:600,color:"#fff"}}>Clients</span>
          <span style={{fontSize:12,background:"rgba(160,248,127,0.1)",color:"#a0f87f",borderRadius:20,padding:"2px 10px",fontWeight:500}}>{filtered.length}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{position:"relative"}}>
            <i className="ti ti-search" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"rgba(255,255,255,0.3)"}} aria-hidden="true"></i>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or mobile..."
              style={{paddingLeft:28,paddingRight:10,height:34,border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,fontSize:13,outline:"none",width:210}}/>
          </div>
          <button onClick={load} disabled={loading}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className={`ti ti-refresh${loading?" spin":""}`} style={{fontSize:14}} aria-hidden="true"></i>Refresh
          </button>
          <ExportButtons exportId="clients-table" filename="Clients" excelData={filtered} excelColumns={[{label:"ID",key:"ClientID"},{label:"Name",key:"ClientName"},{label:"Mobile",key:"ClientMobile"},{label:"Total Orders",key:"TotalOrders"},{label:"Completed",key:"TotalCompletedOrders"},{label:"Not Completed",key:"TotalNotCompletedOrders"}]} />
        </div>
      </div>

      {/* Table */}
      <div style={{background:"#1a2540",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}} id="clients-table">
        {loading
          ? <div style={{padding:"3rem",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>
              <i className="ti ti-loader spin" style={{fontSize:28,display:"block",marginBottom:8}} aria-hidden="true"></i>Loading...
            </div>
          : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#152338",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                  <th style={th}>#</th>
                  <th style={th}>Client</th>
                  <th style={th}>Mobile</th>
                  <th style={th}>Total Orders</th>
                  <th style={th}>Completed</th>
                  <th style={th}>Not Completed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} style={{padding:"2rem",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>No records found</td></tr>
                  : filtered.map(r => (
                    <tr key={r.ClientID} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(160,248,127,0.05)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      onClick={()=>setSelectedClient(r)}>
                      <td style={td}>{r.ClientID}</td>
                      <td style={td}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(56,189,248,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:"#38bdf8",flexShrink:0}}>
                            {(r.ClientName||"?").slice(0,2).toUpperCase()}
                          </div>
                          <span style={{fontWeight:500,color:"#fff"}}>{r.ClientName}</span>
                        </div>
                      </td>
                      <td style={td}>{r.ClientMobile||"—"}</td>
                      <td style={td}>
                        <span style={{fontWeight:600,color:"#38bdf8"}}>{r.TotalOrders||0}</span>
                      </td>
                      <td style={td}>
                        {r.TotalCompletedOrders > 0
                          ? <span style={{background:"rgba(160,248,127,0.15)",color:"#a0f87f",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:500}}>{r.TotalCompletedOrders}</span>
                          : <span style={{color:"rgba(255,255,255,0.3)"}}>0</span>}
                      </td>
                      <td style={td}>
                        {r.TotalNotCompletedOrders > 0
                          ? <span style={{background:"rgba(248,113,113,0.15)",color:"#f87171",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:500}}>{r.TotalNotCompletedOrders}</span>
                          : <span style={{color:"rgba(255,255,255,0.3)"}}>0</span>}
                      </td>
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
