"use client";

import type { Doc } from "@/convex/_generated/dataModel";

type ExcelJSModule = typeof import("exceljs");
type Worksheet = import("exceljs").Worksheet;
type Borders = import("exceljs").Borders;
type Cell = import("exceljs").Cell;
type BorderStyle = import("exceljs").BorderStyle;

type ParsedInstallateur = {
    email?: string | null;
    nom?: string | null;
    telephone?: string | null;
};

type ParsedData = {
    bon_livraison?: string | null;
    client?: string | null;
    date_entree?: string | null;
    date_sortie?: string | null;
    description?: string | null;
    destination?: string | null;
    email?: string | null;
    entreprise?: string | null;
    heure_entree?: string | null;
    heure_sortie?: string | null;
    installateur?: ParsedInstallateur | null;
    matricule?: string | null;
    numero_pesee?: string | null;
    poids_entree_kg?: number | string | null;
    poids_net_kg?: number | string | null;
    poids_sortie_kg?: number | string | null;
    produit?: string | null;
    telephone?: string | null;
    transporteur?: string | null;
};

type ReceiptItem = {
    name: string;
    quantity?: number | null;
    unitPrice?: number | null;
    totalPrice?: number | null;
};

export type ReceiptDoc = Doc<"receipts"> & {
    parsedData?: ParsedData | null;
    items?: ReceiptItem[] | null;
};

export const RIVE_OPTIONS = ["VG 1 ere", "VG 2 EME"] as const;
export type RiveOption = (typeof RIVE_OPTIONS)[number];

export type ExcelExportMetadata = {
    section: string;
    rive: RiveOption;
};

type DerivedReceiptValues = {
    date: string;
    numberOfUnits: string;
    poidsNetKg: number;
    totalGeneralEngin: number;
};

type OfficialRow = {
    date: string;
    section: string;
    rive: string;
    numberOfUnits: string;
    poidsNetKg: number;
    totalGeneralEngin: number;
    totalGeneralTon: number;
};

type OfficialColumn = {
    header: string;
    key: keyof OfficialRow;
    width: number;
    isNumeric?: boolean;
};

const OFFICIAL_COLUMNS: OfficialColumn[] = [
    { header: "LA DATE", key: "date", width: 16 },
    { header: "Section", key: "section", width: 18 },
    { header: "Rive", key: "rive", width: 14 },
    { header: "N° bons", key: "numberOfUnits", width: 12 },
    { header: "POIDS NET (KG)", key: "poidsNetKg", width: 18, isNumeric: true },
    { header: "TOTAL GÉNÉRAL ENG.", key: "totalGeneralEngin", width: 20, isNumeric: true },
    { header: "TOTAL GÉNÉRAL EN TONE", key: "totalGeneralTon", width: 24, isNumeric: true },
];

const HEADER_LINES = [
    "ROYAUME DU MAROC",
    "MINISTÈRE DE L'EQUIPEMENT ET DE L'EAU",
    "DIRECTION RÉGIONALE DE L'EQUIPEMENT ET DE L'EAU DE FÈS",
    "DIRECTION PROVINCIALE DE L'EQUIPEMENT ET DE L'EAU DE TAOUNATE",
    "Travaux de dédoublement de la RN entre Fès et Taounate du PK769+050 au PK788+000, Province de Taounate",
    "Marché N° TAO/01/2024",
];

const DESIGNATION_LABEL = "Désignation des prestations";
const DESIGNATION_VALUE = "Mise en œuvre de GB3 014 classe 3 pour couche de base";
const FOOTER_LABELS = { left: "CONTRÔLE INTERNE", right: "CONTRÔLE EXTERIEUR" } as const;

const BORDER_COLOR = "FF2E7D32";
const NUMBER_FORMAT = "#,##0.000";
const EMBEDDED_LOGOS = {
    left: {
        base64:
            "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",
        extension: "jpeg",
    },
    right: {
        base64:
            "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",
        extension: "jpeg",
    },
} as const;

const numberFrom = (value: unknown): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const normalized = Number(value.replace(",", "."));
        if (!Number.isNaN(normalized)) return normalized;
    }
    return undefined;
};

const formatDateValue = (date?: string | null): string => {
    if (!date) return "";
    const parsed = Date.parse(date);
    if (!Number.isNaN(parsed)) {
        return new Date(parsed).toISOString().split("T")[0];
    }
    return date;
};

const deriveRowValues = (receipt: ReceiptDoc): DerivedReceiptValues => {
    const parsed = receipt.parsedData;
    const uploadDate = new Date(receipt.uploadedAt ?? Date.now());
    const items = Array.isArray(receipt.items) ? receipt.items : [];

    const sumItemTotals = items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
    const sumItemQuantities = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);

    const poidsNet = numberFrom(parsed?.poids_net_kg) ?? (sumItemQuantities || numberFrom(parsed?.poids_sortie_kg) || 0);
    const totalGeneralEngin =
        numberFrom(parsed?.poids_entree_kg) ??
        numberFrom(parsed?.poids_sortie_kg) ??
        (poidsNet && poidsNet > 0 ? poidsNet : sumItemTotals);

    return {
        date: formatDateValue(parsed?.date_sortie || parsed?.date_entree || receipt.transactionDate || uploadDate.toISOString()),
        numberOfUnits: parsed?.numero_pesee || (items.length ? `${items.length}` : "1"),
        poidsNetKg: Number(poidsNet?.toFixed(3) || 0),
        totalGeneralEngin: Number(totalGeneralEngin?.toFixed(3) || 0),
    };
};

const buildOfficialRows = (receipts: ReceiptDoc[], metadata: ExcelExportMetadata): OfficialRow[] => {
    const normalizedSection = metadata.section.trim() || "Section";
    return receipts.map((receipt) => {
        const derived = deriveRowValues(receipt);
        const tonValue = Number((derived.totalGeneralEngin / 1000).toFixed(3));
        return {
            date: derived.date,
            section: normalizedSection,
            rive: metadata.rive,
            numberOfUnits: derived.numberOfUnits,
            poidsNetKg: derived.poidsNetKg,
            totalGeneralEngin: derived.totalGeneralEngin,
            totalGeneralTon: tonValue,
        };
    });
};

const sumRows = <T extends Record<string, unknown>>(rows: T[], key: keyof T) =>
    rows.reduce((sum, row) => {
        const value = row[key];
        return typeof value === "number" ? sum + value : sum;
    }, 0);

const loadExcelModule = async (): Promise<ExcelJSModule> => {
    if (typeof window === "undefined") {
        return import("exceljs");
    }
    return (await import("exceljs/dist/exceljs.min.js")) as ExcelJSModule;
};

const THIN_BORDER_STYLE: BorderStyle = "thin";

const createBorder = (): Partial<Borders> => ({
    top: { style: THIN_BORDER_STYLE, color: { argb: BORDER_COLOR } },
    bottom: { style: THIN_BORDER_STYLE, color: { argb: BORDER_COLOR } },
    left: { style: THIN_BORDER_STYLE, color: { argb: BORDER_COLOR } },
    right: { style: THIN_BORDER_STYLE, color: { argb: BORDER_COLOR } },
});

const applyTableCellStyle = (cell: Cell, isNumeric: boolean) => {
    cell.border = createBorder();
    cell.font = { name: "Calibri", size: 11 };
    cell.alignment = { horizontal: isNumeric ? "right" : "center", vertical: "middle", wrapText: true };
    if (isNumeric) {
        cell.numFmt = NUMBER_FORMAT;
    }
};

const applyHeaderCellStyle = (cell: Cell) => {
    cell.border = createBorder();
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F5132" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2F3E5" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
};

const applyTotalCellStyle = (cell: Cell, isFirstColumn: boolean, isNumeric: boolean) => {
    cell.border = createBorder();
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F5132" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC8E6C9" } };
    cell.alignment = { horizontal: isFirstColumn ? "left" : isNumeric ? "right" : "center", vertical: "middle" };
    if (isNumeric) {
        cell.numFmt = NUMBER_FORMAT;
    }
};

const mergeRow = (ws: Worksheet, rowNumber: number, startCol: number, endCol: number) => {
    if (startCol === endCol) return;
    ws.mergeCells(rowNumber, startCol, rowNumber, endCol);
};

const addLogos = (workbook: import("exceljs").Workbook, worksheet: Worksheet) => {
    const leftId = workbook.addImage({
        base64: EMBEDDED_LOGOS.left.base64,
        extension: EMBEDDED_LOGOS.left.extension,
    });
    const rightId = workbook.addImage({
        base64: EMBEDDED_LOGOS.right.base64,
        extension: EMBEDDED_LOGOS.right.extension,
    });
    worksheet.addImage(leftId, "A1:B6");
    worksheet.addImage(rightId, "F1:G6");
};

const buildOfficialWorksheet = async (
    ExcelJS: ExcelJSModule,
    receipts: ReceiptDoc[],
    metadata: ExcelExportMetadata,
): Promise<Worksheet> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ReceipAI";
    const worksheet = workbook.addWorksheet("Receipt", {
        properties: { defaultRowHeight: 22 },
        views: [{ showGridLines: false }],
    });

    addLogos(workbook, worksheet);

    OFFICIAL_COLUMNS.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = col.width;
    });

    const columnCount = OFFICIAL_COLUMNS.length;

    HEADER_LINES.forEach((line, idx) => {
        const rowNumber = idx + 1;
        mergeRow(worksheet, rowNumber, 1, columnCount);
        const cell = worksheet.getCell(rowNumber, 1);
        cell.value = line;
        cell.font = {
            name: "Cambria",
            bold: true,
            size: idx === 0 ? 16 : idx <= 3 ? 13 : 12,
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    const sectionRow = HEADER_LINES.length + 2;
    mergeRow(worksheet, sectionRow, 1, 3);
    mergeRow(worksheet, sectionRow, 5, columnCount);
    const sectionCell = worksheet.getCell(sectionRow, 1);
    sectionCell.value = `Section : ${metadata.section.trim()}`;
    sectionCell.font = { name: "Cambria", size: 12, bold: true };
    sectionCell.alignment = { horizontal: "left", vertical: "middle" };

    const riveCell = worksheet.getCell(sectionRow, 5);
    riveCell.value = `Rive : ${metadata.rive}`;
    riveCell.font = { name: "Cambria", size: 12, bold: true };
    riveCell.alignment = { horizontal: "right", vertical: "middle" };

    const designationLabelRow = sectionRow + 2;
    const designationValueRow = designationLabelRow + 1;
    mergeRow(worksheet, designationLabelRow, 1, columnCount);
    mergeRow(worksheet, designationValueRow, 1, columnCount);

    const labelCell = worksheet.getCell(designationLabelRow, 1);
    labelCell.value = DESIGNATION_LABEL;
    labelCell.font = { name: "Cambria", size: 12, bold: true, color: { argb: "FF1B5E20" } };
    labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F8E9" } };
    labelCell.alignment = { horizontal: "left", vertical: "middle" };
    labelCell.border = createBorder();

    const valueCell = worksheet.getCell(designationValueRow, 1);
    valueCell.value = DESIGNATION_VALUE;
    valueCell.font = { name: "Cambria", size: 11 };
    valueCell.alignment = { horizontal: "left", vertical: "middle" };
    valueCell.border = createBorder();

    const tableHeaderRow = designationValueRow + 2;
    const dataStartRow = tableHeaderRow + 1;
    const rows = buildOfficialRows(receipts, metadata);
    const totalRowIndex = dataStartRow + rows.length;
    const footerRowIndex = totalRowIndex + 2;

    OFFICIAL_COLUMNS.forEach((col, idx) => {
        const cell = worksheet.getCell(tableHeaderRow, idx + 1);
        cell.value = col.header;
        applyHeaderCellStyle(cell);
    });

    rows.forEach((row, rowIdx) => {
        const excelRow = worksheet.getRow(dataStartRow + rowIdx);
        OFFICIAL_COLUMNS.forEach((col, colIdx) => {
            const cell = excelRow.getCell(colIdx + 1);
            cell.value = row[col.key];
            applyTableCellStyle(cell, Boolean(col.isNumeric));
        });
    });

    const totalRow = worksheet.getRow(totalRowIndex);
    OFFICIAL_COLUMNS.forEach((col, idx) => {
        const cell = totalRow.getCell(idx + 1);
        if (idx === 0) {
            cell.value = "TOTAL";
        } else if (col.key === "poidsNetKg" || col.key === "totalGeneralEngin" || col.key === "totalGeneralTon") {
            const totalValue = Number(sumRows(rows, col.key).toFixed(3));
            cell.value = totalValue;
        } else {
            cell.value = "";
        }
        applyTotalCellStyle(cell, idx === 0, Boolean(col.isNumeric));
    });

    mergeRow(worksheet, footerRowIndex, 1, 3);
    mergeRow(worksheet, footerRowIndex, columnCount - 2, columnCount);
    const footerLeftCell = worksheet.getCell(footerRowIndex, 1);
    footerLeftCell.value = FOOTER_LABELS.left;
    footerLeftCell.font = { name: "Cambria", size: 11, bold: true };
    footerLeftCell.alignment = { horizontal: "center", vertical: "middle" };

    const footerRightCell = worksheet.getCell(footerRowIndex, columnCount - 2);
    footerRightCell.value = FOOTER_LABELS.right;
    footerRightCell.font = { name: "Cambria", size: 11, bold: true };
    footerRightCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.getRow(tableHeaderRow).height = 28;
    worksheet.getRow(designationLabelRow).height = 26;
    worksheet.getRow(designationValueRow).height = 26;

    return worksheet;
};

const generateWorkbookBuffer = async (receipts: ReceiptDoc[], metadata: ExcelExportMetadata): Promise<ArrayBuffer> => {
    if (!Array.isArray(receipts) || receipts.length === 0) {
        throw new Error("No receipts provided for export");
    }
    const ExcelJS = await loadExcelModule();
    const worksheet = await buildOfficialWorksheet(ExcelJS, receipts, metadata);
    const workbook = worksheet.workbook;
    return workbook.xlsx.writeBuffer();
};

export async function generateReceiptWorkbookBuffer(
    receipt: ReceiptDoc,
    metadata: ExcelExportMetadata,
): Promise<ArrayBuffer> {
    return generateWorkbookBuffer([receipt], metadata);
}

export async function generateReceiptsWorkbookBuffer(
    receipts: ReceiptDoc[],
    metadata: ExcelExportMetadata,
): Promise<ArrayBuffer> {
    return generateWorkbookBuffer(receipts, metadata);
}
