import { useState } from "react";

const API_URL = "https://sila.silasystem.com:8000/General/GeneralAPI/";
const HEADERS = {
  "Accept": "application/json",
  "content-type": "application/json",
  "Sp_Name": "APIClaudeOperationV1"
};
const BASE_BODY = {
  AppVersionWeb: "100", AppVersionAndroid: "100",
  AppVersionIos: "100", AppVersionDesktop: "100",
  FireBaseToken: "", PlatForm: "web", deviceID: "", IP: "192.168.1.3"
};

async function apiCall(params) {
  const res = await fetch(API_URL, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ ...BASE_BODY, ...params })
  });
  const d = await res.json();
  return d;
}

// ─── Login Screen ───────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    if (!user || !pass) { setError("Please enter username and password"); return; }
    setError(""); setLoading(true);
    try {
      const d = await apiCall({ Operation: "login", User: user, LineData: pass });
      const row = d?.List?.[0];
      if (row?.State === 0) {
        onLogin({ user, nav: d?.List1 || [] });
      } else {
        setError(row?.Message || "Invalid username or password");
      }
    } catch { setError("Connection error — check API"); }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#5B4FE8"}}>
      <div style={{background:"#fff",borderRadius:16,padding:"2.25rem 2rem",width:"100%",maxWidth:380,boxShadow:"0 8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <img src="logo.png" alt="Yalla Fix" style={{height:56,objectFit:"contain"}}
            onError={e=>{e.target.style.display="none";}}
          />
          <p style={{fontSize:12,color:"#999",marginTop:6}}>Control Panel</p>
        </div>
        <div style={{marginBottom:"1rem"}}>
          <label style={{fontSize:13,color:"#555",display:"block",marginBottom:6}}>Username</label>
          <input value={user} onChange={e=>setUser(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&document.getElementById("pwd").focus()}
            placeholder="Enter username"
            style={{width:"100%",height:40,padding:"0 12px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none"}}/>
        </div>
        <div style={{marginBottom:"1rem"}}>
          <label style={{fontSize:13,color:"#555",display:"block",marginBottom:6}}>Password</label>
          <input id="pwd" type="password" value={pass} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&doLogin()}
            placeholder="Enter password"
            style={{width:"100%",height:40,padding:"0 12px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none"}}/>
        </div>
        {error && <div style={{fontSize:13,color:"#dc2626",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 12px",marginBottom:"1rem"}}>{error}</div>}
        <button onClick={doLogin} disabled={loading}
          style={{width:"100%",height:42,background:loading?"#a5b4fc":"#5B4FE8",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer"}}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p style={{textAlign:"center",fontSize:12,color:"#bbb",marginTop:"1.5rem"}}>Yalla Fix © 2026</p>
      </div>
    </div>
  );
}

// ─── Shell ───────────────────────────────────────────────────────
function Shell({ session, onLogout }) {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [collapsed, setCollapsed] = useState({});

  // Group nav items
  const groups = session.nav.reduce((acc, item) => {
    if (!acc[item.GroupID]) acc[item.GroupID] = { GroupID: item.GroupID, GroupName: item.GroupName, pages: [] };
    acc[item.GroupID].pages.push({ PageID: item.PageID, PageName: item.PageName });
    return acc;
  }, {});

  function openTab(page) {
    const exists = tabs.find(t => t.PageID === page.PageID);
    if (!exists) setTabs(prev => [...prev, page]);
    setActiveTab(page.PageID);
  }

  function closeTab(e, pageID) {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.PageID !== pageID);
    setTabs(newTabs);
    if (activeTab === pageID) setActiveTab(newTabs.length ? newTabs[newTabs.length - 1].PageID : null);
  }

  function toggleGroup(gid) {
    setCollapsed(prev => ({ ...prev, [gid]: !prev[gid] }));
  }

  const sidebarW = 220;

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"sans-serif",overflow:"hidden"}}>

      {/* Sidebar */}
      <div style={{width:sidebarW,minWidth:sidebarW,background:"#0f2d5a",display:"flex",flexDirection:"column",height:"100vh"}}>
        {/* Logo */}
        <div style={{padding:"1rem 1rem 0.75rem",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <img src="logo.png" alt="Yalla Fix" style={{height:36,objectFit:"contain",filter:"brightness(10)"}}
            onError={e=>e.target.style.display="none"}/>
        </div>

        {/* Nav */}
        <div style={{flex:1,overflowY:"auto",padding:"0.5rem 0"}}>
          {Object.values(groups).map(g => (
            <div key={g.GroupID}>
              {/* Group header */}
              <div onClick={()=>toggleGroup(g.GroupID)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px",cursor:"pointer",color:"#93c5fd",fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",userSelect:"none"}}>
                <span>{g.GroupName}</span>
                <span style={{transition:"transform 0.2s",transform:collapsed[g.GroupID]?"rotate(-90deg)":"rotate(0deg)",fontSize:10}}>▾</span>
              </div>
              {/* Pages */}
              {!collapsed[g.GroupID] && g.pages.map(p => (
                <div key={p.PageID} onClick={()=>openTab(p)}
                  style={{padding:"7px 16px 7px 28px",cursor:"pointer",fontSize:13,color: activeTab===p.PageID?"#fff":"#94a3b8",background: activeTab===p.PageID?"rgba(99,102,241,0.25)":"transparent",borderLeft: activeTab===p.PageID?"3px solid #818cf8":"3px solid transparent",transition:"all 0.15s"}}>
                  {p.PageName}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* User / Logout */}
        <div style={{padding:"0.75rem 1rem",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:"#94a3b8"}}>{session.user}</span>
          <button onClick={onLogout}
            style={{fontSize:11,color:"#f87171",background:"transparent",border:"none",cursor:"pointer"}}>
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#f1f5f9",overflow:"hidden"}}>

        {/* Tab bar */}
        <div style={{display:"flex",alignItems:"center",background:"#fff",borderBottom:"1px solid #e2e8f0",overflowX:"auto",minHeight:40,flexShrink:0}}>
          {tabs.length === 0 && (
            <span style={{padding:"0 16px",fontSize:13,color:"#94a3b8"}}>Select a page from the sidebar</span>
          )}
          {tabs.map(t => (
            <div key={t.PageID} onClick={()=>setActiveTab(t.PageID)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"0 14px",height:40,cursor:"pointer",fontSize:13,whiteSpace:"nowrap",borderBottom: activeTab===t.PageID?"2px solid #6366f1":"2px solid transparent",color: activeTab===t.PageID?"#6366f1":"#64748b",background: activeTab===t.PageID?"#f8f7ff":"transparent",flexShrink:0}}>
              {t.PageName}
              <span onClick={e=>closeTab(e,t.PageID)}
                style={{fontSize:14,color:"#94a3b8",lineHeight:1,marginTop:1}}>×</span>
            </div>
          ))}
        </div>

        {/* Page content */}
        <div style={{flex:1,overflow:"auto",padding:"1.5rem"}}>
          {activeTab
            ? <div style={{background:"#fff",borderRadius:12,padding:"2rem",border:"1px solid #e2e8f0"}}>
                <h2 style={{fontSize:18,fontWeight:600,color:"#1e293b",marginBottom:8}}>
                  {tabs.find(t=>t.PageID===activeTab)?.PageName}
                </h2>
                <p style={{fontSize:13,color:"#94a3b8"}}>Page content coming soon...</p>
              </div>
            : <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#94a3b8",fontSize:14}}>
                Select a page to get started
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── App Root ────────────────────────────────────────────────────
export default function YallaFixCP() {
  const [session, setSession] = useState(null);

  if (!session) return <LoginScreen onLogin={setSession} />;
  return <Shell session={session} onLogout={()=>setSession(null)} />;
}
