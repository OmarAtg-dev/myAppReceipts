"use client";

import { deleteReceipt } from "@/actions/deleteReceipt";
import { getFileDownloadUrl } from "@/actions/getFileDownloadUrl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useRouter } from "next/navigation";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Download, FileText, Trash2 } from "lucide-react";
import { StructuredReceiptData } from "@/types/structuredReceipt";
import { Button } from "./ui/button";
import type { ReceiptDoc } from "@/lib/excelExport";

function ReceipList() {
    const { user } = useUser();
    
    const router = useRouter();
    const receipts = useQuery(
        api.receipts.getReceipts,
        user ? { userId: user.id } : "skip",
    );

    const [selectedIds, setSelectedIds] = useState<Set<Id<"receipts">>>(new Set());
    const [isExporting, setIsExporting] = useState(false);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [downloadingReceiptId, setDownloadingReceiptId] = useState<Id<"receipts"> | null>(null);
    const [deletingReceiptId, setDeletingReceiptId] = useState<Id<"receipts"> | null>(null);

    const processedReceipts = useMemo(
        () => (receipts ?? []).filter((receipt) => receipt.status === "processed"),
        [receipts],
    );

    const selectedProcessedCount = useMemo(
        () => processedReceipts.reduce((acc, receipt) => (selectedIds.has(receipt._id) ? acc + 1 : acc), 0),
        [processedReceipts, selectedIds],
    );

    useEffect(() => {
        if (!receipts) return;
        setSelectedIds((prev) => {
            let changed = false;
            const next = new Set<Id<"receipts">>();
            for (const receipt of receipts) {
                if (receipt.status === "processed" && prev.has(receipt._id)) {
                    next.add(receipt._id);
                } else if (prev.has(receipt._id)) {
                    changed = true;
                }
            }
            if (!changed && next.size === prev.size) {
                return prev;
            }
            return next;
        });
    }, [receipts]);

    useEffect(() => {
        if (selectedIds.size > 0 && warningMessage) {
            setWarningMessage(null);
        }
    }, [selectedIds, warningMessage]);

    const toggleReceiptSelection = useCallback((id: Id<"receipts">) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleExport = useCallback(async () => {
        if (!receipts) return;
        const eligible = receipts.filter(
            (receipt): receipt is ReceiptDoc =>
                receipt.status === "processed" && selectedIds.has(receipt._id),
        );

        if (eligible.length === 0) {
            setWarningMessage("Select at least one processed receipt to export.");
            return;
        }

        setWarningMessage(null);
        setExportError(null);
        setIsExporting(true);

        try {
            const { generateReceiptsWorkbookBuffer } = await import("@/lib/excelExport");
            const buffer = await generateReceiptsWorkbookBuffer(eligible);
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const timestamp = new Date().toISOString().split("T")[0];
            link.href = url;
            link.download = `receipts-${timestamp}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export receipts", error);
            setExportError("Unable to export the selected receipts. Please try again.");
        } finally {
            setIsExporting(false);
        }
    }, [receipts, selectedIds]);

    const handleDownloadReceipt = useCallback(
        async (receipt: Doc<"receipts">) => {
            setActionError(null);
            setDownloadingReceiptId(receipt._id);
            try {
                const result = await getFileDownloadUrl(receipt.fileId);
                if (!result.success || !result.downloadUrl) {
                    throw new Error(result.error ?? "Unable to download receipt.");
                }
                window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
            } catch (error) {
                console.error("Failed to download receipt", error);
                setActionError(
                    error instanceof Error ? error.message : "Unable to download receipt. Please try again.",
                );
            } finally {
                setDownloadingReceiptId(null);
            }
        },
        [],
    );

    const handleDeleteReceipt = useCallback(
        async (receipt: Doc<"receipts">) => {
            const confirmed = window.confirm(
                `Delete "${receipt.fileDisplayName || receipt.fileName}" and remove it from your history?`,
            );
            if (!confirmed) {
                return;
            }

            setActionError(null);
            setDeletingReceiptId(receipt._id);
            try {
                const result = await deleteReceipt(receipt._id);
                if (!result.success) {
                    throw new Error(result.error ?? "Unable to delete receipt.");
                }
            } catch (error) {
                console.error("Failed to delete receipt", error);
                setActionError(
                    error instanceof Error ? error.message : "Unable to delete receipt. Please try again.",
                );
            } finally {
                setDeletingReceiptId(null);
            }
        },
        [],
    );

    if (!user) {
        return (
            <div className="w-full p-8 text-center">
                <p className="text-gray-600">Please sign in to view your receipts.</p>
            </div>
            );
    }
    if (!receipts) {
        return (
            <div className="w-full p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading receipts...</p>
            </div>
        );
    }


    if(receipts.length === 0){
        return (
            <div className="w-full p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-600">No receipts have been uploaded yet.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Your Receipts</h2>
                    <p className="text-sm text-gray-500">
                        Selected {selectedProcessedCount} of {processedReceipts.length} processed receipts
                    </p>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || processedReceipts.length === 0}
                        className="px-4"
                    >
                        {isExporting ? "Exporting…" : "Export to Excel"}
                    </Button>
                    {warningMessage && <p className="text-xs text-amber-600">{warningMessage}</p>}
                    {exportError && <p className="text-xs text-red-600">{exportError}</p>}
                    {processedReceipts.length === 0 && (
                        <p className="text-xs text-gray-500">Receipts will be available once processing completes.</p>
                    )}
                </div>
            </div>
            {actionError && <p className="mb-4 text-sm text-red-600">{actionError}</p>}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[48px]">
                                <span className="sr-only">Select receipt</span>
                            </TableHead>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Poids net (kg)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receipts.map((receipt: Doc<"receipts">) => {
                            const parsedData = receipt.parsedData as StructuredReceiptData | undefined;
                            const netWeight =
                                typeof parsedData?.poids_net_kg === "number"
                                    ? parsedData.poids_net_kg.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                    : "-";
                            const isProcessed = receipt.status === "processed";
                            const isChecked = selectedIds.has(receipt._id);

                            return (
                                <TableRow
                                    key={receipt._id}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => {
                                        router.push(`/receipt/${receipt._id}`);
                                    }}
                                >
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={!isProcessed}
                                            onClick={(event) => event.stopPropagation()}
                                            onChange={(event) => {
                                                event.stopPropagation();
                                                if (!isProcessed) return;
                                                toggleReceiptSelection(receipt._id);
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100"
                                            aria-label={`Select ${receipt.fileDisplayName || receipt.fileName}`}
                                        />
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <FileText className="h-6 w-6 text-red-500" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {receipt.fileDisplayName || parsedData?.entreprise || receipt.fileName}
                                    </TableCell>
                                    <TableCell>{new Date(receipt.uploadedAt).toLocaleString()}</TableCell>
                                    <TableCell>{formatFileSize(receipt.size)}</TableCell>
                                    <TableCell>{netWeight}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                receipt.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : receipt.status === "processed"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleDownloadReceipt(receipt);
                                                }}
                                                disabled={downloadingReceiptId === receipt._id}
                                            >
                                                <Download className="h-4 w-4" />
                                                <span className="hidden sm:inline">Download</span>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleDeleteReceipt(receipt);
                                                }}
                                                disabled={deletingReceiptId === receipt._id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
     
}

export default ReceipList;

// Helper function to format file size
function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const size = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${size[i]}`;
}