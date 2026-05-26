import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(elementId, filename = "export.pdf") {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth   = pageWidth;
  const imgHeight  = (canvas.height * imgWidth) / canvas.width;

  let y = 0;
  while (y < imgHeight) {
    pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
    y += pageHeight;
    if (y < imgHeight) pdf.addPage();
  }

  pdf.save(filename);
}
