import { jsPDF } from 'jspdf';
import React from 'react';

interface PrintTemplateProps extends React.PropsWithChildren {
  title: string;
}

export interface IPdfTemplate {
  drawHeader: (doc: jsPDF, title: string) => void;
  drawFooter: (doc: jsPDF, currentPage: number, totalPages: number) => void;
}

export const gridPdfTemplate: IPdfTemplate = {
  drawHeader: (doc, title) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(title.toUpperCase(), 10, 15);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 10, 22);

    doc.setDrawColor(200);
    doc.line(10, 25, pageWidth - 10, 25);
  },
  drawFooter: (doc, currentPage, totalPages) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('KEUKEN S.A', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Página ${currentPage} de ${totalPages}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
  }
};
