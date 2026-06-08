import { useState, useEffect } from "react";
import useSortable from "../hooks/useSortable.jsx";
import { ExportButtons } from "../components/PageWrapper.jsx";

export default function ServiceType({ apiCall }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [editing, setEditing] = useState(null);
  const [editFees, setEditFees] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await apiCall({ Operation: "Get Service Type" });
      setData(d?.List || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const { sorted, Th } = useSortable(data);
  const filtered = sorted.filter(r =>
    (r.ServiceDescription||"").toLowerCase().includes(search.toLowerCase()) ||
    String(r.ServiceTypeID||"").includes(search)
  );

  async function saveEdit() {
    setSaving(true);
    try {
      const lineData = JSON.stringify({ ServiceID: editing.ServiceTypeID, Fess: parseFloat(editFees||0), Discount: parseFloat(editDiscount||0) });
      const d = await apiCall({ Operation: "Edit Service Type", LineData: lineData });
      const row = d?.List?.[0] || d?.List0?.[0];
      if (row?.State === 0 || row?.State === undefined) {
        setToast({ type:"success", msg:"Saved successfully" });
        await load();
        setEditing(null);
      } else {
        setToast({ type:"error", msg: row?.Message || "Save failed" });
      }
    } catch { setToast({ type:"error", msg:"Connection error" }); }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  }

  function openEdit(r) {
    setEditing(r);
    setEditFees(r.ServiceFees||"0");
    setEditDiscount(r.Discount||"0");
  }

  const excelColumns = [
    { label:"ID",          key:"ServiceTypeID" },
    { label:"Description", key:"ServiceDescription" },
    { label:"Fees",        key:"ServiceFees" },
    { label:"Discount",    key:"Discount" },
    { label:"Created By",  key:"CreatedBy" },
    { label:"Created Date",key:"CreatedDate" },
  ];

  return (
    <div style={{position:"relative"}}>
      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,right:20,zIndex:2000,background:toast.type==="success"?"#16a34a":"#dc2626",color:"#fff",borderRadius:8,padding:"10px 16px",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:8}}>
          <i className={`ti ${toast.type==="success"?"ti-circle-check":"ti-alert-circle"}`} style={{fontSize:16}} aria-hidden="true"></i>
          {toast.msg}
        </div>
      )}
      {/* Side Drawer */}
      {editing && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",justifyContent:"flex-end"}}>
          <div onClick={()=>setEditing(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}}></div>
          <div style={{position:"relative",width:300,background:"#152338",borderLeft:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",boxShadow:"-8px 0 32px rgba(0,0,0,0.4)"}}>
            {/* Drawer Header */}
            <div style={{padding:"1.25rem",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(160,248,127,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#a0f87f",fontSize:17}}>
                  <i className="ti ti-pencil" aria-hidden="true"></i>
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>Edit Service Type</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{editing.ServiceDescription} · ID: {editing.ServiceTypeID}</div>
                </div>
              </div>
              <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
            </div>
            {/* Drawer Body */}
            <div style={{padding:"1.25rem",flex:1}}>
              <div style={{background:"rgba(160,248,127,0.08)",borderRadius:8,padding:"10px 12px",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:8}}>
                <span style={{background:"rgba(160,248,127,0.1)",color:"#a0f87f",borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:600}}>{editing.ServiceDescription}</span>
              </div>
              <div style={{marginBottom:"1rem"}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Service Fees (SYP)</label>
                <input type="number" value={editFees} onChange={e=>setEditFees(e.target.value)}
                  style={{width:"100%",height:40,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <div style={{marginBottom:"1rem"}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Discount Amount (SYP)</label>
                <input type="number" value={editDiscount} onChange={e=>setEditDiscount(e.target.value)}
                  style={{width:"100%",height:40,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
            </div>
            {/* Drawer Footer */}
            <div style={{padding:"1rem 1.25rem",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:8}}>
              <button onClick={()=>setEditing(null)}
                style={{height:38,padding:"0 14px",background:"transparent",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                style={{flex:1,height:38,background:"linear-gradient(135deg,#573ad2,#2e139e)",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                {saving ? <><i className="ti ti-loader spin" style={{fontSize:14}} aria-hidden="true"></i>Saving...</> : <><i className="ti ti-check" style={{fontSize:14}} aria-hidden="true"></i>Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    <div id="servicetype-table">
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:"1.25rem"}}>
        {[
          { label:"Total Types", value:data.length, color:"#a0f87f" },
          { label:"With Fees",   value:data.filter(r=>parseFloat(r.ServiceFees||0)>0).length, color:"#fbbf24" },
          { label:"With Discount", value:data.filter(r=>parseFloat(r.Discount||0)>0).length, color:"#38bdf8" },
        ].map(k => (
          <div key={k.label} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)",padding:"1rem 1.25rem"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:4}}>{k.label}</div>
            <div style={{fontSize:26,fontWeight:700,color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-settings" style={{fontSize:18,color:"#a0f87f"}} aria-hidden="true"></i>
          <span style={{fontSize:15,fontWeight:600,color:"#fff"}}>Service Types</span>
          <span style={{fontSize:12,background:"rgba(160,248,127,0.12)",color:"#a0f87f",borderRadius:20,padding:"2px 10px",fontWeight:500}}>{filtered.length}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{position:"relative"}}>
            <i className="ti ti-search" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"rgba(255,255,255,0.25)"}} aria-hidden="true"></i>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search..."
              style={{paddingLeft:28,paddingRight:10,height:34,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,outline:"none",width:180,color:"#fff"}}/>
          </div>
          <button onClick={load} disabled={loading}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#573ad2",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className={`ti ti-refresh${loading?" spin":""}`} style={{fontSize:14}} aria-hidden="true"></i>Refresh
          </button>
          <ExportButtons exportId="servicetype-table" filename="ServiceTypes" excelData={filtered} excelColumns={excelColumns}/>
        </div>
      </div>

      {/* Table */}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
        {loading
          ? <div style={{padding:"3rem",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>
              <i className="ti ti-loader spin" style={{fontSize:28,display:"block",marginBottom:8}} aria-hidden="true"></i>Loading...
            </div>
          : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                  <Th col="ServiceTypeID">#</Th>
                  <Th col="ServiceDescription">Description</Th>
                  <Th col="ServiceFees">Fees</Th>
                  <Th col="Discount">Discount</Th>
                  <Th col="LastMaintDate">Last Updated</Th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={5} style={{padding:"2rem",textAlign:"center",color:"rgba(255,255,255,0.25)"}}>No records found</td></tr>
                  : filtered.map(r => (
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(160,248,127,0.04)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{...td,color:"rgba(255,255,255,0.35)"}}>{r.ServiceTypeID}</td>
                      <td style={td}>
                        <span style={{background:"rgba(160,248,127,0.1)",color:"#a0f87f",borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:600}}>
                          {r.ServiceDescription}
                        </span>
                      </td>
                      <td style={td}>
                        {parseFloat(r.ServiceFees||0) > 0
                          ? <span style={{color:"#fbbf24",fontWeight:600}}>SYP {parseFloat(r.ServiceFees).toFixed(2)}</span>
                          : <span style={{color:"rgba(255,255,255,0.25)"}}>—</span>}
                      </td>
                      <td style={td}>
                        {parseFloat(r.Discount||0) > 0
                          ? <span style={{color:"#38bdf8",fontWeight:600}}>{parseFloat(r.Discount).toFixed(2)} SYP</span>
                          : <span style={{color:"rgba(255,255,255,0.25)"}}>—</span>}
                      </td>
                      <td style={{...td,color:"rgba(255,255,255,0.3)",fontSize:12}}>
                        {r.LastMaintDate ? new Date(r.LastMaintDate).toLocaleDateString() : "—"}
                      </td>
                      <td style={td}>
                        <button onClick={()=>openEdit(r)}
                          style={{display:"flex",alignItems:"center",gap:5,height:28,padding:"0 10px",background:"rgba(160,248,127,0.08)",color:"#a0f87f",border:"1px solid rgba(160,248,127,0.2)",borderRadius:7,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                          <i className="ti ti-pencil" style={{fontSize:12}} aria-hidden="true"></i>Edit
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
        }
      </div>
    </div>
    </div>
  );
}

const th = {padding:"10px 14px",textAlign:"left",fontWeight:700,color:"rgba(255,255,255,0.35)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"};
const td = {padding:"10px 14px",color:"rgba(255,255,255,0.7)",verticalAlign:"middle"};
