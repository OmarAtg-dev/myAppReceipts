"use client";

import type { Doc } from "@/convex/_generated/dataModel";

type XLSXModule = typeof import("xlsx-js-style");
type Worksheet = import("xlsx-js-style").WorkSheet;
type CellObject = import("xlsx-js-style").CellObject;

export const RIVE_OPTIONS = ["VG 1 ere", "VG 2 EME"] as const;
export type RiveOption = (typeof RIVE_OPTIONS)[number];

export type ExcelExportMetadata = {
    section: string;
    rive: RiveOption;
};

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

type DerivedReceiptValues = {
    date: string;
    section: string;
    ribs: string;
    numberOfUnits: string;
    poidsNetKg: number;
    totalGeneral: number;
    totalGeneralEngin: number;
    currency: string;
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
const FOOTER_LABELS = { left: "CONTRÔLE INTERNE", right: "CONTRÔLE EXTERIEUR" };

const BORDER_COLOR = "FF2E7D32";

const borderStyle = {
    border: {
        top: { style: "thin", color: { rgb: BORDER_COLOR } },
        bottom: { style: "thin", color: { rgb: BORDER_COLOR } },
        left: { style: "thin", color: { rgb: BORDER_COLOR } },
        right: { style: "thin", color: { rgb: BORDER_COLOR } },
    },
};

const headerCellStyle = {
    ...borderStyle,
    font: { bold: true, color: { rgb: "FF0F5132" }, name: "Calibri" },
    fill: { patternType: "solid", fgColor: { rgb: "FFE2F3E5" } },
    alignment: { horizontal: "center", vertical: "center" },
};

const dataCellStyle = {
    ...borderStyle,
    font: { name: "Calibri" },
    alignment: { horizontal: "center", vertical: "center" },
};

const totalCellStyle = {
    ...borderStyle,
    font: { bold: true, color: { rgb: "FF0F5132" }, name: "Calibri" },
    fill: { patternType: "solid", fgColor: { rgb: "FFC8E6C9" } },
    alignment: { horizontal: "center", vertical: "center" },
};

const mainTitleStyle = {
    font: { bold: true, sz: 16, name: "Cambria" },
    alignment: { horizontal: "center", vertical: "center" },
};

const subtitleStyle = {
    font: { bold: true, sz: 13, name: "Cambria" },
    alignment: { horizontal: "center", vertical: "center" },
};

const infoLineStyle = {
    font: { sz: 11, name: "Cambria" },
    alignment: { horizontal: "center", vertical: "center" },
};

const designationLabelStyle = {
    ...borderStyle,
    font: { bold: true, sz: 12, name: "Cambria", color: { rgb: "FF1B5E20" } },
    fill: { patternType: "solid", fgColor: { rgb: "FFF1F8E9" } },
    alignment: { horizontal: "left", vertical: "center" },
};

const designationValueStyle = {
    ...borderStyle,
    font: { sz: 11, name: "Cambria" },
    alignment: { horizontal: "left", vertical: "center" },
};

const footerCellStyleLeft = {
    font: { bold: true, name: "Cambria" },
    alignment: { horizontal: "center", vertical: "center" },
};

const footerCellStyleRight = {
    font: { bold: true, name: "Cambria" },
    alignment: { horizontal: "center", vertical: "center" },
};

const numberFormat = "#,##0.000";

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

    const transactionAmount = numberFrom(receipt.transactionAmount);
    const poidsNet = numberFrom(parsed?.poids_net_kg) ?? (sumItemQuantities || numberFrom(parsed?.poids_sortie_kg) || 0);
    const totalGeneral = transactionAmount ?? sumItemTotals;
    const totalGeneralEngin =
        numberFrom(parsed?.poids_entree_kg) ??
        numberFrom(parsed?.poids_sortie_kg) ??
        (poidsNet && poidsNet > 0 ? poidsNet : sumItemTotals);

    return {
        date: formatDateValue(parsed?.date_sortie || parsed?.date_entree || receipt.transactionDate || uploadDate.toISOString()),
        section: parsed?.destination || parsed?.produit || receipt.merchantName || "Section principale",
        ribs: parsed?.matricule || parsed?.transporteur || receipt.merchantContact || "",
        numberOfUnits: parsed?.numero_pesee || (items.length ? `${items.length}` : "1"),
        poidsNetKg: Number(poidsNet?.toFixed(3) || 0),
        totalGeneral: Number(totalGeneral?.toFixed(3) || 0),
        totalGeneralEngin: Number(totalGeneralEngin?.toFixed(3) || 0),
        currency: receipt.currency || "",
    };
};

const buildOfficialRows = (receipts: ReceiptDoc[], metadata: ExcelExportMetadata): OfficialRow[] => {
    const normalizedSection = metadata.section.trim() || "Section";
    return receipts.map((receipt) => {
        const derived = deriveRowValues(receipt);
        const engin = derived.totalGeneralEngin;
        const tonValue = Number((engin / 1000).toFixed(3));
        return {
            date: derived.date,
            section: normalizedSection,
            rive: metadata.rive,
            numberOfUnits: derived.numberOfUnits,
            poidsNetKg: derived.poidsNetKg,
            totalGeneralEngin: engin,
            totalGeneralTon: tonValue,
        };
    });
};

const getMerges = (ws: Worksheet) => {
    if (!ws["!merges"]) {
        ws["!merges"] = [];
    }
    return ws["!merges"];
};

const applyStyle = (
    ws: Worksheet,
    XLSX: XLSXModule,
    rowIndex: number,
    columnIndex: number,
    style: Record<string, unknown>,
    numberFormatOverride?: string,
): void => {
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex - 1, c: columnIndex - 1 });
    if (!ws[cellAddress]) {
        ws[cellAddress] = { t: "s", v: "" };
    }
    const cell = ws[cellAddress] as CellObject & { s?: Record<string, unknown>; z?: string };
    cell.s = { ...(cell.s ?? {}), ...style };
    if (numberFormatOverride) {
        cell.z = numberFormatOverride;
    }
};

const styleRange = (
    ws: Worksheet,
    XLSX: XLSXModule,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
    style: Record<string, unknown>,
    numericColumns: Set<number> = new Set(),
) => {
    for (let r = startRow; r <= endRow; r += 1) {
        for (let c = startCol; c <= endCol; c += 1) {
            const format = numericColumns.has(c) ? numberFormat : undefined;
            applyStyle(ws, XLSX, r, c, style, format);
        }
    }
};

const sumRows = <T extends Record<string, unknown>>(rows: T[], key: keyof T) =>
    rows.reduce((sum, row) => {
        const value = row[key];
        return typeof value === "number" ? sum + value : sum;
    }, 0);

const buildOfficialWorksheet = (
    XLSX: XLSXModule,
    receipts: ReceiptDoc[],
    metadata: ExcelExportMetadata,
): { ws: Worksheet } => {
    const rows = buildOfficialRows(receipts, metadata);
    const ws = XLSX.utils.aoa_to_sheet([]);
    const columnCount = OFFICIAL_COLUMNS.length;

    HEADER_LINES.forEach((line, index) => {
        const rowNumber = index + 1;
        XLSX.utils.sheet_add_aoa(ws, [[line]], { origin: `A${rowNumber}` });
        getMerges(ws).push({
            s: { r: rowNumber - 1, c: 0 },
            e: { r: rowNumber - 1, c: columnCount - 1 },
        });
        const style = index === 0 ? mainTitleStyle : index <= 3 ? subtitleStyle : infoLineStyle;
        styleRange(ws, XLSX, rowNumber, rowNumber, 1, columnCount, style);
    });

    const designationLabelRow = HEADER_LINES.length + 2;
    const designationValueRow = designationLabelRow + 1;
    const tableHeaderRow = designationValueRow + 2;
    const dataStartRow = tableHeaderRow + 1;
    const totalRowIndex = dataStartRow + rows.length;
    const footerRowIndex = totalRowIndex + 2;

    XLSX.utils.sheet_add_aoa(ws, [[DESIGNATION_LABEL]], { origin: `A${designationLabelRow}` });
    getMerges(ws).push({
        s: { r: designationLabelRow - 1, c: 0 },
        e: { r: designationLabelRow - 1, c: columnCount - 1 },
    });
    styleRange(ws, XLSX, designationLabelRow, designationLabelRow, 1, columnCount, designationLabelStyle);

    XLSX.utils.sheet_add_aoa(ws, [[DESIGNATION_VALUE]], { origin: `A${designationValueRow}` });
    getMerges(ws).push({
        s: { r: designationValueRow - 1, c: 0 },
        e: { r: designationValueRow - 1, c: columnCount - 1 },
    });
    styleRange(ws, XLSX, designationValueRow, designationValueRow, 1, columnCount, designationValueStyle);

    const headerRow = OFFICIAL_COLUMNS.map((col) => col.header);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: `A${tableHeaderRow}` });

    const dataRows = rows.map((row) => OFFICIAL_COLUMNS.map((col) => row[col.key] ?? ""));
    if (dataRows.length > 0) {
        XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: `A${dataStartRow}` });
    }

    const totalRow = [
        "TOTAL",
        "",
        "",
        "",
        Number(sumRows(rows, "poidsNetKg").toFixed(3)),
        Number(sumRows(rows, "totalGeneralEngin").toFixed(3)),
        Number(sumRows(rows, "totalGeneralTon").toFixed(3)),
    ];
    XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${totalRowIndex}` });

    const footerRow = Array(columnCount).fill("");
    footerRow[0] = FOOTER_LABELS.left;
    footerRow[columnCount - 3] = FOOTER_LABELS.right;
    XLSX.utils.sheet_add_aoa(ws, [footerRow], { origin: `A${footerRowIndex}` });
    getMerges(ws).push({ s: { r: footerRowIndex - 1, c: 0 }, e: { r: footerRowIndex - 1, c: 2 } });
    getMerges(ws).push({
        s: { r: footerRowIndex - 1, c: columnCount - 3 },
        e: { r: footerRowIndex - 1, c: columnCount - 1 },
    });
    styleRange(ws, XLSX, footerRowIndex, footerRowIndex, 1, 3, footerCellStyleLeft);
    styleRange(ws, XLSX, footerRowIndex, footerRowIndex, columnCount - 2, columnCount, footerCellStyleRight);

    ws["!cols"] = OFFICIAL_COLUMNS.map((col) => ({ wch: col.width }));

    const numericColumnIndexes = new Set(
        OFFICIAL_COLUMNS.map((col, idx) => (col.isNumeric ? idx + 1 : null)).filter((value): value is number => value !== null),
    );

    styleRange(ws, XLSX, tableHeaderRow, tableHeaderRow, 1, columnCount, headerCellStyle, numericColumnIndexes);
    if (rows.length > 0) {
        styleRange(ws, XLSX, dataStartRow, dataStartRow + rows.length - 1, 1, columnCount, dataCellStyle, numericColumnIndexes);
    }
    styleRange(ws, XLSX, totalRowIndex, totalRowIndex, 1, columnCount, totalCellStyle, numericColumnIndexes);

    return { ws };
};

export async function generateReceiptWorkbookBuffer(
    receipt: ReceiptDoc,
    metadata: ExcelExportMetadata,
): Promise<ArrayBuffer> {
    const XLSX = await import("xlsx-js-style");
    const { ws } = buildOfficialWorksheet(XLSX, [receipt], metadata);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt");
    return XLSX.write(wb, { bookType: "xlsx", type: "array", compression: true });
}

export async function generateReceiptsWorkbookBuffer(
    receipts: ReceiptDoc[],
    metadata: ExcelExportMetadata,
): Promise<ArrayBuffer> {
    if (!Array.isArray(receipts) || receipts.length === 0) {
        throw new Error("No receipts provided for export");
    }
    const XLSX = await import("xlsx-js-style");
    const { ws } = buildOfficialWorksheet(XLSX, receipts, metadata);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, receipts.length === 1 ? "Receipt" : "Receipts");
    return XLSX.write(wb, { bookType: "xlsx", type: "array", compression: true });
}
