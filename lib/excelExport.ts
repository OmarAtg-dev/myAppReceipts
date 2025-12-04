"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import type { WorkSheet } from "xlsx";

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

type ReceiptDoc = Doc<"receipts"> & {
    parsedData?: ParsedData | null;
    items?: ReceiptItem[] | null;
};

type XLSXModule = typeof import("xlsx-js-style");

type ColumnConfig = {
    header: string;
    key: string;
    width: number;
    isNumeric?: boolean;
};

type DynamicColumn = ColumnConfig & { value: string };

const BASE_COLUMNS: ColumnConfig[] = [
    { header: "Date", key: "date", width: 15 },
    { header: "Section", key: "section", width: 18 },
    { header: "Ribs", key: "ribs", width: 18 },
    { header: "N° bons", key: "numberOfUnits", width: 14 },
    { header: "Poids net (kg)", key: "poidsNetKg", width: 18, isNumeric: true },
    { header: "Total général", key: "totalGeneral", width: 18, isNumeric: true },
    { header: "Total général engin", key: "totalGeneralEngin", width: 22, isNumeric: true },
    { header: "Devise", key: "currency", width: 10 },
];

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
    font: { bold: true, color: { rgb: "FF0F5132" } },
    fill: { patternType: "solid", fgColor: { rgb: "FFE2F3E5" } },
    alignment: { horizontal: "center", vertical: "center" },
};

const dataCellStyle = {
    ...borderStyle,
    alignment: { horizontal: "left", vertical: "center" },
};

const totalCellStyle = {
    ...borderStyle,
    font: { bold: true, color: { rgb: "FF0F5132" } },
    fill: { patternType: "solid", fgColor: { rgb: "FFC8E6C9" } },
};

const secondaryHeaderStyle = {
    ...headerCellStyle,
    fill: { patternType: "solid", fgColor: { rgb: "FFDFF4FF" } },
};

const numberFormat = "#,##0.00";

const DYNAMIC_FIELD_CONFIG: Array<{
    key: string;
    header: string;
    width: number;
    value: (receipt: ReceiptDoc) => string | number | undefined | null;
}> = [
    { key: "client", header: "Client", width: 18, value: (r) => r.parsedData?.client },
    { key: "destination", header: "Destination", width: 20, value: (r) => r.parsedData?.destination },
    { key: "produit", header: "Produit", width: 18, value: (r) => r.parsedData?.produit },
    { key: "bonLivraison", header: "Bon de livraison", width: 20, value: (r) => r.parsedData?.bon_livraison },
    { key: "transporteur", header: "Transporteur", width: 20, value: (r) => r.parsedData?.transporteur },
    { key: "matricule", header: "Matricule", width: 16, value: (r) => r.parsedData?.matricule },
    { key: "installateur", header: "Installateur", width: 20, value: (r) => r.parsedData?.installateur?.nom },
    {
        key: "installateurContact",
        header: "Contact installateur",
        width: 22,
        value: (r) => r.parsedData?.installateur?.telephone,
    },
    { key: "dateEntree", header: "Date entrée", width: 16, value: (r) => r.parsedData?.date_entree },
    { key: "heureEntree", header: "Heure entrée", width: 14, value: (r) => r.parsedData?.heure_entree },
    { key: "dateSortie", header: "Date sortie", width: 16, value: (r) => r.parsedData?.date_sortie },
    { key: "heureSortie", header: "Heure sortie", width: 14, value: (r) => r.parsedData?.heure_sortie },
    { key: "description", header: "Description", width: 24, value: (r) => r.parsedData?.description },
];

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

const deriveRowValues = (receipt: ReceiptDoc): Record<string, string | number> => {
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
        poidsNetKg: Number(poidsNet?.toFixed(2) || 0),
        totalGeneral: Number(totalGeneral?.toFixed(2) || 0),
        totalGeneralEngin: Number(totalGeneralEngin?.toFixed(2) || 0),
        currency: receipt.currency || "",
    };
};

const collectDynamicColumns = (receipt: ReceiptDoc): DynamicColumn[] => {
    const values: DynamicColumn[] = [];
    for (const field of DYNAMIC_FIELD_CONFIG) {
        const value = field.value(receipt);
        if (value === undefined || value === null || value === "") continue;
        values.push({
            header: field.header,
            key: field.key,
            width: field.width,
            value: `${value}`,
        });
    }
    return values;
};

const applyStyle = (
    ws: WorkSheet,
    XLSX: XLSXModule,
    rowIndex: number,
    columnIndex: number,
    style: Record<string, unknown>,
    numberFormatOverride?: string,
) => {
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex - 1, c: columnIndex - 1 });
    if (!ws[cellAddress]) {
        ws[cellAddress] = { t: "s", v: "" };
    }
    ws[cellAddress].s = { ...(ws[cellAddress].s ?? {}), ...style };
    if (numberFormatOverride) {
        ws[cellAddress].z = numberFormatOverride;
    }
};

const styleRange = (
    ws: WorkSheet,
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

const sumRows = (rows: Array<Record<string, string | number>>, key: string) =>
    rows.reduce((sum, row) => {
        const value = row[key];
        return typeof value === "number" ? sum + value : sum;
    }, 0);

export async function generateReceiptWorkbookBuffer(receipt: ReceiptDoc): Promise<ArrayBuffer> {
    const XLSX = await import("xlsx-js-style");
    const rowValues = deriveRowValues(receipt);
    const dynamicColumns = collectDynamicColumns(receipt);
    const allColumns: ColumnConfig[] = [
        ...BASE_COLUMNS,
        ...dynamicColumns.map(({ header, key, width }) => ({ header, key, width })),
    ];
    const rows = [rowValues];
    dynamicColumns.forEach((col) => {
        rows[0][col.key] = col.value;
    });

    const headerRow = allColumns.map((col) => col.header);
    const dataRows = rows.map((row) => allColumns.map((col) => row[col.key] ?? ""));
    const totalRowTemplate = allColumns.map((col, index) => {
        if (index === 0) return "TOTAL GÉNÉRAL";
        if (col.key === "poidsNetKg") return Number(sumRows(rows, col.key).toFixed(2));
        if (col.key === "totalGeneral") return Number(sumRows(rows, col.key).toFixed(2));
        if (col.key === "totalGeneralEngin") return Number(sumRows(rows, col.key).toFixed(2));
        return index === 1 ? "" : "";
    });

    const ws = XLSX.utils.aoa_to_sheet([]);
    const title = [[`Synthèse numérique - ${receipt.fileDisplayName || receipt.fileName}`]];
    XLSX.utils.sheet_add_aoa(ws, title, { origin: "A1" });

    ws["!merges"] = ws["!merges"] || [];
    ws["!merges"].push({
        s: { r: 0, c: 0 },
        e: { r: 0, c: allColumns.length - 1 },
    });

    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: "A3" });
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A4" });
    XLSX.utils.sheet_add_aoa(ws, [totalRowTemplate], { origin: `A${4 + dataRows.length}` });

    ws["!cols"] = allColumns.map((col) => ({ wch: col.width }));

    const numericColumnIndexes = new Set(
        allColumns
            .map((col, idx) => (col.isNumeric ? idx + 1 : null))
            .filter((value): value is number => value !== null),
    );

    styleRange(ws, XLSX, 3, 3, 1, allColumns.length, headerCellStyle, numericColumnIndexes);
    styleRange(ws, XLSX, 4, 3 + dataRows.length, 1, allColumns.length, dataCellStyle, numericColumnIndexes);
    styleRange(
        ws,
        XLSX,
        4 + dataRows.length,
        4 + dataRows.length,
        1,
        allColumns.length,
        totalCellStyle,
        numericColumnIndexes,
    );

    applyStyle(ws, XLSX, 1, 1, {
        font: { bold: true, sz: 16, color: { rgb: "FF0F5132" } },
        alignment: { horizontal: "center", vertical: "center" },
    });

    const items = Array.isArray(receipt.items) ? receipt.items : [];
    if (items.length > 0) {
        const lineItemsTitleRow = 6 + dataRows.length;
        const lineItemsHeaderRow = lineItemsTitleRow + 1;
        const lineItemsStartRow = lineItemsHeaderRow + 1;
        const lineItemColumns = ["Article", "Quantité", "Prix unitaire", "Total"];
        const lineItemData = items.map((item) => [
            item.name,
            item.quantity ?? "",
            item.unitPrice ?? "",
            item.totalPrice ?? "",
        ]);
        const lineItemTotal = [
            "Total articles",
            "",
            "",
            lineItemData.reduce((sum, row) => sum + (typeof row[3] === "number" ? row[3] : 0), 0),
        ];

        XLSX.utils.sheet_add_aoa(ws, [["Détails des articles"]], { origin: `A${lineItemsTitleRow}` });
        XLSX.utils.sheet_add_aoa(ws, [lineItemColumns], { origin: `A${lineItemsHeaderRow}` });
        XLSX.utils.sheet_add_aoa(ws, lineItemData, { origin: `A${lineItemsStartRow}` });
        XLSX.utils.sheet_add_aoa(ws, [lineItemTotal], { origin: `A${lineItemsStartRow + lineItemData.length}` });

        ws["!merges"].push({
            s: { r: lineItemsTitleRow - 1, c: 0 },
            e: { r: lineItemsTitleRow - 1, c: lineItemColumns.length - 1 },
        });

        styleRange(ws, XLSX, lineItemsTitleRow, lineItemsTitleRow, 1, lineItemColumns.length, {
            font: { bold: true, color: { rgb: "FF0F5132" }, sz: 14 },
            alignment: { horizontal: "left", vertical: "center" },
        });

        const lineItemNumericColumns = new Set([2, 3, 4]);
        styleRange(
            ws,
            XLSX,
            lineItemsHeaderRow,
            lineItemsHeaderRow,
            1,
            lineItemColumns.length,
            secondaryHeaderStyle,
            lineItemNumericColumns,
        );
        styleRange(
            ws,
            XLSX,
            lineItemsStartRow,
            lineItemsStartRow + lineItemData.length,
            1,
            lineItemColumns.length,
            dataCellStyle,
            lineItemNumericColumns,
        );
        styleRange(
            ws,
            XLSX,
            lineItemsStartRow + lineItemData.length,
            lineItemsStartRow + lineItemData.length,
            1,
            lineItemColumns.length,
            totalCellStyle,
            lineItemNumericColumns,
        );
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt");
    return XLSX.write(wb, { bookType: "xlsx", type: "array", compression: true });
}
