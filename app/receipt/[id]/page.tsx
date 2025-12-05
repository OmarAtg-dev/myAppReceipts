"use client";
import { getFileDownloadUrl } from "@/actions/getFileDownloadUrl";
import { deleteReceipt } from "@/actions/deleteReceipt";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StructuredReceiptData } from "@/types/structuredReceipt";
import { useSchematicFlag } from "@schematichq/schematic-react";
import { useQuery } from "convex/react";
import { ChevronLeft, FileText, Lightbulb, Lock, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function Receipt() {
    const params = useParams<{ id: string }>();
    const [receiptId, setReceiptId] = useState<Id<"receipts"> | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [isDownloadingFile, setIsDownloadingFile] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [isDeletingReceipt, setIsDeletingReceipt] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const router = useRouter();
    const isSummariesEnabled = useSchematicFlag("summary");

    // Fetch receipt details
    const receipt = useQuery(
        api.receipts.getReceiptById,
        receiptId ? { id: receiptId } : "skip"
    );
    const parsedData = (receipt?.parsedData as StructuredReceiptData) || undefined;
    const fileId = receipt?.fileId;
    const handleFileDownload = useCallback(async () => {
        if (!fileId) return;
        setDownloadError(null);
        setIsDownloadingFile(true);
        try {
            const result = await getFileDownloadUrl(fileId);
            if (!result.success || !result.downloadUrl) {
                throw new Error(result.error ?? "Unable to open the receipt file.");
            }
            window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Failed to download receipt file", error);
            setDownloadError(
                error instanceof Error ? error.message : "Unable to download the file. Please try again.",
            );
        } finally {
            setIsDownloadingFile(false);
        }
    }, [fileId]);

    const handleDeleteReceipt = useCallback(async () => {
        if (!receipt?._id) return;
        const confirmed = window.confirm(
            "This will permanently delete the receipt and its file. Do you want to continue?",
        );
        if (!confirmed) {
            return;
        }

        setDeleteError(null);
        setIsDeletingReceipt(true);
        try {
            const result = await deleteReceipt(receipt._id);
            if (!result.success) {
                throw new Error(result.error ?? "Failed to delete the receipt.");
            }
            router.push("/receipts");
        } catch (error) {
            console.error("Failed to delete receipt", error);
            setDeleteError(
                error instanceof Error ? error.message : "Unable to delete the receipt. Please try again.",
            );
        } finally {
            setIsDeletingReceipt(false);
        }
    }, [receipt?._id, router]);

    // Convert URL param to Convex ID
    useEffect(() => {
        try {
            const id = params.id as Id<"receipts">;
            setReceiptId(id);
        } catch (error) {
            console.error("Invalid receipt ID:", error);
            router.push("/");
        }
    }, [params.id, router]);

    // LOADING state
    if (receipt === undefined) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    // NOT FOUND
    if (receipt === null) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
                    <p className="mb-6">
                        The receipt you&apos;re looking for doesn&apos;t exist or has been removed.
                    </p>
                    <Link
                        href="/"
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    // Format Upload Date
    const uploadDate = new Date(receipt.uploadedAt).toLocaleString();

    // Check if extracted data exists
    const hasExtractedData = !!parsedData;
    const summaryText = parsedData?.description || receipt.receiptSummary;

    const handleExcelExport = async () => {
        if (!receipt) return;
        setExportError(null);
        setIsExporting(true);
        try {
            const { generateReceiptWorkbookBuffer } = await import("@/lib/excelExport");
            const buffer = await generateReceiptWorkbookBuffer(receipt);
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const sanitizedName = (receipt.fileDisplayName || receipt.fileName).replace(/\.[^.]+$/, "");
            link.href = url;
            link.download = `${sanitizedName || "receipt"}-structured.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export Excel", error);
            setExportError("Unable to generate the Excel file. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <nav className="mb-6">
                    <Link
                        href="/receipts"
                        className="text-blue-500 hover:underline flex items-center"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Receipts
                    </Link>
                </nav>

                <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 truncate">
                                {receipt.fileDisplayName || receipt.fileName}
                            </h1>

                            <div className="flex items-center">
                                {receipt.status === "pending" && (
                                    <div className="mr-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800"></div>
                                    </div>
                                )}

                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${
                                        receipt.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : receipt.status === "processed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {receipt.status.charAt(0).toUpperCase() +
                                        receipt.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* LEFT – INFO */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        File Information
                                    </h3>

                                    <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Uploaded</p>
                                                <p className="font-medium">{uploadDate}</p>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">Size</p>
                                                <p className="font-medium">
                                                    {formatFileSize(receipt.size)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">Type</p>
                                                <p className="font-medium">{receipt.mimeType}</p>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">ID</p>
                                                <p
                                                    className="font-medium truncate"
                                                    title={receipt._id}
                                                >
                                                    {receipt._id.slice(0, 10)}...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT – DOWNLOAD */}
                            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <FileText className="h-16 w-16 text-blue-500 mx-auto" />
                                    <p className="mt-4 text-sm text-gray-500">Receipt File</p>
                                    <div className="flex flex-col items-center space-y-3 mt-4">
                                         <Button
                                            onClick={handleFileDownload}
                                            disabled={!fileId || isDownloadingFile}
                                            className="w-full justify-center"
                                            variant="outline"
                                        >
                                            {isDownloadingFile ? "Opening…" : "View File"}
                                        </Button>

                                        <button
                                            onClick={handleExcelExport}
                                            disabled={isExporting}
                                            className={`px-4 py-2 text-sm rounded inline-flex items-center justify-center ${
                                                isExporting
                                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                                            }`}
                                        >
                                            {isExporting ? "Generating Excel…" : "Download Excel"}
                                        </button>


                                        <Button
                                            onClick={handleDeleteReceipt}
                                            disabled={isDeletingReceipt}
                                            variant="destructive"
                                            className="w-full justify-center"
                                        >
                                            {isDeletingReceipt ? (
                                                "Deleting…"
                                            ) : (
                                                <>
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete Receipt
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-xs text-gray-500 text-center">
                                            Generates a structured workbook with green table borders, totals, and all parsed values.
                                        </p>

                                        {exportError && (
                                            <p className="text-xs text-red-500 text-center">{exportError}</p>
                                        )}
                                                 {downloadError && (
                                            <p className="text-xs text-red-500 text-center">{downloadError}</p>
                                        )}
                                        {deleteError && (
                                            <p className="text-xs text-red-500 text-center">{deleteError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extracted Data Section */}
                      {hasExtractedData && parsedData && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Receipt Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-3">
                                            Entreprise
                                        </h4>

                                        <div className="space-y-2">
                                        <DetailRow label="Entreprise" value={formatDisplayValue(parsedData.entreprise)} />
                                            <DetailRow label="Description" value={formatDisplayValue(parsedData.description)} />
                                            <DetailRow label="Téléphone" value={formatDisplayValue(parsedData.telephone)} />
                                            <DetailRow label="Email" value={formatDisplayValue(parsedData.email)} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-3">
                                            Numéro & Dates
                                        </h4>
                                        <div className="space-y-2">
                                            <DetailRow label="Numéro de pesée" value={formatDisplayValue(parsedData.numero_pesee)} />
                                            <DetailRow label="Date d'entrée" value={`${formatDisplayValue(parsedData.date_entree)} ${formatDisplayValue(parsedData.heure_entree)}`} />
                                            <DetailRow label="Date de sortie" value={`${formatDisplayValue(parsedData.date_sortie)} ${formatDisplayValue(parsedData.heure_sortie)}`} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-3">
                                            Logistique
                                        </h4>
                                        <div className="space-y-2">
                                            <DetailRow label="Matricule" value={formatDisplayValue(parsedData.matricule)} />
                                            <DetailRow label="Client" value={formatDisplayValue(parsedData.client)} />
                                            <DetailRow label="Transporteur" value={formatDisplayValue(parsedData.transporteur)} />
                                            <DetailRow label="Destination" value={formatDisplayValue(parsedData.destination)} />
                                            <DetailRow label="Bon de livraison" value={formatDisplayValue(parsedData.bon_livraison)} />
                                            <DetailRow label="Produit" value={formatDisplayValue(parsedData.produit)} />
                                        </div>
                                    </div>

                                   
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-3">
                                        Poids (kg)
                                        </h4>

                                        <div className="space-y-2">
                                        <DetailRow label="Poids entrée" value={formatWeightValue(parsedData.poids_entree_kg)} />
                                            <DetailRow label="Poids sortie" value={formatWeightValue(parsedData.poids_sortie_kg)} />
                                            <DetailRow label="Poids net" value={formatWeightValue(parsedData.poids_net_kg)} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-3">
                                            Installateur
                                        </h4>
                                        <div className="space-y-2">
                                            <DetailRow label="Nom" value={formatDisplayValue(parsedData.installateur.nom)} />
                                            <DetailRow label="Téléphone" value={formatDisplayValue(parsedData.installateur.telephone)} />
                                            <DetailRow label="Email" value={formatDisplayValue(parsedData.installateur.email)} />
                                        </div>
                                    </div>
                                </div>

                                {/* SUMMARY SECTION */}
                                {summaryText && (
                                    <>
                                        {isSummariesEnabled ? (
                                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                                                <div className="flex items-center mb-4">
                                                    <h4 className="font-semibold text-blue-700">
                                                        AI Summary
                                                    </h4>
                                                    <div className="ml-2 flex">
                                                        <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                                                        <Sparkles className="h-3 w-3 text-yellow-400 -ml-1" />
                                                    </div>
                                                </div>

                                                <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-blue-100">
                                                    <p className="text-sm whitespace-pre-line leading-relaxed text-gray-700">
                                                    {summaryText}
                                                    </p>
                                                </div>

                                                <div className="mt-3 text-xs text-blue-600 italic flex items-center">
                                                    <Lightbulb className="h-3 w-3 mr-1" />
                                                    <span>AI-generated summary based on receipt data</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-6 bg-gray-100 p-6 rounded-lg border border-gray-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center">
                                                        <h4 className="font-semibold text-gray-500">
                                                            AI Summary
                                                        </h4>

                                                        <div className="ml-2 flex">
                                                            <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                                                            <Sparkles className="h-3 w-3 text-gray-300 -ml-1" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-gray-200 flex flex-col items-center justify-center">
                                                    <Link
                                                        href="/manage-plan"
                                                        className="text-center py-4"
                                                    >
                                                        <Lock className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                                        <p className="text-sm text-gray-500 mb-2">
                                                            AI summary is a PRO level feature
                                                        </p>
                                                        <button className="mt-2 px-4 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 inline-block">
                                                            Upgrade to Unlock
                                                        </button>
                                                    </Link>
                                                </div>

                                                <div className="mt-3 text-xs text-gray-400 italic flex items-center">
                                                    <Lightbulb className="h-3 w-3 mr-1" />
                                                    <span>
                                                        Get AI-powered insights from your receipts
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Receipt;

// FORMAT HELPERS
function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDisplayValue(value?: string | null) {
    return value && value.trim().length > 0 ? value : "—";
}

function formatWeightValue(value?: number | null | undefined) {
    return typeof value === "number" ? `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg` : "—";
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}
