"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useLanguage } from "@/components/LanguageProvider";
import { useSchematicFlag } from "@schematichq/schematic-react";
import { useQuery } from "convex/react";
import { ChevronLeft, FileText, Lightbulb, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function Receipt() {
  const params = useParams<{ id: string }>();
  const [receiptId, setReceiptId] = useState<Id<"receipts"> | null>(null);
  const router = useRouter();
  const isSummariesEnabled = useSchematicFlag("summary");
  const { t } = useLanguage();

  const receipt = useQuery(
    api.receipts.getReceiptById,
    receiptId ? { id: receiptId } : "skip",
  );

  const fileId = receipt?.fileId;

  const downloadUrl = useQuery(
    api.receipts.getReceiptDownloadUrl,
    fileId ? { fileId } : "skip",
  );

  useEffect(() => {
    try {
      const id = params.id as Id<"receipts">;
      setReceiptId(id);
    } catch (error) {
      console.error("Invalid receipt ID:", error);
      router.push("/");
    }
  }, [params.id, router]);

  if (receipt === undefined) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (receipt === null) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-2xl font-bold">{t("receipt.notFoundTitle")}</h1>
          <p className="mb-6">{t("receipt.notFoundMessage")}</p>
          <Link
            href="/"
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            {t("receipt.returnHome")}
          </Link>
        </div>
      </div>
    );
  }

  const uploadDate = new Date(receipt.uploadedAt).toLocaleString();

  const hasExtractedData = !!(
    receipt.merchantName ||
    receipt.merchantAddress ||
    receipt.transactionDate ||
    receipt.transactionAmount
  );

  const statusLabel = useMemo(() => {
    if (receipt.status === "pending") return t("status.pending");
    if (receipt.status === "processed") return t("status.processed");
    return t("status.failed");
  }, [receipt.status, t]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6">
          <Link
            href="/receipts"
            className="flex items-center text-blue-500 hover:underline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("receipt.back")}
          </Link>
        </nav>

        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-md">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="truncate text-2xl font-bold text-gray-900">
                {receipt.fileDisplayName || receipt.fileName}
              </h1>

              <div className="flex items-center">
                {receipt.status === "pending" && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-yellow-800"></div>
                )}

                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    receipt.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : receipt.status === "processed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("receipt.fileInfo.title")}
                  </h3>

                  <div className="mt-2 rounded-lg bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">{t("receipt.fileInfo.uploaded")}</p>
                        <p className="font-medium">{uploadDate}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">{t("receipt.fileInfo.size")}</p>
                        <p className="font-medium">{formatFileSize(receipt.size)}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">{t("receipt.fileInfo.type")}</p>
                        <p className="font-medium">{receipt.mimeType}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">{t("receipt.fileInfo.id")}</p>
                        <p className="font-medium" title={receipt._id}>
                          {receipt._id.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center rounded-lg bg-gray-50 p-8">
                <div className="text-center">
                  <FileText className="mx-auto h-16 w-16 text-blue-500" />
                  <p className="mt-4 text-sm text-gray-500">
                    {t("receipt.pdfPreview")}
                  </p>

                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                    >
                      {t("receipt.viewPdf")}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {hasExtractedData && (
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold">
                  {t("receipt.details.title")}
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 font-medium text-gray-700">
                      {t("receipt.details.merchantTitle")}
                    </h4>

                    <div className="space-y-2">
                      {receipt.merchantName && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("receipt.details.name")}
                          </p>
                          <p className="font-medium">{receipt.merchantName}</p>
                        </div>
                      )}

                      {receipt.merchantAddress && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("receipt.details.address")}
                          </p>
                          <p className="font-medium">{receipt.merchantAddress}</p>
                        </div>
                      )}

                      {receipt.merchantContact && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("receipt.details.contact")}
                          </p>
                          <p className="font-medium">{receipt.merchantContact}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 font-medium text-gray-700">
                      {t("receipt.details.transactionTitle")}
                    </h4>

                    <div className="space-y-2">
                      {receipt.transactionDate && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("receipt.details.date")}
                          </p>
                          <p className="font-medium">{receipt.transactionDate}</p>
                        </div>
                      )}

                      {receipt.transactionAmount && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("receipt.details.amount")}
                          </p>
                          <p className="font-medium">
                            {receipt.transactionAmount} {receipt.currency || ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {receipt.receiptSummary && (
                  <>
                    {isSummariesEnabled ? (
                      <div className="mt-6 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center">
                          <h4 className="font-semibold text-blue-700">
                            {t("receipt.summary.title")}
                          </h4>
                          <div className="ml-2 flex">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                            <Sparkles className="-ml-1 h-3 w-3 text-yellow-400" />
                          </div>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-white/60 p-4">
                          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                            {receipt.receiptSummary}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center text-xs italic text-blue-600">
                          <Lightbulb className="mr-1 h-3 w-3" />
                          <span>{t("receipt.summary.hint")}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-100 p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <h4 className="font-semibold text-gray-500">
                              {t("receipt.summary.lockedTitle")}
                            </h4>
                            <div className="ml-2 flex">
                              <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                              <Sparkles className="-ml-1 h-3 w-3 text-gray-300" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white/50 p-4">
                          <Link href="/manage-plan" className="py-4 text-center">
                            <Lock className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              {t("receipt.summary.lockedMessage")}
                            </p>
                            <span className="inline-block rounded bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600">
                              {t("receipt.summary.lockedCta")}
                            </span>
                          </Link>
                        </div>

                        <div className="mt-3 flex items-center text-xs italic text-gray-400">
                          <Lightbulb className="mr-1 h-3 w-3" />
                          <span>{t("receipt.summary.lockedHint")}</span>
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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
