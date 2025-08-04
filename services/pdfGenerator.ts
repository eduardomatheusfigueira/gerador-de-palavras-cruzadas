import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GridData, GridCell, Clue } from '../types';

const A5_WIDTH = 148;
const A5_HEIGHT = 210;
const MARGIN = 10;

// Helper to draw the grid
const drawGrid = (doc: jsPDF, grid: GridCell[][], startY: number, showSolution: boolean) => {
    const gridSize = grid.length;
    const availableWidth = A5_WIDTH - MARGIN * 2;
    const cellSize = availableWidth / gridSize;
    const startX = MARGIN;

    doc.setDrawColor(150, 150, 150);
    doc.setTextColor(0, 0, 0);

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = grid[r][c];
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;

            if (cell.isBlocker) {
                doc.setFillColor(40, 40, 40);
                doc.rect(x, y, cellSize, cellSize, 'F');
            } else {
                doc.rect(x, y, cellSize, cellSize, 'S');
                if (cell.number) {
                    doc.setFontSize(Math.max(5, cellSize / 4.5));
                    doc.text(cell.number.toString(), x + 0.8, y + 1, { baseline: 'top' });
                }
                if (showSolution && cell.char) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(Math.max(8, cellSize / 1.8));
                    doc.text(cell.char, x + cellSize / 2, y + cellSize / 2, { align: 'center', baseline: 'middle' });
                    doc.setFont('helvetica', 'normal');
                }
            }
        }
    }
    return startY + gridSize * cellSize;
};

// Helper to draw clues
const drawClues = (doc: jsPDF, clues: { across: Clue[], down: Clue[] }, startY: number) => {
    const colWidth = (A5_WIDTH - MARGIN * 2 - 5) / 2;
    const col1X = MARGIN;
    const col2X = MARGIN + colWidth + 5;

    const acrossBody = clues.across.map(c => [`${c.number}.`, c.text]);
    const downBody = clues.down.map(c => [`${c.number}.`, c.text]);

    const tableProps = {
        theme: 'plain' as const,
        styles: { fontSize: 9, cellPadding: { top: 0.5, right: 1, bottom: 0.5, left: 1 }, valign: 'top' as const },
        columnStyles: {
            0: { cellWidth: 8, fontStyle: 'bold' as const },
            1: { cellWidth: colWidth - 8 }
        },
        showHead: 'firstPage' as const,
        headStyles: { fontStyle: 'bold', fontSize: 11, fillColor: undefined, textColor: 0, halign: 'left' as const, cellPadding: { top: 0, right: 0, bottom: 2, left: 1 } },
    };

    autoTable(doc, { ...tableProps, head: [['Horizontais']], body: acrossBody, startY, margin: { left: col1X } });
    autoTable(doc, { ...tableProps, head: [['Verticais']], body: downBody, startY, margin: { left: col2X } });
};

// Main PDF generation function
export const generateCrosswordPdf = (gridData: GridData, theme: string): void => {
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

        // --- Puzzle Page ---
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(theme.toUpperCase(), A5_WIDTH / 2, 15, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        const gridEndY = drawGrid(doc, gridData.grid, 22, false);

        let cluesStartY = gridEndY + 8;
        if (cluesStartY > A5_HEIGHT - 60) { // Check if there's enough space for clues
            doc.addPage();
            cluesStartY = MARGIN;
        }
        drawClues(doc, gridData.clues, cluesStartY);

        // --- Solution Page ---
        doc.addPage();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SOLUÇÃO', A5_WIDTH / 2, 15, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        drawGrid(doc, gridData.grid, 22, true);

        const sanitizedTheme = theme.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'palavras_cruzadas';
        doc.save(`${sanitizedTheme}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF.");
    }
};
