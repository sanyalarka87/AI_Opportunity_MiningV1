import { useState } from 'react';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { exportPdf, exportPpt } from '../api/client';
import styles from './ExportActions.module.css';

export function ExportActions() {
  const [exporting, setExporting] = useState<'pdf' | 'ppt' | null>(null);

  const handleExportPdf = async () => {
    setExporting('pdf');
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('AI Opportunity Mining Platform — Executive Dashboard', 20, 20);
      doc.setFontSize(12);
      doc.text('Generated snapshot. Connect to live dashboard for full metrics.', 20, 35);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      await exportPdf('Executive Dashboard', document.body.innerHTML);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPpt = async () => {
    setExporting('ppt');
    try {
      const ppt = new PptxGenJS();
      const titleSlide = ppt.addSlide();
      titleSlide.addText('AI Opportunity Mining Platform', { x: 0.5, y: 1, w: 9, h: 1, fontSize: 24 });
      titleSlide.addText('Executive Dashboard Snapshot', { x: 0.5, y: 2, w: 9, h: 0.5, fontSize: 14 });
      titleSlide.addText(new Date().toLocaleDateString(), { x: 0.5, y: 2.6, w: 9, h: 0.5, fontSize: 12 });
      const dataSlide = ppt.addSlide();
      dataSlide.addText('Key metrics and trends are available in the live dashboard.', { x: 0.5, y: 1, w: 9, h: 1.5, fontSize: 14 });
      const buffer = await ppt.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${new Date().toISOString().slice(0, 10)}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
      await exportPpt('Executive Dashboard', [{ title: 'Dashboard' }]);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={handleExportPdf}
        disabled={!!exporting}
      >
        {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
      </button>
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={handleExportPpt}
        disabled={!!exporting}
      >
        {exporting === 'ppt' ? 'Exporting…' : 'Export PPT'}
      </button>
    </div>
  );
}
