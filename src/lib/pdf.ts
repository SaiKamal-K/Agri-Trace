// Generate a simple PDF as data URL using minimal PDF structure — no deps.
function pdfEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function generatePdf(title: string, lines: string[]): string {
  const content = [
    "BT /F1 20 Tf 50 770 Td (" + pdfEscape(title) + ") Tj ET",
    ...lines.map((l, i) => `BT /F1 11 Tf 50 ${730 - i * 18} Td (${pdfEscape(l)}) Tj ET`),
  ].join("\n");

  const stream = `q\n0.27 0.5 0.32 rg\n50 790 500 4 re f\nQ\n${content}`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => (pdf += String(off).padStart(10, "0") + " 00000 n \n"));
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return "data:application/pdf;base64," + btoa(unescape(encodeURIComponent(pdf)));
}

export function downloadPdf(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
