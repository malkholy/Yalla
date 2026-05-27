import { useState, useEffect } from "react";
import { ExportButtons } from "../components/PageWrapper.jsx";
import FilterDropdown from "../components/FilterDropdown.jsx";

export default function Products({ apiCall }) {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [filterCat, setFilterCat] = useState([]);
  const [filterBrand, setFilterBrand] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const d = await apiCall({ Operation: "Get Products" });
      setData(d?.List || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { setFilterCat(cats.filter(c=>c!=="All")); setFilterBrand(brands.filter(b=>b!=="All")); }, [data.length]);

  const cats   = ["All", ...new Set(data.map(r => r.ProductCat1).filter(Boolean))];
  const brands = ["All", ...new Set(data.map(r => r.BrandName).filter(Boolean))];

  const filtered = data.filter(r => {
    const matchSearch = (r.ProductID||"").toLowerCase().includes(search.toLowerCase()) ||
      (r.ProductModel||"").toLowerCase().includes(search.toLowerCase()) ||
      (r.BrandName||"").toLowerCase().includes(search.toLowerCase());
    const matchCat   = filterCat.length === 0 || filterCat.includes(r.ProductCat1);
    const matchBrand = filterBrand.length === 0 || filterBrand.includes(r.BrandName);
    return matchSearch && matchCat && matchBrand;
  });

  const totalProducts = data.length;
  const totalBrands   = new Set(data.map(r => r.BrandName).filter(Boolean)).size;
  const totalCats     = new Set(data.map(r => r.ProductCat1).filter(Boolean)).size;
  const avgPrice      = data.length ? (data.reduce((s,r) => s + (parseFloat(r.Price)||0), 0) / data.length).toFixed(2) : "0";

  const excelColumns = [
    {label:"Product ID",  key:"ProductID"},
    {label:"Category",    key:"ProductCat1"},
    {label:"Type",        key:"ProductType"},
    {label:"Brand",       key:"BrandName"},
    {label:"Model",       key:"ProductModel"},
    {label:"Color",       key:"ProductColor"},
    {label:"Supplier",    key:"ProductBrandNme"},
    {label:"Price",       key:"Price"},
  ];

  return (
    <div id="products-table">
      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        {[
          { label:"Total Products", value:totalProducts, color:"#a0f87f" },
          { label:"Brands",         value:totalBrands,   color:"#38bdf8" },
          { label:"Categories",     value:totalCats,     color:"#c084fc" },
          { label:"Avg Price",      value:"$"+avgPrice,  color:"#fbbf24" },
        ].map(k => (
          <div key={k.label} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)",padding:"1rem 1.25rem"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:4}}>{k.label}</div>
            <div style={{fontSize:26,fontWeight:700,color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-box" style={{fontSize:18,color:"#a0f87f"}} aria-hidden="true"></i>
          <span style={{fontSize:15,fontWeight:600,color:"#fff"}}>Products</span>
          <span style={{fontSize:12,background:"rgba(160,248,127,0.12)",color:"#a0f87f",borderRadius:20,padding:"2px 10px",fontWeight:500}}>{filtered.length}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {/* Search */}
          <div style={{position:"relative"}}>
            <i className="ti ti-search" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"rgba(255,255,255,0.25)"}} aria-hidden="true"></i>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search product..."
              style={{paddingLeft:28,paddingRight:10,height:34,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,outline:"none",width:200,color:"#fff"}}/>
          </div>
          <FilterDropdown label="Category" options={cats.filter(c=>c!=="All")} selected={filterCat} onChange={setFilterCat}/>
          <FilterDropdown label="Brand" options={brands.filter(b=>b!=="All")} selected={filterBrand} onChange={setFilterBrand}/>
          {/* Refresh */}
          <button onClick={load} disabled={loading}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#573ad2",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className={`ti ti-refresh${loading?" spin":""}`} style={{fontSize:14}} aria-hidden="true"></i>Refresh
          </button>
          <ExportButtons exportId="products-table" filename="Products" excelData={filtered} excelColumns={excelColumns}/>
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
                  <th style={th}>Product ID</th>
                  <th style={th}>Category</th>
                  <th style={th}>Brand</th>
                  <th style={th}>Model</th>
                  <th style={th}>Type</th>
                  <th style={th}>Supplier</th>
                  <th style={th}>Color</th>
                  <th style={th}>Price</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={8} style={{padding:"2rem",textAlign:"center",color:"rgba(255,255,255,0.25)"}}>No records found</td></tr>
                  : filtered.map(r => (
                    <tr key={r.ProductID} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(160,248,127,0.04)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{...td,fontWeight:600,color:"#a0f87f"}}>{r.ProductID}</td>
                      <td style={td}>
                        <span style={{background:"rgba(160,248,127,0.1)",color:"#a0f87f",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:500}}>
                          {r.ProductCat1||"—"}
                        </span>
                      </td>
                      <td style={{...td,fontWeight:500,color:"#fff"}}>{r.BrandName||"—"}</td>
                      <td style={td}>{r.ProductModel||"—"}</td>
                      <td style={td}>
                        <span style={{background:"rgba(56,189,248,0.1)",color:"#38bdf8",borderRadius:20,padding:"3px 10px",fontSize:12}}>
                          {r.ProductType||"—"}
                        </span>
                      </td>
                      <td style={td}>{r.ProductBrandNme||"—"}</td>
                      <td style={td}>{r.ProductColor||"—"}</td>
                      <td style={{...td,fontWeight:600,color:"#fbbf24"}}>${parseFloat(r.Price||0).toFixed(2)}</td>
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
