import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportToCSV<T>(data: T[], filename: string, fields?: string[]) {
  try {
    const config: any = {};
    if (fields) {
      config.columns = fields;
    }
    const csv = Papa.unparse(data, config);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  columns: { header: string; dataKey: keyof T }[]
) {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Add table using autoTable
    (doc as any).autoTable({
      startY: 35,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey]?.toString() || '')),
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] },
    });
    
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

export function exportTableData<T extends Record<string, any>>(
  data: T[],
  filename: string,
  format: 'csv' | 'pdf',
  options?: {
    title?: string;
    columns?: { header: string; dataKey: keyof T }[];
    fields?: string[];
  }
) {
  if (format === 'csv') {
    exportToCSV(data, filename, options?.fields);
  } else if (format === 'pdf' && options?.title && options?.columns) {
    exportToPDF(data, filename, options.title, options.columns);
  } else {
    throw new Error('Invalid export format or missing options');
  }
}
