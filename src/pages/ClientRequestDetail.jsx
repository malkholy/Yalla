import { useState, useEffect, useCallback } from "react";

const STATE_STYLE = {
  "Completed":  { background:"rgba(160,248,127,0.15)", color:"#a0f87f" },
  "Pending":    { background:"rgba(251,191,36,0.15)",  color:"#fbbf24" },
  "Canceled":   { background:"rgba(248,113,113,0.15)", color:"#f87171" },
  "Canceled ":  { background:"rgba(248,113,113,0.15)", color:"#f87171" },
  "Delivered":  { background:"rgba(56,189,248,0.15)",  color:"#38bdf8" },
  "Received":   { background:"rgba(192,132,252,0.15)", color:"#c084fc" },
  "On The Way": { background:"rgba(251,191,36,0.15)",  color:"#fbbf24" },
  "Arrived":    { background:"rgba(160,248,127,0.15)", color:"#a0f87f" },
  "Accepted":   { background:"rgba(56,189,248,0.15)",  color:"#38bdf8" },
};


const BRAND_LOGOS = {
  "IPHONE":  "https://logo.clearbit.com/apple.com",
  "APPLE":   "https://logo.clearbit.com/apple.com",
  "SAMSUNG": "https://logo.clearbit.com/samsung.com",
  "HONOR":   "https://logo.clearbit.com/honor.com",
  "XIAOMI":  "https://logo.clearbit.com/xiaomi.com",
  "HUAWEI":  "https://logo.clearbit.com/huawei.com",
  "OPPO":    "https://logo.clearbit.com/oppo.com",
  "VIVO":    "https://logo.clearbit.com/vivo.com",
  "REALME":  "https://logo.clearbit.com/realme.com",
  "NOKIA":   "https://logo.clearbit.com/nokia.com",
  "MOTOROLA":"https://logo.clearbit.com/motorola.com",
  "LG":      "https://logo.clearbit.com/lg.com",
  "SONY":    "https://logo.clearbit.com/sony.com",
  "HTC":     "https://logo.clearbit.com/htc.com",
  "INFINIX": "https://logo.clearbit.com/infinixmobility.com",
  "TECNO":   "https://logo.clearbit.com/tecno-mobile.com",
  "ONEPLUS":  "https://logo.clearbit.com/oneplus.com",
};

function BrandLogo({ brand }) {
  const [err, setErr] = useState(false);
  const url = BRAND_LOGOS[(brand||"").toUpperCase()];
  if (!url || err) return (
    <div style={{width:40,height:40,borderRadius:10,background:"rgba(160,248,127,0.1)",border:"1px solid rgba(160,248,127,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#a0f87f",flexShrink:0}}>
      {(brand||"?").slice(0,2).toUpperCase()}
    </div>
  );
  return (
    <div style={{width:40,height:40,borderRadius:10,background:"#fff",border:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",padding:4}}>
      <img src={url} alt={brand} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={()=>setErr(true)}/>
    </div>
  );
}

function InfoItem({ icon, label, value, full }) {
  return (
    <div style={{gridColumn: full ? "span 2" : "span 1", background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"10px 12px", border:"1px solid rgba(255,255,255,0.07)"}}>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
        <i className={"ti "+icon} style={{fontSize:11}} aria-hidden="true"></i>{label}
      </div>
      <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{value||"—"}</div>
    </div>
  );
}

function Timeline({ r }) {
  const steps = [
    { label:"Request",    date:r.RequestDate,       icon:"ti-file-plus",      color:"#a0f87f" },
    { label:"Accepted",   date:r.GetPartnertDate,   icon:"ti-circle-check",   color:"#38bdf8" },
    { label:"On The Way", date:r.OnWayDate,          icon:"ti-motorbike",      color:"#fbbf24" },
    { label:"Arrived",    date:r.ArrivedDate,        icon:"ti-map-pin",        color:"#c084fc" },
    { label:"Received",   date:r.RecievedDate,       icon:"ti-package",        color:"#a0f87f" },
    { label:"Fixed",      date:r.FixedDate,          icon:"ti-tool",           color:"#38bdf8" },
    { label:"Delivered",  date:r.DeliveredDate,      icon:"ti-truck-delivery", color:"#fbbf24" },
    { label:"Completed",  date:r.CompletedDate,      icon:"ti-star",           color:"#a0f87f" },
  ];
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:0,overflowX:"auto",paddingBottom:8}}>
      {steps.map((s,i) => (
        <div key={s.label} style={{display:"flex",alignItems:"flex-start",flex:1,minWidth:80}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
            <div style={{width:32,height:32,borderRadius:"50%",
              background: s.date ? s.color+"26" : "rgba(255,255,255,0.05)",
              border: s.date ? "2px solid "+s.color : "2px solid rgba(255,255,255,0.1)",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className={"ti "+s.icon} style={{fontSize:14,color: s.date ? s.color : "rgba(255,255,255,0.2)"}} aria-hidden="true"></i>
            </div>
            <div style={{fontSize:10,color: s.date ? "#fff" : "rgba(255,255,255,0.25)",marginTop:6,textAlign:"center",fontWeight: s.date?500:400}}>
              {s.label}
            </div>
            {s.date && (
              <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:2,textAlign:"center"}}>
                {new Date(s.date).toLocaleDateString()}
              </div>
            )}
          </div>
          {i < steps.length-1 && (
            <div style={{height:2,flex:1,marginTop:15,
              background: s.date ? "rgba(160,248,127,0.3)" : "rgba(255,255,255,0.07)"}}></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ClientRequestDetail({ request: initial, onBack, onRefresh, apiCall }) {
  const [r, setR]           = useState(initial);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]         = useState("info");
  const [serviceTypes, setServiceTypes] = useState([]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const d = await apiCall({ Operation: "Get Clients Requests", LineData: String(initial.RequestNo) });
      const updatedRequest = d?.List?.[0] || d?.List0?.[0];
      if (updatedRequest) {
        setR(updatedRequest);
        if (isRefresh && onRefresh) {
          onRefresh();
        }
      }

      const s = await apiCall({ Operation: "Get Service Type" });
      if (s?.List) setServiceTypes(s.List);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [initial.RequestNo, apiCall, onRefresh]);

  useEffect(() => {
    setR(initial);
  }, [initial]);

  useEffect(() => {
    load();
  }, [load]);

  const status = r.StateDescription?.trim();
  const hasCoords = r.Expr2 && r.Expr3 && r.Expr2 !== "" && r.Expr3 !== "";

  const serviceTypeObj = serviceTypes.find(t => t.ServiceTypeID === r.ServiceTypeID);
  const serviceTypeName = serviceTypeObj ? serviceTypeObj.ServiceName : "—";
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(r.Expr3)-0.01},${parseFloat(r.Expr2)-0.01},${parseFloat(r.Expr3)+0.01},${parseFloat(r.Expr2)+0.01}&layer=mapnik&marker=${r.Expr2},${r.Expr3}`
    : "";

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:12,color:"rgba(255,255,255,0.3)"}}>
      <i className="ti ti-loader spin" style={{fontSize:32}} aria-hidden="true"></i>
      <p style={{fontSize:13}}>Loading request details...</p>
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,fontSize:13,color:"rgba(255,255,255,0.3)",marginBottom:"1.25rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span onClick={onBack} style={{color:"#a0f87f",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <i className="ti ti-clipboard-list" style={{fontSize:14}} aria-hidden="true"></i>
            Client Requests
          </span>
          <i className="ti ti-chevron-right" style={{fontSize:12}} aria-hidden="true"></i>
          <span style={{color:"#fff",fontWeight:500}}>#{r.RequestNo}</span>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading || refreshing}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            color: "#fff",
            padding: "4px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: 500,
            transition: "all 0.2s ease",
            outline: "none"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          }}
        >
          <i className={`ti ti-refresh ${refreshing ? "spin" : ""}`} style={{fontSize: 12}} aria-hidden="true"></i>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#2e139e,#152338)",borderRadius:12,padding:"1.25rem 1.5rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <BrandLogo brand={r.BrandName}/>
            <div>
              <div style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:4}}>#{r.RequestNo}</div>
              <div style={{display:"flex",gap:12,fontSize:12,color:"rgba(255,255,255,0.4)",flexWrap:"wrap"}}>
                <span><i className="ti ti-calendar" style={{fontSize:11,marginRight:3}} aria-hidden="true"></i>
                  {r.RequestDate ? new Date(r.RequestDate).toLocaleString() : "—"}
                </span>
                <span><i className="ti ti-user" style={{fontSize:11,marginRight:3}} aria-hidden="true"></i>{r.ClientName}</span>
                <span><i className="ti ti-phone" style={{fontSize:11,marginRight:3}} aria-hidden="true"></i>{r.ClientMobile}</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{...(STATE_STYLE[status]||{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)"}),borderRadius:20,padding:"5px 14px",fontSize:13,fontWeight:600}}>
              {status}
            </span>
            {r.RankValue > 0 && (
              <span style={{display:"flex",alignItems:"center",gap:4,background:"rgba(251,191,36,0.12)",color:"#fbbf24",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:600}}>
                <i className="ti ti-star" style={{fontSize:14}} aria-hidden="true"></i>{r.RankValue}
              </span>
            )}
            <span style={{background:"rgba(56,189,248,0.12)",color:"#38bdf8",borderRadius:20,padding:"5px 14px",fontSize:13,fontWeight:600}}>
              {parseFloat(r.TotalAmount||0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",padding:"1.25rem",marginBottom:"1rem"}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem"}}>Request Timeline</div>
        <Timeline r={r}/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:"1rem"}}>
        {[
          {key:"info",    icon:"ti-info-circle",  label:"Details"},
          {key:"product", icon:"ti-device-mobile", label:"Product"},
          {key:"partner", icon:"ti-users",         label:"Partner"},
          {key:"location",icon:"ti-map-pin",       label:"Location"},
        ].map(t => (
          <div key={t.key} onClick={()=>setTab(t.key)}
            style={{flex:1,padding:"10px",textAlign:"center",fontSize:13,cursor:"pointer",
              color: tab===t.key?"#a0f87f":"rgba(255,255,255,0.4)",
              fontWeight: tab===t.key?600:400,
              background: tab===t.key?"rgba(160,248,127,0.08)":"transparent",
              borderBottom: tab===t.key?"2px solid #a0f87f":"2px solid transparent"}}>
            <i className={"ti "+t.icon} style={{fontSize:14,marginRight:5}} aria-hidden="true"></i>{t.label}
          </div>
        ))}
      </div>

      {/* Details Tab */}
      {tab==="info" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <InfoItem icon="ti-user"        label="Client"         value={r.ClientName}/>
          <InfoItem icon="ti-phone"       label="Client Mobile"  value={r.ClientMobile}/>
          <InfoItem icon="ti-tools"       label="Service Type"   value={serviceTypeName}/>
          <InfoItem icon="ti-notes"       label="Service Description" value={r.ServiceDescription}/>
          <InfoItem icon="ti-tag"         label="Service Level"  value={r.TypeDescription||r.ServiceDescription}/>
          <InfoItem icon="ti-map-pin"     label="Client Address" value={r.ClientAddress} full/>
          <InfoItem icon="ti-notes"       label="Client Note"    value={r.ClientNote} full/>
          <InfoItem icon="ti-notes"       label="Completion Note" value={r.ClientCompleteNote} full/>
          {(r.CancelReason || status?.toLowerCase().includes("cancel")) && (
            <InfoItem icon="ti-alert-triangle" label="Cancel Reason" value={r.CancelReason} full/>
          )}
          <InfoItem icon="ti-cash"        label="Item Amount"    value={parseFloat(r.ItemAmount||0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/>
          <InfoItem icon="ti-cash"        label="Fees Amount"    value={parseFloat(r.FeesAmount||0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/>
          <InfoItem icon="ti-discount"    label="Discount"       value={parseFloat(r.DiscountAmount||0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/>
          <InfoItem icon="ti-coin"        label="Total Amount"   value={parseFloat(r.TotalAmount||0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/>
        </div>
      )}

      {/* Product Tab */}
      {tab==="product" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <InfoItem icon="ti-barcode"     label="Product ID"     value={r.ProductID}/>
          <InfoItem icon="ti-category"    label="Category"       value={r.ProductCat1}/>
          <InfoItem icon="ti-device-mobile" label="Brand"        value={r.BrandName}/>
          <InfoItem icon="ti-device-mobile" label="Model"        value={r.ProductModel}/>
          <InfoItem icon="ti-palette"     label="Color"          value={r.ProductColor}/>
          <InfoItem icon="ti-box"         label="Supplier"       value={r.ProductBrandNme}/>
          <InfoItem icon="ti-info-circle" label="Extra Info"     value={r.ExtrInfo}/>
          <InfoItem icon="ti-battery"     label="Battery Part"   value={r.BatteryPartNumber}/>
          <InfoItem icon="ti-coin"        label="Price"          value={parseFloat(r.Price||0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/>
          <InfoItem icon="ti-device-tablet" label="Type"         value={r.ProductType}/>
        </div>
      )}

      {/* Partner Tab */}
      {tab==="partner" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <InfoItem icon="ti-users"       label="Partner Name"   value={r.PartnerEnglishName}/>
          <InfoItem icon="ti-phone"       label="Partner Mobile" value={r.PartnerMobile}/>
          <InfoItem icon="ti-map-pin"     label="Partner Address" value={r.PartnerAddress} full/>
          <InfoItem icon="ti-calendar"    label="Assigned Date"  value={r.GetPartnertDate ? new Date(r.GetPartnertDate).toLocaleString() : "—"}/>
          <InfoItem icon="ti-user"        label="Created By"     value={r.CreatedBy}/>
          <InfoItem icon="ti-calendar"    label="Created Date"   value={r.CreatedDate ? new Date(r.CreatedDate).toLocaleString() : "—"}/>
        </div>
      )}

      {/* Location Tab */}
      {tab==="location" && (() => {
        const cLat = parseFloat(r.Expr2);
        const cLng = parseFloat(r.Expr3);
        const pLat = parseFloat(r.Latitude);
        const pLng = parseFloat(r.Longitude);
        const hasClient  = r.Expr2 && r.Expr2 !== "" && !isNaN(cLat);
        const hasPartner = r.Latitude && r.Latitude !== "" && !isNaN(pLat);

        const leafletHTML = `<!DOCTYPE html><html><head>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
          <style>*{margin:0;padding:0;}#map{width:100%;height:100vh;}</style>
        </head><body><div id="map"></div><script>
          const points=[];
          ${hasClient  ? `points.push({lat:${cLat},lng:${cLng},label:'Client',color:'#a0f87f'});`  : ''}
          ${hasPartner ? `points.push({lat:${pLat},lng:${pLng},label:'Partner',color:'#38bdf8'});` : ''}
          if(!points.length){document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;font-family:sans-serif">No coordinates</div>';}
          else {
            const map=L.map('map');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'OSM'}).addTo(map);
            const bounds=[];
            points.forEach(p=>{
              const icon=L.divIcon({html:'<div style="width:32px;height:32px;border-radius:50%;background:'+p.color+';border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#0e1520;">'+p.label[0]+'</div>',iconSize:[32,32],iconAnchor:[16,16],className:''});
              L.marker([p.lat,p.lng],{icon}).addTo(map).bindPopup('<b>'+p.label+'</b>').openPopup();
              bounds.push([p.lat,p.lng]);
            });
            if(bounds.length===1) map.setView(bounds[0],15);
            else map.fitBounds(bounds,{padding:[40,40]});
            window.addEventListener('message',e=>{if(e.data&&e.data.type==='flyTo')map.flyTo([e.data.lat,e.data.lng],17,{animate:true,duration:1});});
          }
        <\/script></body></html>`;

        return (
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",padding:"1.25rem"}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem"}}>Locations</div>
            <iframe id="yf-map" srcDoc={leafletHTML}
              style={{width:"100%",height:320,borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",marginBottom:"1rem"}}
              title="Locations map"/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {hasClient && (
                <div onClick={()=>document.getElementById("yf-map")?.contentWindow?.postMessage({type:"flyTo",lat:cLat,lng:cLng},"*")}
                  style={{background:"rgba(160,248,127,0.05)",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer",border:"1px solid rgba(160,248,127,0.1)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(160,248,127,0.1)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(160,248,127,0.05)"}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"#a0f87f",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#0e1520",flexShrink:0,marginTop:1}}>C</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:2,display:"flex",justifyContent:"space-between"}}>
                      <span>CLIENT</span><span style={{color:"#a0f87f"}}>📍 Go to pin</span>
                    </div>
                    <span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>{r.ClientAddress||"No address"}</span>
                  </div>
                </div>
              )}
              {hasPartner && (
                <div onClick={()=>document.getElementById("yf-map")?.contentWindow?.postMessage({type:"flyTo",lat:pLat,lng:pLng},"*")}
                  style={{background:"rgba(56,189,248,0.05)",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer",border:"1px solid rgba(56,189,248,0.1)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(56,189,248,0.1)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(56,189,248,0.05)"}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"#38bdf8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#0e1520",flexShrink:0,marginTop:1}}>P</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:2,display:"flex",justifyContent:"space-between"}}>
                      <span>PARTNER</span><span style={{color:"#38bdf8"}}>📍 Go to pin</span>
                    </div>
                    <span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>{r.PartnerAddress||"No address"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
