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
  if (d?.List) return d.List;
  return Array.isArray(d) ? d : [d];
}

export default function YallaFixCP() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  async function doLogin() {
    if (!user || !pass) { setError("Please enter username and password"); return; }
    setError(""); setLoading(true);
    try {
      const result = await apiCall({ Operation: "login", User: user, LineData: pass });
      const row = result[0];
      if (row?.State === 0) setLoggedIn(true);
      else setError(row?.Message || "Invalid username or password");
    } catch { setError("Connection error — check API"); }
    setLoading(false);
  }

  if (loggedIn) return <div style={{padding:"2rem"}}>✅ Logged in — shell coming next</div>;

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#5B4FE8"}}>
      <div style={{background:"#fff",borderRadius:16,padding:"2.25rem 2rem",width:"100%",maxWidth:380,boxShadow:"0 8px 40px rgba(0,0,0,0.18)"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <img
            src="https://malkholy.github.io/Yalla/logo.png"
            alt="Yalla Fix"
            style={{height:56,objectFit:"contain"}}
            onError={e=>{
              e.target.style.display="none";
              document.getElementById("logoFallback").style.display="flex";
            }}
          />
          <div id="logoFallback" style={{display:"none",alignItems:"center",justifyContent:"center",gap:10}}>
            <div style={{width:44,height:44,borderRadius:10,background:"#7EE87A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#5B4FE8"}}>y</div>
            <span style={{fontSize:24,fontWeight:700,color:"#5B4FE8",letterSpacing:"-0.5px"}}>yallafix</span>
          </div>
          <p style={{fontSize:12,color:"#999",marginTop:6}}>Control Panel</p>
        </div>

        {/* Fields */}
        <div style={{marginBottom:"1rem"}}>
          <label style={{fontSize:13,color:"#555",display:"block",marginBottom:6}}>Username</label>
          <input
            value={user}
            onChange={e=>setUser(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&document.getElementById("pwd").focus()}
            placeholder="Enter username"
            style={{width:"100%",height:40,padding:"0 12px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none"}}
          />
        </div>
        <div style={{marginBottom:"1rem"}}>
          <label style={{fontSize:13,color:"#555",display:"block",marginBottom:6}}>Password</label>
          <input
            id="pwd"
            type="password"
            value={pass}
            onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&doLogin()}
            placeholder="Enter password"
            style={{width:"100%",height:40,padding:"0 12px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none"}}
          />
        </div>

        {error && (
          <div style={{fontSize:13,color:"#dc2626",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 12px",marginBottom:"1rem"}}>
            {error}
          </div>
        )}

        <button
          onClick={doLogin}
          disabled={loading}
          style={{width:"100%",height:42,background: loading?"#a5b4fc":"#5B4FE8",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",transition:"background 0.15s"}}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p style={{textAlign:"center",fontSize:12,color:"#bbb",marginTop:"1.5rem"}}>Yalla Fix © 2026</p>
      </div>
    </div>
  );
}
