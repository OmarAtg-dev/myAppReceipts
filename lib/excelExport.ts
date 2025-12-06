"use client";

import type { Doc } from "@/convex/_generated/dataModel";

type ExcelJSModule = typeof import("exceljs");
type Worksheet = import("exceljs").Worksheet;

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
const LOGO_URLS = {
    left: "https://www.emploi.ma/sites/default/files/styles/medium/public/logo/logo_145.jpg?itok=7wOeULIP",
    right: "https://media.licdn.com/dms/image/v2/C4E0BAQG21DJeY0YeDw/company-logo_200_200/company-logo_200_200/0/1636530210120/ministere_equipement_eau_logo?e=1766620800&v=beta&t=Hs_jMPx_qOHh2uWKQpLZJuxWcAzZJfkzaqz1TwYn3Kk",
} as const;

const logoCache: Partial<Record<keyof typeof LOGO_URLS, { base64: string; extension: "png" | "jpeg" }>> = {};

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

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const detectExtension = (contentType?: string | null, fallback: "png" | "jpeg" = "png"): "png" | "jpeg" => {
    if (!contentType) return fallback;
    if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpeg";
    if (contentType.includes("png")) return "png";
    return fallback;
};

const fetchLogo = async (key: keyof typeof LOGO_URLS): Promise<{ base64: string; extension: "png" | "jpeg" }> => {
    if (logoCache[key]) {
        return logoCache[key]!;
    }
    const response = await fetch(LOGO_URLS[key]);
    if (!response.ok) {
        throw new Error(`Unable to download ${key} logo.`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const extension = detectExtension(response.headers.get("content-type"), key === "left" ? "jpeg" : "png");
    const result = { base64, extension };
    logoCache[key] = result;
    return result;
};

const createBorder = () => ({
    top: { style: "thin", color: { argb: BORDER_COLOR } },
    bottom: { style: "thin", color: { argb: BORDER_COLOR } },
    left: { style: "thin", color: { argb: BORDER_COLOR } },
    right: { style: "thin", color: { argb: BORDER_COLOR } },
});

const applyTableCellStyle = (cell: import("exceljs").Cell, isNumeric: boolean) => {
    cell.border = createBorder();
    cell.font = { name: "Calibri", size: 11 };
    cell.alignment = { horizontal: isNumeric ? "right" : "center", vertical: "middle", wrapText: true };
    if (isNumeric) {
        cell.numFmt = NUMBER_FORMAT;
    }
};

const applyHeaderCellStyle = (cell: import("exceljs").Cell) => {
    cell.border = createBorder();
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F5132" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2F3E5" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
};

const applyTotalCellStyle = (cell: import("exceljs").Cell, isFirstColumn: boolean, isNumeric: boolean) => {
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

const addLogos = async (workbook: import("exceljs").Workbook, worksheet: Worksheet) => {
    const [leftLogo, rightLogo] = await Promise.all([fetchLogo("left"), fetchLogo("right")]);
    const leftId = workbook.addImage({ base64: leftLogo.base64, extension: leftLogo.extension });
    const rightId = workbook.addImage({ base64: rightLogo.base64, extension: rightLogo.extension });
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

    await addLogos(workbook, worksheet);

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
