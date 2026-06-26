import { useState, useEffect, useCallback } from "react";
import useSortable from "../hooks/useSortable.jsx";
import useKeyboardNav from "../hooks/useKeyboardNav.jsx";
import ClientRequestDetail from "./ClientRequestDetail.jsx";
import { ExportButtons } from "../components/PageWrapper.jsx";
import FilterDropdown from "../components/FilterDropdown.jsx";

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

export default function ClientRequests({ apiCall }) {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [filterState, setFilterState]   = useState(null);
  const [filterBrand, setFilterBrand]   = useState(null);
  const [filterService, setFilterService] = useState(null);
  const [selected, setSelected] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiCall({ Operation: "Get Clients Requests" });
      const rawRequests = d?.List || [];

      const s = await apiCall({ Operation: "Get Service Type" });
      const types = s?.List || [];
      setServiceTypes(types);

      const mapped = rawRequests.map(r => {
        const t = types.find(x => x.ServiceTypeID === r.ServiceTypeID);
        return {
          ...r,
          ServiceType: t ? t.ServiceName : "—"
        };
      });
      setData(mapped);
    } catch {}
    setLoading(false);
  }, [apiCall]);

  useEffect(() => { load(); }, [load]);

  const states   = [...new Set(data.map(r => r.StateDescription?.trim()).filter(Boolean))];
  const brands   = [...new Set(data.map(r => r.BrandName).filter(Boolean))];
  const services = [...new Set(data.map(r => r.ServiceDescription).filter(Boolean))];

  const { sorted, Th } = useSortable(data);
  // useKeyboardNav moved below filtered

  const filtered = sorted.filter(r => {
    const matchSearch =
      String(r.RequestNo||"").includes(search) ||
      (r.ClientName||"").toLowerCase().includes(search.toLowerCase()) ||
      (r.PartnerEnglishName||"").toLowerCase().includes(search.toLowerCase()) ||
      (r.ServiceType||"").toLowerCase().includes(search.toLowerCase()) ||
      (r.ProductModel||"").toLowerCase().includes(search.toLowerCase());
    const matchState   = !filterState   || filterState.includes(r.StateDescription?.trim());
    const matchBrand   = !filterBrand   || filterBrand.includes(r.BrandName);
    const matchService = !filterService || filterService.includes(r.ServiceDescription);
    return matchSearch && matchState && matchBrand && matchService;
  });
  const { rowProps } = useKeyboardNav(filtered, setSelected);

  // KPIs
  const total      = data.length;
  const completed  = data.filter(r => r.StateDescription?.trim() === "Completed").length;
  const pending    = data.filter(r => ["Pending","On The Way","Arrived","Accepted","Received"].includes(r.StateDescription?.trim())).length;
  const canceled   = data.filter(r => r.StateDescription?.trim().startsWith("Canceled")).length;
  const totalAmount = data.reduce((s,r) => s + (parseFloat(r.TotalAmount)||0), 0);

  const excelColumns = [
    {label:"Request No",  key:"RequestNo"},
    {label:"Date",        key:"RequestDate"},
    {label:"Client",      key:"ClientName"},
    {label:"Partner",     key:"PartnerEnglishName"},
    {label:"Service",     key:"ServiceDescription"},
    {label:"Service Type",key:"ServiceType"},
    {label:"Brand",       key:"BrandName"},
    {label:"Model",       key:"ProductModel"},
    {label:"Amount",      key:"TotalAmount"},
    {label:"Status",      key:"StateDescription"},
    {label:"Rating",      key:"RankValue"},
  ];

  if (selected) return <ClientRequestDetail request={selected} onBack={()=>setSelected(null)} onRefresh={load} apiCall={apiCall}/>
  return (
    <div id="requests-table">
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:"1.25rem"}}>
        {[
          { label:"Total Requests", value:total,                        color:"#a0f87f" },
          { label:"Completed",      value:completed,                    color:"#a0f87f" },
          { label:"In Progress",    value:pending,                      color:"#fbbf24" },
          { label:"Canceled",       value:canceled,                     color:"#f87171" },
          { label:"Total Amount",   value:totalAmount.toLocaleString(), color:"#38bdf8" },
        ].map(k => (
          <div key={k.label} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)",padding:"1rem 1.25rem"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:4}}>{k.label}</div>
            <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-clipboard-list" style={{fontSize:18,color:"#a0f87f"}} aria-hidden="true"></i>
          <span style={{fontSize:15,fontWeight:600,color:"#fff"}}>Client Requests</span>
          <span style={{fontSize:12,background:"rgba(160,248,127,0.12)",color:"#a0f87f",borderRadius:20,padding:"2px 10px",fontWeight:500}}>{filtered.length}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <div style={{position:"relative"}}>
            <i className="ti ti-search" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"rgba(255,255,255,0.25)"}} aria-hidden="true"></i>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search request, client, partner..."
              style={{paddingLeft:28,paddingRight:10,height:34,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,outline:"none",width:220,color:"#fff"}}/>
          </div>
          <FilterDropdown label="Status"  options={states}   selected={filterState || states}   onChange={setFilterState}/>
          <FilterDropdown label="Brand"   options={brands}   selected={filterBrand || brands}   onChange={setFilterBrand}/>
          <FilterDropdown label="Service" options={services} selected={filterService || services} onChange={setFilterService}/>
          <button onClick={load} disabled={loading}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#573ad2",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className={`ti ti-refresh${loading?" spin":""}`} style={{fontSize:14}} aria-hidden="true"></i>Refresh
          </button>
          <ExportButtons exportId="requests-table" filename="ClientRequests" excelData={filtered} excelColumns={excelColumns}/>
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
                  <Th col="RequestNo">Request No</Th>
                  <Th col="RequestDate">Date</Th>
                  <Th col="ClientName">Client</Th>
                  <Th col="PartnerEnglishName">Partner</Th>
                  <Th col="ServiceDescription">Service</Th>
                  <Th col="ServiceType">Service Type</Th>
                  <Th col="BrandName">Brand / Model</Th>
                  <Th col="TotalAmount">Amount</Th>
                  <Th col="RankValue">Rating</Th>
                  <Th col="StateDescription">Status</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={10} style={{padding:"2rem",textAlign:"center",color:"rgba(255,255,255,0.25)"}}>No records found</td></tr>
                  : filtered.map((r, i) => (
                    <tr key={i}
                      style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",background:"transparent"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(160,248,127,0.04)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      onClick={()=>setSelected(r)}>
                      <td style={{...td,fontWeight:600,color:"#a0f87f"}}>#{r.RequestNo}</td>
                      <td style={{...td,color:"rgba(255,255,255,0.4)",fontSize:12}}>
                        {r.RequestDate ? new Date(r.RequestDate).toLocaleDateString() : "—"}
                      </td>
                      <td style={td}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(160,248,127,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#a0f87f",flexShrink:0}}>
                            {(r.ClientName||"?").slice(0,2).toUpperCase()}
                          </div>
                          <span style={{fontWeight:500,color:"#fff"}}>{r.ClientName}</span>
                        </div>
                      </td>
                      <td style={{...td,color:"rgba(255,255,255,0.6)"}}>{r.PartnerEnglishName||"—"}</td>
                      <td style={td}>
                        <span style={{background:"rgba(192,132,252,0.1)",color:"#c084fc",borderRadius:20,padding:"3px 10px",fontSize:12}}>
                          {r.ServiceDescription||"—"}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{background:"rgba(56,189,248,0.1)",color:"#38bdf8",borderRadius:20,padding:"3px 10px",fontSize:12}}>
                          {r.ServiceType||"—"}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{fontWeight:500,color:"#fff"}}>{r.BrandName}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{r.ProductModel}</div>
                      </td>
                      <td style={{...td,fontWeight:600,color:"#fbbf24"}}>
                        {parseFloat(r.TotalAmount||0).toLocaleString()}
                      </td>
                      <td style={td}>
                        {r.RankValue > 0
                          ? <span style={{display:"flex",alignItems:"center",gap:3,color:"#fbbf24"}}>
                              <i className="ti ti-star" style={{fontSize:13}} aria-hidden="true"></i>{r.RankValue}
                            </span>
                          : <span style={{color:"rgba(255,255,255,0.25)"}}>—</span>}
                      </td>
                      <td style={td}>
                        <span style={{...(STATE_STYLE[r.StateDescription?.trim()]||{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)"}),borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:500}}>
                          {r.StateDescription?.trim()||"—"}
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

const th = {padding:"10px 14px",textAlign:"left",fontWeight:700,color:"rgba(255,255,255,0.35)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"};
const td = {padding:"10px 14px",color:"rgba(255,255,255,0.7)",verticalAlign:"middle"};
