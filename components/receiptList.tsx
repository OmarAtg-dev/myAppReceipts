"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useRouter } from "next/navigation";
import { Doc } from "@/convex/_generated/dataModel";
import { FileText } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

function ReceiptList() {
  const { user } = useUser();
  const { t } = useLanguage();
  const receipts = useQuery(api.receipts.getReceipts, {
    userId: user?.id || "",
  });
  const router = useRouter();

  if (!user) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-600">{t("receipts.signInPrompt")}</p>
      </div>
    );
  }

  if (!receipts) {
    return (
      <div className="w-full p-8 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">{t("receipts.loading")}</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">{t("receipts.empty")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-semibold">{t("receipts.title")}</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>{t("receipts.table.name")}</TableHead>
              <TableHead>{t("receipts.table.uploaded")}</TableHead>
              <TableHead>{t("receipts.table.size")}</TableHead>
              <TableHead>{t("receipts.table.total")}</TableHead>
              <TableHead>{t("receipts.table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt: Doc<"receipts">) => (
              <TableRow
                key={receipt._id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  router.push(`/receipt/${receipt._id}`);
                }}
              >
                <TableCell className="py-2">
                  <FileText className="h-6 w-6 text-red-500" />
                </TableCell>
                <TableCell className="font-medium">
                  {receipt.fileDisplayName || receipt.fileName}
                </TableCell>
                <TableCell>
                  {new Date(receipt.uploadedAt).toLocaleString()}
                </TableCell>
                <TableCell>{formatFileSize(receipt.size)}</TableCell>
                <TableCell>
                  {receipt.transactionAmount
                    ? `${receipt.transactionAmount} ${receipt.currency || ""}`
                    : "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      receipt.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : receipt.status === "processed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(
                      receipt.status === "pending"
                        ? "status.pending"
                        : receipt.status === "processed"
                        ? "status.processed"
                        : "status.failed",
                    )}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ReceiptList;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const size = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${size[i]}`;
}