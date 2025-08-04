import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GridData, GridCell, Clue } from '../types';

const A5_WIDTH = 148;
const A5_HEIGHT = 210;
const MARGIN = 10;

// New helper function to create a compact grid
const createCompactGrid = (grid: GridCell[][]): GridCell[][] => {
    let minRow = grid.length, maxRow = -1, minCol = grid[0].length, maxCol = -1;

    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (!cell.isBlocker) {
                if (r < minRow) minRow = r;
                if (r > maxRow) maxRow = r;
                if (c < minCol) minCol = c;
                if (c > maxCol) maxCol = c;
            }
        });
    });

    // If no words were placed, return a small empty grid
    if (maxRow === -1) {
        return [[{ char: null, isBlocker: true, number: null }]];
    }

    // Add a 1-cell margin
    minRow = Math.max(0, minRow - 1);
    maxRow = Math.min(grid.length - 1, maxRow + 1);
    minCol = Math.max(0, minCol - 1);
    maxCol = Math.min(grid[0].length - 1, maxCol + 1);

    const compactGrid: GridCell[][] = [];
    for (let r = minRow; r <= maxRow; r++) {
        compactGrid.push(grid[r].slice(minCol, maxCol + 1));
    }

    return compactGrid;
};


// Helper to draw the grid
const drawGrid = (doc: jsPDF, grid: GridCell[][], startY: number, showSolution: boolean) => {
    const gridSize = grid.length;
    const gridColSize = grid[0].length;
    const availableWidth = A5_WIDTH - MARGIN * 2;
    // Make cell size dependent on the larger dimension to maintain aspect ratio
    const cellSize = availableWidth / Math.max(gridSize, gridColSize);
    const totalGridWidth = gridColSize * cellSize;
    const startX = (A5_WIDTH - totalGridWidth) / 2; // Center the grid horizontally

    doc.setDrawColor(100, 100, 100); // Darker gray for lines
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.2);

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridColSize; c++) {
            const cell = grid[r][c];
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;

            if (cell.isBlocker) {
                // Using a pattern instead of solid black for better printing
                doc.setFillColor(230, 230, 230); // Light gray fill for blockers
                doc.rect(x, y, cellSize, cellSize, 'F');
            } else {
                doc.rect(x, y, cellSize, cellSize, 'S'); // Draw border
                if (cell.number) {
                    doc.setFontSize(Math.max(5, cellSize / 4));
                    doc.text(cell.number.toString(), x + 0.8, y + 1.2, { baseline: 'top' });
                }
                if (showSolution && cell.char) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(Math.max(8, cellSize / 1.7));
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
        styles: {
            fontSize: 9,
            cellPadding: { top: 0.5, right: 1, bottom: 0.5, left: 1 },
            valign: 'top' as const,
            lineWidth: 0,
        },
        columnStyles: {
            0: { cellWidth: 8, fontStyle: 'bold' as const },
            1: { cellWidth: colWidth - 8 }
        },
        showHead: 'firstPage' as const,
        headStyles: {
            fontStyle: 'bold',
            fontSize: 11,
            textColor: 0,
            halign: 'left' as const,
            cellPadding: { top: 0, right: 0, bottom: 2, left: 1 }
        },
        // Remove background colors for a black and white design
        didParseCell: function (data: any) {
            data.cell.styles.fillColor = '#ffffff';
        }
    };

    autoTable(doc, { ...tableProps, head: [['Horizontais']], body: acrossBody, startY, margin: { left: col1X } });
    autoTable(doc, { ...tableProps, head: [['Verticais']], body: downBody, startY, margin: { left: col2X } });
};

// Main PDF generation function
export const generateCrosswordPdf = (gridData: GridData, theme: string, includeSolution: boolean): void => {
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
        const compactGrid = createCompactGrid(gridData.grid);

        // --- Puzzle Page ---
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(theme.toUpperCase(), A5_WIDTH / 2, MARGIN + 5, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        // Draw the compact grid
        const gridEndY = drawGrid(doc, compactGrid, MARGIN + 12, false);

        // Draw the clues below the grid on the same page
        const cluesStartY = gridEndY + 7;
        drawClues(doc, gridData.clues, cluesStartY);

        // --- Solution Page (Optional) ---
        if (includeSolution) {
            doc.addPage();
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('SOLUÇÃO', A5_WIDTH / 2, MARGIN + 5, { align: 'center' });
            doc.setFont('helvetica', 'normal');

            // Draw the compact grid with the solution
            drawGrid(doc, compactGrid, MARGIN + 12, true);
        }

        const sanitizedTheme = theme.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'palavras_cruzadas';
        doc.save(`${sanitizedTheme}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF.");
    }
};
