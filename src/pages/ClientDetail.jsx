import { useState, useEffect } from "react";

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

export default function ClientDetail({ client, onBack, apiCall }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const d = await apiCall({ Operation: "Get Clients", LineData: String(client.ClientID) });
        setOrders(d?.List1 || d?.List || []);
      } catch {}
      setLoading(false);
    }
    loadOrders();
  }, [client.ClientID]);

  const initials = (client.ClientName || "?").slice(0,2).toUpperCase();
  const totalAmount = orders.reduce((sum, o) => sum + (parseFloat(o.TotalAmount) || 0), 0);
  const completedOrders = orders.filter(o => o.Status === "Completed").length;
  const avgRating = orders.filter(o => o.RankValue > 0).length
    ? (orders.reduce((sum, o) => sum + (o.RankValue || 0), 0) / orders.filter(o => o.RankValue > 0).length).toFixed(1)
    : "—";

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#94a3b8",marginBottom:"1.25rem"}}>
        <span onClick={onBack} style={{color:"#6366f1",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
          <i className="ti ti-building" style={{fontSize:14}} aria-hidden="true"></i>
          Clients
        </span>
        <i className="ti ti-chevron-right" style={{fontSize:12}} aria-hidden="true"></i>
        <span style={{color:"#1e293b",fontWeight:500}}>{client.ClientName}</span>
      </div>

      {/* Hero */}
      <div style={{background:"#0f2d5a",borderRadius:12,padding:"1.5rem",display:"flex",alignItems:"center",gap:"1.25rem",marginBottom:"1rem"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#0369a1",flexShrink:0}}>
          {initials}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:600,color:"#fff",marginBottom:4}}>{client.ClientName}</div>
          <div style={{display:"flex",gap:14,fontSize:12,color:"rgba(255,255,255,0.5)"}}>
            <span><i className="ti ti-hash" style={{fontSize:12,marginRight:3}} aria-hidden="true"></i>ID: {client.ClientID}</span>
            <span><i className="ti ti-phone" style={{fontSize:12,marginRight:3}} aria-hidden="true"></i>{client.ClientMobile||"—"}</span>
          </div>
        </div>
        {/* KPIs in hero */}
        <div style={{display:"flex",gap:12}}>
          {[
            { label:"Total Orders",   value:orders.length,    color:"#818cf8" },
            { label:"Completed",      value:completedOrders,  color:"#86efac" },
            { label:"Avg Rating",     value:avgRating,        color:"#fcd34d" },
            { label:"Total Amount",   value:totalAmount.toLocaleString(), color:"#67e8f9" },
          ].map(k => (
            <div key={k.label} style={{background:"rgba(255,255,255,0.08)",borderRadius:8,padding:"8px 14px",textAlign:"center",minWidth:80}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:3}}>{k.label}</div>
              <div style={{fontSize:16,fontWeight:700,color:k.color}}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-clipboard-list" style={{fontSize:16,color:"#6366f1"}} aria-hidden="true"></i>
          <span style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>Orders</span>
          <span style={{fontSize:12,background:"#ede9fe",color:"#6d28d9",borderRadius:20,padding:"2px 10px",fontWeight:500}}>{orders.length}</span>
        </div>
        {loading
          ? <div style={{padding:"3rem",textAlign:"center",color:"#94a3b8"}}>
              <i className="ti ti-loader spin" style={{fontSize:24,display:"block",marginBottom:8}} aria-hidden="true"></i>
              Loading orders...
            </div>
          : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
                  <th style={th}>Request No</th>
                  <th style={th}>Date</th>
                  <th style={th}>Service</th>
                  <th style={th}>Category</th>
                  <th style={th}>Brand</th>
                  <th style={th}>Type</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Rating</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0
                  ? <tr><td colSpan={8} style={{padding:"2rem",textAlign:"center",color:"#94a3b8"}}>No orders found</td></tr>
                  : orders.map(o => (
                    <tr key={o.RequestNo} style={{borderBottom:"1px solid #f1f5f9"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8f7ff"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{...td,fontWeight:500,color:"#6366f1"}}>#{o.RequestNo}</td>
                      <td style={{...td,color:"#94a3b8"}}>{o.RequestDate ? new Date(o.RequestDate).toLocaleDateString() : "—"}</td>
                      <td style={td}>{o.ServiceDescription||"—"}</td>
                      <td style={td}>{o.ProductCat1||"—"}</td>
                      <td style={td}>{o.BrandName||"—"}</td>
                      <td style={td}>
                        {o.ProductBrandNme
                          ? <span style={{background:"#f1f5f9",color:"#475569",borderRadius:20,padding:"2px 8px",fontSize:12}}>{o.ProductBrandNme}</span>
                          : "—"}
                      </td>
                      <td style={{...td,fontWeight:500,color:"#1e293b"}}>
                        {o.TotalAmount ? parseFloat(o.TotalAmount).toLocaleString() : "—"}
                      </td>
                      <td style={td}>
                        {o.RankValue > 0
                          ? <span style={{display:"flex",alignItems:"center",gap:3,color:"#f59e0b"}}>
                              <i className="ti ti-star" style={{fontSize:13}} aria-hidden="true"></i>
                              {o.RankValue}
                            </span>
                          : <span style={{color:"#94a3b8"}}>—</span>}
                      </td>
                      <td style={td}>
                        <span style={{...(ORDER_STYLE[o.Status?.trim()]||{background:"#f1f5f9",color:"#64748b"}),borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:500}}>
                          {o.Status?.trim()||"—"}
                        </span>
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

const th = {padding:"10px 14px",textAlign:"left",fontWeight:600,color:"#475569",fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em"};
const td = {padding:"10px 14px",color:"#334155",verticalAlign:"middle"};
