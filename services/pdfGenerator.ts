import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GridData } from '../types';

export const generateCrosswordPdf = (gridData: GridData, theme: string): void => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Add Title
    doc.setFontSize(18);
    doc.text(`Palavras Cruzadas: ${theme}`, pageWidth / 2, 20, { align: 'center' });

    // 2. Draw Grid
    const grid = gridData.grid;
    const gridSize = grid.length;
    const margin = 15;
    const availableWidth = pageWidth - margin * 2;
    const cellSize = availableWidth / gridSize;
    const startX = margin;
    const startY = 30;

    doc.setDrawColor(150, 150, 150); // Light grey for lines
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[r][c];
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        if (cell.isBlocker) {
          doc.setFillColor(40, 40, 40);
          doc.rect(x, y, cellSize, cellSize, 'F');
        } else {
          doc.rect(x, y, cellSize, cellSize);
          if (cell.number) {
            doc.setFontSize(Math.max(6, cellSize / 4));
            doc.setTextColor(80, 80, 80);
            doc.text(cell.number.toString(), x + 1, y + (cellSize / 4), {
              baseline: 'top',
            });
          }
        }
      }
    }
    doc.setTextColor(0, 0, 0); // Reset text color

    // 3. Add Clues
    let finalY = startY + gridSize * cellSize + 10;
    
    // Add a new page if clues won't fit well
    if (finalY > 200) {
        doc.addPage();
        finalY = 20;
    }

    const headStyles = {
        fillColor: '#4F46E5', // indigo-600
        textColor: 'white',
        fontStyle: 'bold',
    };
    const tableProps = {
        theme: 'grid' as const,
        headStyles: headStyles,
        styles: {
            fontSize: 9,
            cellPadding: 1.5,
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' as const },
            1: { cellWidth: 'auto' },
        },
    };

    if (gridData.clues.across.length > 0) {
      autoTable(doc, {
        ...tableProps,
        startY: finalY,
        head: [['Número', 'Horizontais']],
        body: gridData.clues.across.map(c => [c.number.toString(), c.text]),
      });
       finalY = (doc as any).lastAutoTable.finalY + 8;
    }

    if (gridData.clues.down.length > 0) {
        if (finalY > 250) { // Check again before adding second table
            doc.addPage();
            finalY = 20;
        }
       autoTable(doc, {
        ...tableProps,
        startY: finalY,
        head: [['Número', 'Verticais']],
        body: gridData.clues.down.map(c => [c.number.toString(), c.text]),
      });
    }

    // 4. Save PDF
    const sanitizedTheme = theme.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'palavras_cruzadas';
    doc.save(`${sanitizedTheme}.pdf`);

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Ocorreu um erro ao tentar gerar o PDF.");
  }
};