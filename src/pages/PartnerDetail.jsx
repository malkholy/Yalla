import { useState, useEffect } from "react";

const STATUS_STYLE = {
  "Active":           { background:"#dcfce7", color:"#15803d" },
  "InActive":         { background:"#fee2e2", color:"#dc2626" },
  "Approval Waiting": { background:"#fef9c3", color:"#a16207" },
};

const ORDER_STYLE = {
  "Completed":  { background:"#dcfce7", color:"#15803d" },
  "Pending":    { background:"#fef9c3", color:"#a16207" },
  "Canceled":   { background:"#fee2e2", color:"#dc2626" },
  "Delivered":  { background:"#e0f2fe", color:"#0369a1" },
  "Received":   { background:"#ede9fe", color:"#6d28d9" },
  "On The Way": { background:"#fef9c3", color:"#a16207" },
  "Arrived":    { background:"#dcfce7", color:"#15803d" },
  "Accepted":   { background:"#e0f2fe", color:"#0369a1" },
};

const ACTIONS = {
  "Approval Waiting": [
    { op:"Partner Approve",        label:"Approve",        icon:"ti-circle-check", style:{ background:"#16a34a", color:"#fff" }, modalIcon:"ti-circle-check", modalColor:"#dcfce7", modalIconColor:"#16a34a", btnClass:"success", desc:"This will activate the partner and grant them access to the platform." },
    { op:"Partner Reject",         label:"Reject",         icon:"ti-x",            style:{ background:"#fee2e2", color:"#dc2626" }, modalIcon:"ti-x", modalColor:"#fee2e2", modalIconColor:"#dc2626", btnClass:"danger", desc:"This will reject the partner application." },
  ],
  "Active": [
    { op:"Partner Rest Password",  label:"Reset Password", icon:"ti-lock-open",    style:{ background:"#ede9fe", color:"#6366f1" }, modalIcon:"ti-lock-open", modalColor:"#ede9fe", modalIconColor:"#6366f1", btnClass:"info", desc:"A new password will be generated and sent to the partner's mobile." },
    { op:"Partner Block",          label:"Block",          icon:"ti-ban",          style:{ background:"#fee2e2", color:"#dc2626" }, modalIcon:"ti-ban", modalColor:"#fee2e2", modalIconColor:"#dc2626", btnClass:"danger", desc:"This will block the partner and revoke their access immediately." },
  ],
  "InActive": [
    { op:"Partner Rest Password",  label:"Reset Password", icon:"ti-lock-open",    style:{ background:"#ede9fe", color:"#6366f1" }, modalIcon:"ti-lock-open", modalColor:"#ede9fe", modalIconColor:"#6366f1", btnClass:"info", desc:"A new password will be generated and sent to the partner's mobile." },
    { op:"Partner Un-Block",       label:"Un-Block",       icon:"ti-circle-check", style:{ background:"#dcfce7", color:"#16a34a" }, modalIcon:"ti-circle-check", modalColor:"#dcfce7", modalIconColor:"#16a34a", btnClass:"success", desc:"This will unblock the partner and restore their access." },
  ],
};

function ConfirmModal({ action, partner, onConfirm, onCancel, loading }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #e2e8f0",width:"100%",maxWidth:360,overflow:"hidden"}}>
        <div style={{padding:"1.25rem 1.25rem 0",display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:action.modalColor,color:action.modalIconColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
            <i className={`ti ${action.modalIcon}`} aria-hidden="true"></i>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:"#1e293b",marginBottom:4}}>{action.label} Partner</div>
            <div style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>{action.desc}</div>
          </div>
        </div>
        <div style={{padding:"1rem 1.25rem"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#f8fafc",borderRadius:20,padding:"4px 12px",fontSize:13,fontWeight:500,color:"#1e293b"}}>
            <i className="ti ti-user" style={{fontSize:13}} aria-hidden="true"></i>
            {partner.PartnerEnglishName}
          </div>
        </div>
        <div style={{padding:"1rem 1.25rem",borderTop:"0.5px solid #e2e8f0",display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onCancel} disabled={loading}
            style={{height:36,padding:"0 16px",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",border:"0.5px solid #e2e8f0",background:"#fff",color:"#475569"}}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{height:36,padding:"0 16px",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",border:"none",background:action.modalIconColor,color:"#fff",display:"flex",alignItems:"center",gap:6}}>
            {loading
              ? <><i className="ti ti-loader spin" style={{fontSize:14}} aria-hidden="true"></i>Processing...</>
              : <><i className={`ti ${action.modalIcon}`} style={{fontSize:14}} aria-hidden="true"></i>{action.label}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PartnerDetail({ partner: initialPartner, onBack, onRefresh, apiCall }) {
  const [partner, setPartner]     = useState(initialPartner);
  const [tab, setTab]             = useState("info");
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [modal, setModal]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const d = await apiCall({ Operation: "Get Partners", LineData: String(partner.PartnerID) });
        setOrders(d?.List1 || []);
      } catch {}
      setLoading(false);
    }
    loadOrders();
  }, [partner.PartnerID]);

  async function handleAction() {
    setActionLoading(true);
    try {
      const d = await apiCall({ Operation: modal.op, LineData: String(partner.PartnerID) });
      const row = d?.List?.[0] || d?.List0?.[0];
      if (row?.State === 0 || row?.State === undefined) {
        showToast("success", `${modal.label} completed successfully`);
        // Update partner status locally
        const newStatus =
          modal.op === "Partner Approve"      ? "Active"   :
          modal.op === "Partner Reject"       ? "InActive" :
          modal.op === "Partner Block"        ? "InActive" :
          modal.op === "Partner Un-Block"     ? "Active"   :
          partner.Status;
        setPartner(prev => ({ ...prev, Status: newStatus }));
        if (onRefresh) onRefresh(); onBack();
      } else {
        showToast("error", row?.Message || "Operation failed");
      }
    } catch {
      showToast("error", "Connection error — check API");
    }
    setActionLoading(false);
    setModal(null);
  }

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  const initials = (partner.PartnerEnglishName || "?").slice(0,2).toUpperCase();
  const hasCoords = partner.Latitude && partner.Longitude && partner.Latitude !== "" && partner.Longitude !== "";
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(partner.Longitude)-0.01},${parseFloat(partner.Latitude)-0.01},${parseFloat(partner.Longitude)+0.01},${parseFloat(partner.Latitude)+0.01}&layer=mapnik&marker=${partner.Latitude},${partner.Longitude}`
    : "";
  const actions = ACTIONS[partner.Status] || [];

  return (
    <div style={{position:"relative"}}>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,right:20,zIndex:2000,background:toast.type==="success"?"#16a34a":"#dc2626",color:"#fff",borderRadius:8,padding:"10px 16px",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:8}}>
          <i className={`ti ${toast.type==="success"?"ti-circle-check":"ti-alert-circle"}`} style={{fontSize:16}} aria-hidden="true"></i>
          {toast.message}
        </div>
      )}

      {/* Confirm Modal */}
      {modal && (
        <ConfirmModal
          action={modal}
          partner={partner}
          onConfirm={handleAction}
          onCancel={()=>setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Breadcrumb */}
      <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#94a3b8",marginBottom:"1.25rem"}}>
        <span onClick={onBack} style={{color:"#6366f1",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
          <i className="ti ti-users" style={{fontSize:14}} aria-hidden="true"></i>
          Partners
        </span>
        <i className="ti ti-chevron-right" style={{fontSize:12}} aria-hidden="true"></i>
        <span style={{color:"#1e293b",fontWeight:500}}>{partner.PartnerEnglishName}</span>
      </div>

      {/* Hero */}
      <div style={{background:"#0f2d5a",borderRadius:12,padding:"1.5rem",display:"flex",alignItems:"center",gap:"1.25rem",marginBottom:"1rem"}}>
        {partner.ProfileImage
          ? <img src={partner.ProfileImage} alt="" style={{width:64,height:64,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.15)"}}
              onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
          : null}
        <div style={{width:64,height:64,borderRadius:"50%",background:"#ede9fe",display:partner.ProfileImage?"none":"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#6d28d9",flexShrink:0}}>
          {initials}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:600,color:"#fff",marginBottom:4}}>{partner.PartnerEnglishName}</div>
          <div style={{display:"flex",gap:14,fontSize:12,color:"rgba(255,255,255,0.5)"}}>
            <span><i className="ti ti-hash" style={{fontSize:12,marginRight:3}} aria-hidden="true"></i>ID: {partner.PartnerID}</span>
            <span><i className="ti ti-phone" style={{fontSize:12,marginRight:3}} aria-hidden="true"></i>{partner.MobileNo||"—"}</span>
            {partner.LastMaintDate && <span><i className="ti ti-calendar" style={{fontSize:12,marginRight:3}} aria-hidden="true"></i>{new Date(partner.LastMaintDate).toLocaleDateString()}</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <span style={{...(STATUS_STYLE[partner.Status]||{}),borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:500}}>{partner.Status}</span>
          {actions.map(a => (
            <button key={a.op} onClick={()=>setModal(a)}
              style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 14px",...a.style,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer"}}>
              <i className={`ti ${a.icon}`} style={{fontSize:14}} aria-hidden="true"></i>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden",marginBottom:"1rem"}}>
        {[
          { key:"info",     icon:"ti-info-circle",    label:"Info" },
          { key:"orders",   icon:"ti-clipboard-list", label:"Orders" },
          { key:"location", icon:"ti-map-pin",        label:"Location" },
        ].map(t => (
          <div key={t.key} onClick={()=>setTab(t.key)}
            style={{flex:1,padding:"10px",textAlign:"center",fontSize:13,cursor:"pointer",
              color:tab===t.key?"#6366f1":"#64748b",
              fontWeight:tab===t.key?500:400,
              background:tab===t.key?"#f8f7ff":"transparent",
              borderBottom:tab===t.key?"2px solid #6366f1":"2px solid transparent"}}>
            <i className={`ti ${t.icon}`} style={{fontSize:14,marginRight:5}} aria-hidden="true"></i>
            {t.label}
          </div>
        ))}
      </div>

      {/* Info Tab */}
      {tab === "info" && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:"1.25rem"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"1rem"}}>Contact details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={infoItem}>
              <div style={infoLabel}><i className="ti ti-phone" style={{fontSize:11,marginRight:3}} aria-hidden="true"></i>Mobile</div>
              <div style={infoValue}>{partner.MobileNo||"—"}</div>
            </div>
            <div style={infoItem}>
              <div style={infoLabel}><i className="ti ti-calendar" style={{fontSize:11,marginRight:3}} aria-hidden="true"></i>Last update</div>
              <div style={infoValue}>{partner.LastMaintDate ? new Date(partner.LastMaintDate).toLocaleDateString() : "—"}</div>
            </div>
            <div style={{...infoItem,gridColumn:"span 2"}}>
              <div style={infoLabel}><i className="ti ti-map-pin" style={{fontSize:11,marginRight:3}} aria-hidden="true"></i>Address</div>
              <div style={{...infoValue,fontWeight:400,color:"#64748b",fontSize:12}}>{partner.PartnerAddress||"—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden"}}>
          {loading
            ? <div style={{padding:"3rem",textAlign:"center",color:"#94a3b8"}}>
                <i className="ti ti-loader spin" style={{fontSize:24,display:"block",marginBottom:8}} aria-hidden="true"></i>
                Loading orders...
              </div>
            : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
                    <th style={th}>Request No</th>
                    <th style={th}>Client</th>
                    <th style={th}>Request Date</th>
                    <th style={th}>Completed</th>
                    <th style={th}>Rating</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0
                    ? <tr><td colSpan={6} style={{padding:"2rem",textAlign:"center",color:"#94a3b8"}}>No orders found</td></tr>
                    : orders.map(o => (
                      <tr key={o.RequestNo} style={{borderBottom:"1px solid #f1f5f9"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#f8f7ff"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{...td,fontWeight:500,color:"#6366f1"}}>#{o.RequestNo}</td>
                        <td style={td}>{o.ClientName}</td>
                        <td style={{...td,color:"#94a3b8"}}>{o.RequestDate ? new Date(o.RequestDate).toLocaleDateString() : "—"}</td>
                        <td style={{...td,color:"#94a3b8"}}>{o.CompletedDate ? new Date(o.CompletedDate).toLocaleDateString() : "—"}</td>
                        <td style={td}>
                          {o.RankValue > 0
                            ? <span style={{display:"flex",alignItems:"center",gap:3,color:"#f59e0b"}}>
                                <i className="ti ti-star" style={{fontSize:13}} aria-hidden="true"></i>
                                {o.RankValue}
                              </span>
                            : <span style={{color:"#94a3b8"}}>—</span>}
                        </td>
                        <td style={td}>
                          <span style={{...(ORDER_STYLE[o.Status||""]||{background:"#f1f5f9",color:"#64748b"}),borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:500}}>
                            {o.Status||"—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          }
        </div>
      )}

      {/* Location Tab */}
      {tab === "location" && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:"1.25rem"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"1rem"}}>Location</div>
          {hasCoords
            ? <iframe src={mapSrc} style={{width:"100%",height:280,borderRadius:8,border:"1px solid #e2e8f0",marginBottom:"1rem"}} title="Partner location"></iframe>
            : <div style={{background:"#f8fafc",borderRadius:8,height:120,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:13,border:"1px dashed #e2e8f0",marginBottom:"1rem"}}>
                <i className="ti ti-map-off" style={{fontSize:20,marginRight:8}} aria-hidden="true"></i>
                No coordinates available
              </div>
          }
          <div style={{background:"#f8fafc",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"flex-start",gap:8}}>
            <i className="ti ti-map-pin" style={{fontSize:15,color:"#6366f1",marginTop:1,flexShrink:0}} aria-hidden="true"></i>
            <span style={{fontSize:13,color:"#475569"}}>{partner.PartnerAddress||"No address available"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const infoItem  = { background:"#f8fafc", borderRadius:8, padding:"10px 12px" };
const infoLabel = { fontSize:11, color:"#94a3b8", marginBottom:3 };
const infoValue = { fontSize:13, fontWeight:500, color:"#1e293b" };
const th = { padding:"10px 14px", textAlign:"left", fontWeight:600, color:"#475569", fontSize:12, textTransform:"uppercase", letterSpacing:"0.05em" };
const td = { padding:"10px 14px", color:"#334155", verticalAlign:"middle" };
