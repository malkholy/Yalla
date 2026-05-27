import { useState, useEffect, useRef } from "react";

export default function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const allSelected = selected.length === options.length;

  function toggle(val) {
    if (selected.includes(val)) onChange(selected.filter(s => s !== val));
    else onChange([...selected, val]);
  }

  function selectAll() { onChange([...options]); }
  function clearAll()  { onChange([]); }

  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={() => setOpen(!open)}
        style={{display:"flex",alignItems:"center",gap:6,height:34,padding:"0 12px",
          background: selected.length < options.length ? "rgba(160,248,127,0.1)" : "rgba(255,255,255,0.06)",
          border: selected.length < options.length ? "1px solid rgba(160,248,127,0.3)" : "1px solid rgba(255,255,255,0.1)",
          borderRadius:8,fontSize:13,color: selected.length < options.length ? "#a0f87f" : "rgba(255,255,255,0.7)",
          cursor:"pointer",fontFamily:"inherit"}}>
        <i className="ti ti-filter" style={{fontSize:13}} aria-hidden="true"></i>
        {label}
        {selected.length < options.length && <span style={{background:"#a0f87f",color:"#0e1520",borderRadius:20,padding:"1px 6px",fontSize:10,fontWeight:700}}>{selected.length}</span>}
        <i className={`ti ti-chevron-${open?"up":"down"}`} style={{fontSize:11}} aria-hidden="true"></i>
      </button>

      {open && (
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:100,
          background:"#152338",border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:10,padding:"8px",minWidth:200,
          boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
          {/* Search */}
          <div style={{position:"relative",marginBottom:8}}>
            <i className="ti ti-search" style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(255,255,255,0.25)"}} aria-hidden="true"></i>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search..."
              style={{width:"100%",paddingLeft:26,paddingRight:8,height:30,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,fontSize:12,color:"#fff",outline:"none",fontFamily:"inherit"}}/>
          </div>
          {/* Select All / Clear */}
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <button onClick={selectAll}
              style={{flex:1,height:26,background:"rgba(160,248,127,0.1)",border:"1px solid rgba(160,248,127,0.2)",borderRadius:6,fontSize:11,color:"#a0f87f",cursor:"pointer",fontFamily:"inherit"}}>
              Select All
            </button>
            <button onClick={clearAll}
              style={{flex:1,height:26,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,fontSize:11,color:"rgba(255,255,255,0.5)",cursor:"pointer",fontFamily:"inherit"}}>
              Clear
            </button>
          </div>
          {/* Options */}
          <div style={{maxHeight:180,overflowY:"auto"}}>
            {filtered.map(o => (
              <div key={o} onClick={() => toggle(o)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:6,cursor:"pointer",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:16,height:16,borderRadius:4,border:"1.5px solid",
                  borderColor: selected.includes(o) ? "#a0f87f" : "rgba(255,255,255,0.2)",
                  background: selected.includes(o) ? "#a0f87f" : "transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                  {selected.includes(o) && <i className="ti ti-check" style={{fontSize:10,color:"#0e1520"}} aria-hidden="true"></i>}
                </div>
                <span style={{fontSize:13,color: selected.includes(o) ? "#fff" : "rgba(255,255,255,0.6)"}}>{o}</span>
              </div>
            ))}
            {filtered.length === 0 && <div style={{padding:"8px",fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center"}}>No results</div>}
          </div>
        </div>
      )}
    </div>
  );
}
