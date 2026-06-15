import { useState, useEffect } from "react";
import useSortable from "../hooks/useSortable.jsx";
import ExcelImport from "../components/ExcelImport.jsx";
import { ExportButtons } from "../components/PageWrapper.jsx";
import FilterDropdown from "../components/FilterDropdown.jsx";

export default function Products({ apiCall }) {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [filterCat, setFilterCat] = useState([]);
  const [filterBrand, setFilterBrand] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editProductID, setEditProductID] = useState("");
  const [editProductCat1, setEditProductCat1] = useState("");
  const [editProductType, setEditProductType] = useState("");
  const [editBrandName, setEditBrandName] = useState("");
  const [editProductModel, setEditProductModel] = useState("");
  const [editProductColor, setEditProductColor] = useState("");
  const [editProductBrandNme, setEditProductBrandNme] = useState("");
  const [editWholeSale, setEditWholeSale] = useState("");
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editBatteryPartNumber, setEditBatteryPartNumber] = useState("");
  const [editExtrInfo, setEditExtrInfo] = useState("");
  const [editImageURL, setEditImageURL] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

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

  function openEdit(r) {
    setEditing(r);
    setEditProductID(r.ProductID || "");
    setEditProductCat1(r.ProductCat1 || "");
    setEditProductType(r.ProductType || "");
    setEditBrandName(r.BrandName || "");
    setEditProductModel(r.ProductModel || "");
    setEditProductColor(r.ProductColor || "");
    setEditProductBrandNme(r.ProductBrandNme || "");
    setEditWholeSale(r.WholeSale || "0");
    setEditSellingPrice(r.SellingPrice || "0");
    setEditPrice(r.Price || "0");
    setEditBatteryPartNumber(r.BatteryPartNumber || "");
    setEditExtrInfo(r.ExtrInfo || "");
    setEditImageURL(r.ImageURL || "");
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const lineData = JSON.stringify({
        ID: editing.ID,
        ProductID: editProductID,
        ProductCat1: editProductCat1,
        ProductType: editProductType,
        BrandName: editBrandName,
        ProductModel: editProductModel,
        ProductColor: editProductColor,
        ProductBrandNme: editProductBrandNme,
        WholeSale: parseFloat(editWholeSale || 0),
        SellingPrice: parseFloat(editSellingPrice || 0),
        Price: parseFloat(editPrice || 0),
        BatteryPartNumber: editBatteryPartNumber,
        ExtrInfo: editExtrInfo,
        ImageURL: editImageURL
      });
      const d = await apiCall({ Operation: "Edit Products", LineData: lineData });
      const row = d?.List?.[0] || d?.List0?.[0] || d?.List1?.[0];
      if (row?.State === 0 || row?.State === undefined) {
        setToast({ type: "success", msg: "Saved successfully" });
        await load();
        setEditing(null);
      } else {
        setToast({ type: "error", msg: row?.Message || "Save failed" });
      }
    } catch {
      setToast({ type: "error", msg: "Connection error" });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  }

  const cats   = ["All", ...new Set(data.map(r => r.ProductCat1).filter(Boolean))];
  const brands = ["All", ...new Set(data.map(r => r.BrandName).filter(Boolean))];

  const { sorted, Th } = useSortable(data);
  const filtered = sorted.filter(r => {
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
    {label:"Whole Sale",  key:"WholeSale"},
    {label:"Selling Price", key:"SellingPrice"},
    {label:"Price",       key:"Price"},
    {label:"Image URL",   key:"ImageURL"},
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

      {editing ? (
        <div style={{padding:"1rem 0"}}>
          {/* Breadcrumb / Back button */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.5rem"}}>
            <button onClick={()=>setEditing(null)}
              style={{
                width:36,
                height:36,
                borderRadius:10,
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",
                color:"#fff",
                display:"flex",
                alignItems:"center",
                justifyContent: "center",
                cursor:"pointer",
                transition:"all 0.2s"
              }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
              <i className="ti ti-arrow-left" style={{fontSize:16}} aria-hidden="true"></i>
            </button>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(255,255,255,0.4)"}}>
                <span>Products</span>
                <span>/</span>
                <span>Edit</span>
              </div>
              <h1 style={{fontSize:20,fontWeight:700,color:"#fff",marginTop:4}}>
                Edit Product: <span style={{color:"#a0f87f"}}>{editing.ProductID}</span>
              </h1>
            </div>
          </div>

          {/* Form Card */}
          <div style={{
            background:"rgba(255,255,255,0.03)",
            borderRadius:12,
            border:"1px solid rgba(255,255,255,0.07)",
            padding:"2rem",
            boxShadow:"0 8px 32px rgba(0,0,0,0.2)",
            backdropFilter:"blur(8px)"
          }}>
            {/* ID Banner */}
            <div style={{
              background:"rgba(160,248,127,0.08)",
              borderRadius:8,
              padding:"12px 16px",
              marginBottom:"2rem",
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between"
            }}>
              <span style={{fontSize:13,fontWeight:600,color:"#a0f87f"}}>Database Key ID: {editing.ID}</span>
              {editing.LastMaintDate && (
                <span style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>
                  Last Updated: {new Date(editing.LastMaintDate).toLocaleString()}
                </span>
              )}
            </div>

            {/* Grid Layout */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
              {/* Row 1: Product ID & Part ID */}
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Product ID (Code)</label>
                <input type="text" value={editProductID} onChange={e=>setEditProductID(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Part ID (Battery Part Number)</label>
                <input type="text" value={editBatteryPartNumber} onChange={e=>setEditBatteryPartNumber(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>

              {/* Row 2: Brand & Model */}
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Brand</label>
                <input type="text" value={editBrandName} onChange={e=>setEditBrandName(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Model (Compatibility)</label>
                <input type="text" value={editProductModel} onChange={e=>setEditProductModel(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>

              {/* Row 3: Category & Type */}
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Category</label>
                <input type="text" value={editProductCat1} onChange={e=>setEditProductCat1(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Type</label>
                <input type="text" value={editProductType} onChange={e=>setEditProductType(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>

              {/* Row 4: Supplier & Color */}
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Supplier (Quality)</label>
                <input type="text" value={editProductBrandNme} onChange={e=>setEditProductBrandNme(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Color</label>
                <input type="text" value={editProductColor} onChange={e=>setEditProductColor(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>

              {/* Row 5: Wholesale & Selling Price */}
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Wholesale Price</label>
                <input type="number" value={editWholeSale} onChange={e=>setEditWholeSale(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Selling Price</label>
                <input type="number" value={editSellingPrice} onChange={e=>setEditSellingPrice(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>

              {/* Row 6: Price & Extra Info */}
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Price</label>
                <input type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Capacity / Rank (Extra Info)</label>
                <input type="text" value={editExtrInfo} onChange={e=>setEditExtrInfo(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <div style={{gridColumn: "span 2"}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Product Image URL</label>
                <input type="text" value={editImageURL} onChange={e=>setEditImageURL(e.target.value)}
                  style={{width:"100%",height:42,padding:"0 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:14,color:"#fff",outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(160,248,127,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
            </div>

            {/* Actions Divider */}
            <div style={{height:1,background:"rgba(255,255,255,0.07)",margin:"2rem 0"}}></div>

            {/* Form Actions */}
            <div style={{display:"flex",justifyContent:"flex-end",gap:12}}>
              <button onClick={()=>setEditing(null)}
                style={{
                  height:42,
                  padding:"0 24px",
                  background:"transparent",
                  color:"rgba(255,255,255,0.6)",
                  border:"1px solid rgba(255,255,255,0.15)",
                  borderRadius:8,
                  fontSize:14,
                  fontWeight:500,
                  cursor:"pointer",
                  fontFamily:"inherit",
                  transition:"all 0.2s"
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.background="rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor="rgba(255,255,255,0.25)";
                  e.currentTarget.style.color="#fff";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background="transparent";
                  e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";
                  e.currentTarget.style.color="rgba(255,255,255,0.6)";
                }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                style={{
                  height:42,
                  padding:"0 28px",
                  background:"linear-gradient(135deg,#573ad2,#2e139e)",
                  color:"#fff",
                  border:"1px solid rgba(160,248,127,0.25)",
                  borderRadius:8,
                  fontSize:14,
                  fontWeight:600,
                  cursor:saving?"not-allowed":"pointer",
                  fontFamily:"inherit",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:8,
                  transition:"all 0.2s"
                }}
                onMouseEnter={e=>{
                  if (!saving) {
                    e.currentTarget.style.transform="translateY(-1px)";
                    e.currentTarget.style.boxShadow="0 6px 20px rgba(87,58,210,0.4)";
                  }
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform="none";
                  e.currentTarget.style.boxShadow="none";
                }}>
                {saving ? (
                  <>
                    <i className="ti ti-loader spin" style={{fontSize:16}} aria-hidden="true"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="ti ti-check" style={{fontSize:16}} aria-hidden="true"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div id="products-table">
          {showImport && <ExcelImport apiCall={apiCall} onDone={()=>{setShowImport(false);load();}}/>}
          {/* KPI Cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        {[
          { label:"Total Products", value:totalProducts, color:"#a0f87f" },
          { label:"Brands",         value:totalBrands,   color:"#38bdf8" },
          { label:"Categories",     value:totalCats,     color:"#c084fc" },
          { label:"Avg Price",      value:avgPrice,  color:"#fbbf24" },
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
          <button onClick={()=>setShowImport(true)}
            style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"rgba(160,248,127,0.1)",color:"#a0f87f",border:"1px solid rgba(160,248,127,0.2)",borderRadius:8,fontSize:13,cursor:"pointer"}}>
            <i className="ti ti-file-import" style={{fontSize:14}} aria-hidden="true"></i>Import Excel
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
                  <Th col="ProductID">Product ID</Th>
                  <Th col="ProductCat1">Category</Th>
                  <Th col="BrandName">Brand</Th>
                  <Th col="ProductModel">Model</Th>
                  <Th col="ProductType">Type</Th>
                  <Th col="ProductBrandNme">Supplier</Th>
                  <Th col="ProductColor">Color</Th>
                  <Th col="WholeSale">Whole Sale</Th>
                  <Th col="SellingPrice">Selling Price</Th>
                  <Th col="Price">Price</Th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={10} style={{padding:"2rem",textAlign:"center",color:"rgba(255,255,255,0.25)"}}>No records found</td></tr>
                  : filtered.map((r, i) => (
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(160,248,127,0.04)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={td}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          {r.ImageURL ? (
                            <img src={r.ImageURL} alt="" style={{width:28,height:28,borderRadius:6,objectFit:"cover",border:"1px solid rgba(255,255,255,0.1)"}}/>
                          ) : (
                            <div style={{width:28,height:28,borderRadius:6,background:"rgba(160,248,127,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#a0f87f",flexShrink:0}}>
                              <i className="ti ti-image" style={{fontSize:14}} aria-hidden="true"></i>
                            </div>
                          )}
                          <span style={{fontWeight:600,color:"#a0f87f"}}>{r.ProductID}</span>
                        </div>
                      </td>
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
                      <td style={{...td,fontWeight:600,color:"#fbbf24"}}>{parseFloat(r.WholeSale||0).toFixed(2)}</td>
                      <td style={{...td,fontWeight:600,color:"#fbbf24"}}>{parseFloat(r.SellingPrice||0).toFixed(2)}</td>
                      <td style={{...td,fontWeight:600,color:"#fbbf24"}}>{parseFloat(r.Price||0).toFixed(2)}</td>
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
      )}
    </div>
  );
}

const th = {padding:"10px 14px",textAlign:"left",fontWeight:700,color:"rgba(255,255,255,0.35)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"};
const td = {padding:"10px 14px",color:"rgba(255,255,255,0.7)",verticalAlign:"middle"};
