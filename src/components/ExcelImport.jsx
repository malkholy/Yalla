import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const PRODUCT_FIELDS = [
  { key: "ProductID",         label: "Product ID (Code)", required: true },
  { key: "BatteryPartNumber", label: "Part ID" },
  { key: "ProductBrandNme",   label: "Quality (Supplier)" },
  { key: "ProductModel",      label: "Compatibility (Model)" },
  { key: "ProductCat1",       label: "Category (Battery/LCD)" },
  { key: "ProductType",       label: "Type (Mobile/TAB)" },
  { key: "BrandName",         label: "Brand" },
  { key: "ProductColor",      label: "Colour" },
  { key: "ExtrInfo",          label: "Capacity/Rank" },
  { key: "WholeSale",         label: "Whole Sale Price" },
  { key: "SellingPrice",      label: "Selling Price" },
  { key: "Price",             label: "Price" },
  { key: "ImageURL",          label: "Image URL" },
];

export default function ExcelImport({ apiCall, onDone }) {
  const [rows, setRows]         = useState([]);
  const [sheetData, setSheetData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const [step, setStep]         = useState("upload"); // upload | map | preview | done
  const [showAllPreview, setShowAllPreview] = useState(false);
  const fileRef = useRef();

  function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        
        // Extract headers from first row of data
        const sheetRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const firstRow = sheetRows[0] || [];
        const headers = firstRow.map(h => String(h).trim()).filter(Boolean);
        setExcelHeaders(headers);

        const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });
        // Trim keys in raw objects to match trimmed headers
        const cleanRaw = raw.map(row => {
          const cleanRow = {};
          for (const [k, v] of Object.entries(row)) {
            cleanRow[String(k).trim()] = v;
          }
          return cleanRow;
        });
        setSheetData(cleanRaw);

        // Pre-match headers to initialize mapping
        const COLUMN_HEADERS_MAP = {
          ProductID: ["code", "product id", "productid"],
          BatteryPartNumber: ["part id", "partid", "part no", "partnumber", "part number"],
          ProductBrandNme: ["quality", "supplier"],
          ProductModel: ["compatbility", "compatibility", "model"],
          ProductCat1: ["battary/lcd", "battery/lcd", "category", "cat"],
          ProductType: ["mobile/tab", "type"],
          BrandName: ["brand", "brand name", "brandname"],
          ProductColor: ["colour", "color"],
          ExtrInfo: ["capacity(for battary)/rank( for lcd)", "capacity(for battery)/rank( for lcd)", "capacity(for battery)/rank(for lcd)", "capacity(for battary)/rank(for lcd)", "capacity", "rank", "extr info", "extrinfo"],
          WholeSale: ["wholesale", "whole sale", "wholesale price"],
          SellingPrice: ["sellingprice", "selling price", "selling price price"],
          Price: ["price"],
          ImageURL: ["imageurl", "image url", "image", "url", "picture"],
        };

        const initialMap = {};
        PRODUCT_FIELDS.forEach(field => {
          const aliases = COLUMN_HEADERS_MAP[field.key] || [];
          // First pass: try exact match
          let matched = headers.find(h => {
            const cleanH = h.toLowerCase();
            return aliases.some(alias => cleanH === alias.toLowerCase());
          });
          // Second pass: fallback to includes match
          if (!matched) {
            matched = headers.find(h => {
              const cleanH = h.toLowerCase();
              // Prevent greedy matching: Price should not auto-match to Selling Price or Wholesale Price
              if (field.key === "Price" && (cleanH.includes("selling") || cleanH.includes("wholesale") || cleanH.includes("whole sale") || cleanH.includes("whole_sale"))) {
                return false;
              }
              return aliases.some(alias => cleanH.includes(alias.toLowerCase()));
            });
          }
          initialMap[field.key] = matched || "";
        });
        setColumnMapping(initialMap);
        setStep("map");
      } catch(err) {
        setError("Failed to read Excel file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleMapConfirm() {
    if (!columnMapping["ProductID"]) {
      setError("Please map the Product ID (Code) field. It is required.");
      return;
    }
    setError("");

    try {
      const mapped = sheetData.map(r => {
        const obj = {};
        PRODUCT_FIELDS.forEach(field => {
          const selectedHeader = columnMapping[field.key];
          obj[field.key] = (selectedHeader && r[selectedHeader] !== undefined) ? String(r[selectedHeader]).trim() : "";
        });

        // Numeric fields: parse numeric
        obj["WholeSale"] = parseFloat(String(obj["WholeSale"] || "0").replace(/[^0-9.]/g, "")) || 0;
        obj["SellingPrice"] = parseFloat(String(obj["SellingPrice"] || "0").replace(/[^0-9.]/g, "")) || 0;
        obj["Price"] = parseFloat(String(obj["Price"] || "0").replace(/[^0-9.]/g, "")) || 0;

        return obj;
      }).filter(r => r.ProductID); // skip empty rows

      // Sanitize
      const sanitized = mapped.map(r => {
        const clean = {};
        for (const [k, v] of Object.entries(r)) {
          if (typeof v === 'string') {
            clean[k] = v.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim();
          } else {
            clean[k] = v;
          }
        }
        return clean;
      });

      setRows(sanitized);
      setStep("preview");
    } catch(err) {
      setError("Failed to map sheet columns: " + err.message);
    }
  }

  async function doImport() {
    setImporting(true);
    setError("");
    try {
      // Send in batches of 100
      const batchSize = 100;
      let totalProcessed = 0;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const d = await apiCall({ Operation: "Import Products", LineData: JSON.stringify(batch) });
        console.log(`Batch ${Math.floor(i/50)+1}: response`, JSON.stringify(d).slice(0,200));
        const allLists = [d?.List0, d?.List, d?.List1].filter(Boolean);
        const stateRow = allLists.flatMap(l => l).find(r => r?.State !== undefined);
        if (stateRow && stateRow.State !== 0) {
          console.warn(`Batch ${Math.floor(i/50)+1} failed, skipping:`, stateRow.Message);
          continue;
        }
        totalProcessed += batch.length;
      }
      setResult({ count: totalProcessed });
      setStep("done");
    } catch(err) {
      setError("Connection error: " + err.message);
    }
    setImporting(false);
  }

  const PREVIEW_COLS = ["ProductID","BrandName","ProductModel","ProductCat1","ProductType","ProductColor","ProductBrandNme","BatteryPartNumber","ExtrInfo","WholeSale","SellingPrice","Price","ImageURL"];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#152338",borderRadius:16,border:"1px solid rgba(255,255,255,0.1)",width:"100%",maxWidth:860,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 60px rgba(0,0,0,0.5)"}}>

        {/* Header */}
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:10,background:"rgba(160,248,127,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#a0f87f",fontSize:18}}>
              <i className="ti ti-file-spreadsheet" aria-hidden="true"></i>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>Import Products from Excel</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>
                {step==="upload" && "Upload your Excel file to import products"}
                {step==="map" && "Map Excel columns to product fields"}
                {step==="preview" && `${rows.length} rows ready to import`}
                {step==="done" && "Import completed successfully"}
              </div>
            </div>
          </div>
          <button onClick={onDone} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:20}}>×</button>
        </div>

        {/* Steps indicator */}
        <div style={{display:"flex",padding:"0.75rem 1.5rem",borderBottom:"1px solid rgba(255,255,255,0.07)",gap:0,flexShrink:0}}>
          {[{key:"upload",label:"1. Upload"},{key:"map",label:"2. Map"},{key:"preview",label:"3. Preview"},{key:"done",label:"4. Done"}].map((s,i) => (
            <div key={s.key} style={{display:"flex",alignItems:"center",gap:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,
                background: step===s.key?"rgba(160,248,127,0.12)":"transparent",
                color: step===s.key?"#a0f87f": ["upload","map","preview","done"].indexOf(step) > i ?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)",
                fontSize:12,fontWeight:step===s.key?600:400}}>
                {["upload","map","preview","done"].indexOf(step) > i
                  ? <i className="ti ti-circle-check" style={{fontSize:14}} aria-hidden="true"></i>
                  : <span style={{width:16,height:16,borderRadius:"50%",border:"1.5px solid currentColor",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10}}>{i+1}</span>
                }
                {s.label}
              </div>
              {i < 3 && <i className="ti ti-chevron-right" style={{fontSize:12,color:"rgba(255,255,255,0.15)",margin:"0 2px"}} aria-hidden="true"></i>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1,overflow:"auto",padding:"1.5rem"}}>

          {/* Upload step */}
          {step==="upload" && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={e=>e.preventDefault()}
                onClick={()=>fileRef.current.click()}
                style={{border:"2px dashed rgba(160,248,127,0.2)",borderRadius:12,padding:"3rem",textAlign:"center",cursor:"pointer",transition:"all 0.2s",background:"rgba(160,248,127,0.02)"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(160,248,127,0.4)";e.currentTarget.style.background="rgba(160,248,127,0.05)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(160,248,127,0.2)";e.currentTarget.style.background="rgba(160,248,127,0.02)";}}>
                <i className="ti ti-upload" style={{fontSize:40,color:"#a0f87f",display:"block",marginBottom:12}} aria-hidden="true"></i>
                <div style={{fontSize:15,fontWeight:600,color:"#fff",marginBottom:6}}>Drop Excel file here</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginBottom:16}}>or click to browse</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(160,248,127,0.1)",color:"#a0f87f",border:"1px solid rgba(160,248,127,0.2)",borderRadius:8,padding:"6px 16px",fontSize:13,fontWeight:500}}>
                  <i className="ti ti-file-spreadsheet" style={{fontSize:14}} aria-hidden="true"></i>
                  Browse .xlsx / .xls
                </div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
              </div>
            </div>
          )}

          {/* Map Columns Step */}
          {step==="map" && (
            <div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:"1rem"}}>
                Please verify or correct how your Excel columns map to the product fields below.
              </div>
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden",maxHeight:"45vh",overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                      <th style={{padding:"10px 14px",textAlign:"left",color:"rgba(255,255,255,0.35)",fontSize:11,textTransform:"uppercase"}}>Product Field</th>
                      <th style={{padding:"10px 14px",textAlign:"left",color:"rgba(255,255,255,0.35)",fontSize:11,textTransform:"uppercase"}}>Excel Column Header</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCT_FIELDS.map(f => (
                      <tr key={f.key} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <td style={{padding:"10px 14px",fontWeight:500,color:"#fff",display:"flex",alignItems:"center",gap:6}}>
                          {f.label}
                          {f.required && <span style={{color:"#f87171"}}>*</span>}
                        </td>
                        <td style={{padding:"10px 14px"}}>
                          <select
                            value={columnMapping[f.key] || ""}
                            onChange={e => setColumnMapping(prev => ({ ...prev, [f.key]: e.target.value }))}
                            style={{width:"100%",height:34,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff",padding:"0 10px",outline:"none",fontSize:13}}
                          >
                            <option value="" style={{background:"#152338",color:"rgba(255,255,255,0.4)"}}>-- Unmapped / Skip --</option>
                            {excelHeaders.map(h => (
                              <option key={h} value={h} style={{background:"#152338",color:"#fff"}}>{h}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Preview step */}
          {step==="preview" && (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>
                  Showing <span style={{color:"#fff",fontWeight:600}}>{showAllPreview ? rows.length : Math.min(rows.length,20)}</span> of <span style={{color:"#a0f87f",fontWeight:600}}>{rows.length}</span> rows
                  {!showAllPreview && rows.length > 20 && (
                    <span onClick={()=>setShowAllPreview(true)} style={{marginLeft:8,color:"#a0f87f",cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Show all</span>
                  )}
                  {showAllPreview && (
                    <span onClick={()=>setShowAllPreview(false)} style={{marginLeft:8,color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Show less</span>
                  )}
                </div>
                <button onClick={()=>{setStep("upload");setRows([]);setFileName("");}}
                  style={{display:"flex",alignItems:"center",gap:5,height:30,padding:"0 10px",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:12,cursor:"pointer"}}>
                  <i className="ti ti-upload" style={{fontSize:12}} aria-hidden="true"></i>Change file
                </button>
              </div>
              <div style={{overflowX:"auto",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                      <th style={{padding:"8px 10px",textAlign:"left",color:"rgba(255,255,255,0.35)",fontWeight:700,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap"}}>#</th>
                      {PREVIEW_COLS.map(c => (
                        <th key={c} style={{padding:"8px 10px",textAlign:"left",color:"rgba(255,255,255,0.35)",fontWeight:700,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap"}}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllPreview ? rows : rows.slice(0,20)).map((r,i) => (
                      <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <td style={{padding:"7px 10px",color:"rgba(255,255,255,0.3)",fontSize:11}}>{i+1}</td>
                        {PREVIEW_COLS.map(c => {
                          const isNumeric = ["Price", "WholeSale", "SellingPrice"].includes(c);
                          return (
                            <td key={c} style={{padding:"7px 10px",color: c === "ProductID" ? "#a0f87f" : isNumeric ? "#fbbf24" : "rgba(255,255,255,0.7)",whiteSpace:"nowrap",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}}>
                              {isNumeric ? r[c] : r[c] || "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Done step */}
          {step==="done" && (
            <div style={{textAlign:"center",padding:"2rem"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(160,248,127,0.12)",border:"2px solid #a0f87f",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",fontSize:28,color:"#a0f87f"}}>
                <i className="ti ti-circle-check" aria-hidden="true"></i>
              </div>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>Import Successful!</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.5)"}}>
                <span style={{color:"#a0f87f",fontWeight:600}}>{result?.count}</span> products imported successfully
              </div>
            </div>
          )}

          {error && (
            <div style={{marginTop:"1rem",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#f87171",display:"flex",alignItems:"center",gap:8}}>
              <i className="ti ti-alert-circle" style={{fontSize:16}} aria-hidden="true"></i>{error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"1rem 1.5rem",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0}}>
          {step==="upload" && (
            <button onClick={onDone}
              style={{height:38,padding:"0 16px",background:"transparent",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,cursor:"pointer"}}>
              Cancel
            </button>
          )}
          {step==="map" && (
            <>
              <button onClick={()=>{setStep("upload");setFileName("");}}
                style={{height:38,padding:"0 16px",background:"transparent",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,cursor:"pointer"}}>
                Back
              </button>
              <button onClick={handleMapConfirm}
                style={{height:38,padding:"0 20px",background:"linear-gradient(135deg,#573ad2,#2e139e)",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                <i className="ti ti-arrow-right" style={{fontSize:14}} aria-hidden="true"></i>Next: Preview
              </button>
            </>
          )}
          {step==="preview" && (
            <>
              <button onClick={()=>{setStep("map");}}
                style={{height:38,padding:"0 16px",background:"transparent",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,cursor:"pointer"}}>
                Back
              </button>
              <button onClick={doImport} disabled={importing}
                style={{height:38,padding:"0 20px",background:"linear-gradient(135deg,#573ad2,#2e139e)",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:importing?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,opacity:importing?0.7:1}}>
                {importing
                  ? <><i className="ti ti-loader spin" style={{fontSize:14}} aria-hidden="true"></i>Importing...</>
                  : <><i className="ti ti-database-import" style={{fontSize:14}} aria-hidden="true"></i>Import {rows.length} Products</>
                }
              </button>
            </>
          )}
          {step==="done" && (
            <button onClick={()=>{onDone();}}
              style={{height:38,padding:"0 20px",background:"rgba(160,248,127,0.12)",color:"#a0f87f",border:"1px solid rgba(160,248,127,0.2)",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-check" style={{fontSize:14}} aria-hidden="true"></i>Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
