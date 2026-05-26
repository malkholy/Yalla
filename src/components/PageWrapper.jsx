import { exportToPDF } from "../utils/exportPDF.js";
import * as XLSX from "xlsx";

export function ExportButtons({ exportId, filename, excelData, excelColumns }) {
  function handlePDF() {
    exportToPDF(exportId, `${filename}.pdf`);
  }

  function handleExcel() {
    if (!excelData || !excelData.length) return;
    const rows = excelData.map(r => {
      const row = {};
      excelColumns.forEach(col => { row[col.label] = r[col.key] ?? ""; });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename);
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  return (
    <div style={{display:"flex",gap:8}}>
      <button onClick={handleExcel}
        style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#16a34a",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
        <i className="ti ti-file-spreadsheet" style={{fontSize:14}} aria-hidden="true"></i>Excel
      </button>
      <button onClick={handlePDF}
        style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 12px",background:"#dc2626",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
        <i className="ti ti-file-type-pdf" style={{fontSize:14}} aria-hidden="true"></i>PDF
      </button>
    </div>
  );
}
