"use client";

import { deleteReceipt } from "@/actions/deleteReceipt";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useRouter } from "next/navigation";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { FileText, Trash2 } from "lucide-react";
import { StructuredReceiptData } from "@/types/structuredReceipt";
import { Button } from "./ui/button";
import type { ExcelExportMetadata, ReceiptDoc, RiveOption } from "@/lib/excelExport";
import { ExcelExportModal } from "./ExcelExportModal";
import { LogoManagerModal } from "./LogoManagerModal";
import { fetchWorkbookLogos } from "@/lib/logoAssets";

function ReceipList() {
    const { user } = useUser();
    
    const router = useRouter();
    const receipts = useQuery(
        api.receipts.getReceipts,
        user ? { userId: user.id } : "skip",
    );
    const brandingAssets = useQuery(api.branding.getBrandingAssets, user ? {} : "skip");

    const [selectedIds, setSelectedIds] = useState<Set<Id<"receipts">>>(new Set());
    const [isExporting, setIsExporting] = useState(false);
    const [exportWarning, setExportWarning] = useState<string | null>(null);
    const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeletingSelected, setIsDeletingSelected] = useState(false);
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [exportSection, setExportSection] = useState("");
    const [exportRive, setExportRive] = useState<RiveOption>("VG 1 ere");
    const [isLogoModalOpen, setLogoModalOpen] = useState(false);
    const [logoModalMode, setLogoModalMode] = useState<"enforce" | "manage">("enforce");

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
            const next = new Set<Id<"receipts">>();
            for (const receipt of receipts) {
                if (prev.has(receipt._id)) {
                    next.add(receipt._id);
                }
            }
            if (next.size === prev.size) {
                return prev;
            }
            return next;
        });
    }, [receipts]);

    useEffect(() => {
        if (selectedProcessedCount > 0 && exportWarning) {
            setExportWarning(null);
        }
    }, [selectedProcessedCount, exportWarning]);

    useEffect(() => {
        if (selectedIds.size > 0 && deleteWarning) {
            setDeleteWarning(null);
        }
    }, [selectedIds, deleteWarning]);

    const ensureLogosReady = useCallback(() => {
        if (!brandingAssets?.companyLogoStorageId || !brandingAssets?.clientLogoStorageId) {
            setLogoModalMode("enforce");
            setLogoModalOpen(true);
            return false;
        }
        return true;
    }, [brandingAssets]);

    const downloadLogosForExport = useCallback(async () => {
        if (!brandingAssets?.companyLogoStorageId || !brandingAssets?.clientLogoStorageId) {
            throw new Error("Branding logos missing");
        }
        return fetchWorkbookLogos({
            company: {
                storageId: brandingAssets.companyLogoStorageId,
                mimeType: brandingAssets.companyLogoType,
            },
            client: {
                storageId: brandingAssets.clientLogoStorageId,
                mimeType: brandingAssets.clientLogoType,
            },
        });
    }, [brandingAssets]);

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

    const handleExport = useCallback(
        async (metadata: ExcelExportMetadata) => {
            if (!receipts) return;
            const eligible = receipts.filter(
                (receipt): receipt is ReceiptDoc =>
                    receipt.status === "processed" && selectedIds.has(receipt._id),
            );

            if (eligible.length === 0) {
                setExportWarning("Select at least one processed receipt to export.");
                return;
            }

            if (!ensureLogosReady()) {
                return;
            }

            setExportWarning(null);
            setExportError(null);
            setIsExporting(true);

            try {
                const [logos, { generateReceiptsWorkbookBuffer }] = await Promise.all([
                    downloadLogosForExport(),
                    import("@/lib/excelExport"),
                ]);
                const buffer = await generateReceiptsWorkbookBuffer(eligible, metadata, logos);
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
        },
        [receipts, selectedIds, ensureLogosReady, downloadLogosForExport],
    );

    const handleOpenExportModal = useCallback(() => {
        if (!receipts) return;
        const eligible = receipts.filter(
            (receipt) => receipt.status === "processed" && selectedIds.has(receipt._id),
        );
        if (eligible.length === 0) {
            setExportWarning("Select at least one processed receipt to export.");
            return;
        }
        if (!ensureLogosReady()) {
            return;
        }
        setExportWarning(null);
        setExportModalOpen(true);
    }, [receipts, selectedIds, ensureLogosReady]);

    const handleModalConfirm = useCallback(() => {
        const trimmedSection = exportSection.trim();
        if (!trimmedSection) {
            return;
        }
        setExportModalOpen(false);
        void handleExport({ section: trimmedSection, rive: exportRive });
    }, [exportSection, exportRive, handleExport]);

    const handleDeleteSelected = useCallback(async () => {
        if (selectedIds.size === 0) {
            setDeleteWarning("Select at least one receipt to delete.");
            return;
        }

        const confirmed = window.confirm(
            `Delete ${selectedIds.size} receipt${selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.`,
        );
        if (!confirmed) {
            return;
        }

        setDeleteWarning(null);
        setDeleteError(null);
        setIsDeletingSelected(true);

        try {
            const idsToDelete = Array.from(selectedIds);
            for (const id of idsToDelete) {
                const result = await deleteReceipt(id);
                if (!result.success) {
                    throw new Error(result.error ?? "Unable to delete receipt.");
                }
            }
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Failed to delete selected receipts", error);
            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Unable to delete the selected receipts. Please try again.",
            );
        } finally {
            setIsDeletingSelected(false);
        }
    }, [selectedIds]);

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
        <>
        <div className="w-full">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Your Receipts</h2>
                    <p className="text-sm text-gray-500">
                        Selected {selectedProcessedCount} of {processedReceipts.length} processed receipts for export
                    </p>
                    <p className="text-xs text-gray-500">
                        Total selected: {selectedIds.size} receipt{selectedIds.size === 1 ? "" : "s"}
                    </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-sm font-medium text-gray-600">Actions</p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={handleOpenExportModal}
                            disabled={isExporting || processedReceipts.length === 0}
                            className="px-4"
                        >
                            {isExporting ? "Exporting…" : "Export to Excel"}
                        </Button>
                        <Button
                            onClick={() => {
                                setLogoModalMode("manage");
                                setLogoModalOpen(true);
                            }}
                            variant="outline"
                            className="px-4"
                            disabled={!brandingAssets}
                        >
                            Manage logos
                        </Button>
                        <Button
                            onClick={handleDeleteSelected}
                            disabled={isDeletingSelected || selectedIds.size === 0}
                            variant="destructive"
                            className="px-4"
                        >
                            {isDeletingSelected ? (
                                "Deleting…"
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                    {exportWarning && <p className="text-xs text-amber-600">{exportWarning}</p>}
                    {deleteWarning && <p className="text-xs text-amber-600">{deleteWarning}</p>}
                    {exportError && <p className="text-xs text-red-600">{exportError}</p>}
                    {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
                    {processedReceipts.length === 0 && (
                        <p className="text-xs text-gray-500">
                            Receipts will be available once processing completes.
                        </p>
                    )}
                </div>
            </div>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receipts.map((receipt: Doc<"receipts">) => {
                            const parsedData = receipt.parsedData as StructuredReceiptData | undefined;
                            const netWeight =
                                typeof parsedData?.poids_net_kg === "number"
                                    ? parsedData.poids_net_kg.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                    : "-";
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
                                            onClick={(event) => event.stopPropagation()}
                                            onChange={(event) => {
                                                event.stopPropagation();
                                                toggleReceiptSelection(receipt._id);
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
        <LogoManagerModal
            open={isLogoModalOpen}
            mode={logoModalMode}
            logos={brandingAssets ?? null}
            onClose={() => setLogoModalOpen(false)}
            onContinue={() => {
                setLogoModalOpen(false);
                setExportModalOpen(true);
            }}
        />
        <ExcelExportModal
            open={isExportModalOpen}
            section={exportSection}
            rive={exportRive}
            isSubmitting={isExporting}
            onSectionChange={setExportSection}
            onRiveChange={setExportRive}
            onCancel={() => setExportModalOpen(false)}
            onConfirm={handleModalConfirm}
        />
        </>
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