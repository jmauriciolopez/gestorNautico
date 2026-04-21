import type PDFKit from 'pdfkit';

declare module 'pdfkit-table' {
  interface TableRow {
    [key: number]: string | number | Buffer | undefined;
    length: number;
  }

  interface TableOptions {
    /**
     * Prepare the header row — called once per header column
     */
    prepareHeader?: (row: TableRow, colIndex: number) => void;
    /**
     * Prepare each data row — called per row and column
     */
    prepareRow?: (row: TableRow, colIndex: number, rowIndex: number) => void;
    /**
     * Width of each column in order
     * @default [190, 75, 80, 65, 80]
     */
    columnsSize?: number[];
    /**
     * Minimum row height
     * @default 30
     */
    minRowHeight?: number;
    /**
     * Row height
     * @default 25
     */
    height?: number;
    /**
     * Hide header row
     * @default false
     */
    hideHeader?: boolean;
    /**
     * Show grid lines
     * @default true
     */
    showLines?: boolean;
    /**
     * Width of grid lines
     * @default 0.5
     */
    lineWidth?: number;
    /**
     * Color of grid lines
     * @default '#000'
     */
    lineColor?: string;
    /**
     * Vertical padding inside cells
     * @default 5
     */
    columnPadding?: number;
  }

  interface TableDefinition {
    /** Title rendered above the table */
    title?: string;
    /** Array of header column labels */
    headers: string[];
    /** 2D array of cell values */
    rows: (string | number)[][];
  }

  interface PDFDocumentTable extends PDFKit.PDFDocument {
    /**
     * Renders a table at the current cursor position.
     * Returns `this` for method chaining.
     */
    table(data: TableDefinition, options?: TableOptions): this;
  }

  export default function PDFDocument(
    options?: PDFKit.PDFDocumentOptions,
  ): PDFDocumentTable;
}
