import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPdfTable = (columns: string[], data: any[][], filename: string, title: string) => {
  const doc = new jsPDF();
  
  // Custom font supporting Turkish characters can be added if needed, but for now we'll use standard.
  doc.text(title, 14, 15);
  
  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 20,
    styles: { font: "helvetica" } // Fallback
  });
  
  doc.save(`${filename}.pdf`);
};
