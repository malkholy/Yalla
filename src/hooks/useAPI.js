const API_URL = "https://sila.silasystem.com:8000/General/GeneralAPI/";
const HEADERS = {
  "Accept":       "application/json",
  "content-type": "application/json",
  "Sp_Name":      "APIClaudeOperationV1"
};
const BASE_BODY = {
  AppVersionWeb:     "100",
  AppVersionAndroid: "100",
  AppVersionIos:     "100",
  AppVersionDesktop: "100",
  FireBaseToken:     "",
  PlatForm:          "web",
  deviceID:          "",
  IP:                "192.168.1.3"
};

export async function apiCall(params = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ ...BASE_BODY, ...params }),
  });
  const d = await res.json();
  if (d?.List) return d.List;
  return Array.isArray(d) ? d : [d];
}
