import jsPDF from 'jspdf';
import type { GridData, GridCell, Clue } from '../types';
import { BRAND_NAME, BRAND_PRIMARY_COLOR } from '../brand';

const A5_WIDTH = 148;
const A5_HEIGHT = 210;
const MARGIN = 10;
const GRID_MAX_HEIGHT = 90; // leave room for clues
const COLUMN_GAP = 5;

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

  if (maxRow === -1) {
    return [[{ char: null, isBlocker: true, number: null }]];
  }

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

const drawGrid = (
  doc: jsPDF,
  grid: GridCell[][],
  startY: number,
  showSolution: boolean
) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const availableWidth = A5_WIDTH - MARGIN * 2;
  const cellSize = Math.min(availableWidth / cols, GRID_MAX_HEIGHT / rows);
  const totalGridWidth = cols * cellSize;
  const startX = (A5_WIDTH - totalGridWidth) / 2;

  doc.setDrawColor(100, 100, 100);
  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const x = startX + c * cellSize;
      const y = startY + r * cellSize;

      if (cell.isBlocker) {
        doc.setFillColor(230, 230, 230);
        doc.rect(x, y, cellSize, cellSize, 'F');
      } else {
        doc.rect(x, y, cellSize, cellSize, 'S');
        if (cell.number) {
          doc.setFontSize(Math.max(5, cellSize / 4));
          doc.text(cell.number.toString(), x + 0.8, y + 1.2, { baseline: 'top' });
        }
        if (showSolution && cell.char) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(Math.max(8, cellSize / 1.7));
          doc.text(cell.char, x + cellSize / 2, y + cellSize / 2, {
            align: 'center',
            baseline: 'middle'
          });
          doc.setFont('helvetica', 'normal');
        }
      }
    }
  }

  return startY + rows * cellSize;
};

const drawClues = (
  doc: jsPDF,
  clues: { across: Clue[]; down: Clue[] },
  startY: number,
  availableHeight: number
) => {
  let fontSize = 9;
  const colWidth = (A5_WIDTH - MARGIN * 2 - COLUMN_GAP) / 2;

  const calcHeight = (list: Clue[], size: number) => {
    doc.setFontSize(size);
    const lineHeight = size * 0.3528 + 1;
    let h = (size + 2) * 0.3528 + 2; // heading
    list.forEach(c => {
      const text = `${c.number}. ${c.text}`;
      const lines = doc.splitTextToSize(text, colWidth);
      h += lines.length * lineHeight;
    });
    return h;
  };

  while (
    Math.max(calcHeight(clues.across, fontSize), calcHeight(clues.down, fontSize)) >
      availableHeight &&
    fontSize > 4
  ) {
    fontSize -= 0.5;
  }

  const lineHeight = fontSize * 0.3528 + 1;
  const headingHeight = (fontSize + 2) * 0.3528 + 2;

  // Across column
  let y = startY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize + 2);
  doc.text('Horizontais', MARGIN, y);
  y += headingHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  clues.across.forEach(c => {
    const text = `${c.number}. ${c.text}`;
    const lines = doc.splitTextToSize(text, colWidth);
    lines.forEach(line => {
      doc.text(line, MARGIN, y);
      y += lineHeight;
    });
  });

  // Down column
  y = startY;
  const x = MARGIN + colWidth + COLUMN_GAP;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize + 2);
  doc.text('Verticais', x, y);
  y += headingHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  clues.down.forEach(c => {
    const text = `${c.number}. ${c.text}`;
    const lines = doc.splitTextToSize(text, colWidth);
    lines.forEach(line => {
      doc.text(line, x, y);
      y += lineHeight;
    });
  });
};

export const generateCrosswordPdf = (
  gridData: GridData,
  theme: string,
  includeSolution: boolean
): void => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const compactGrid = createCompactGrid(gridData.grid);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_PRIMARY_COLOR);
    doc.text(BRAND_NAME.toUpperCase(), A5_WIDTH / 2, MARGIN + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(theme.toUpperCase(), A5_WIDTH / 2, MARGIN + 14, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    const gridStartY = MARGIN + 20;
    const gridBottom = drawGrid(doc, compactGrid, gridStartY, includeSolution);
    const cluesStartY = gridBottom + 5;
    const availableHeight = A5_HEIGHT - cluesStartY - MARGIN;

    drawClues(doc, gridData.clues, cluesStartY, availableHeight);

    const sanitizedTheme =
      theme.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') ||
      'palavras_cruzadas';
    doc.save(`${sanitizedTheme}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('An error occurred while generating the PDF.');
  }
};
