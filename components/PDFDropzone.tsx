"use client";
import { uploadPDF } from "@/actions/uploadPDF";
import { useLanguage } from "./LanguageProvider";
import { useUser } from "@clerk/nextjs";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useSchematicEntitlement } from "@schematichq/schematic-react";
import { AlertCircle, CheckCircle, CloudUpload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Button } from "./ui/button";

function PDFDropzone() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();
  const {
    value: isFeatureEnabled,
    featureUsageExceeded,
    featureAllocation,
  } = useSchematicEntitlement("scans");

  const sensors = useSensors(useSensor(PointerSensor));

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!user) {
        alert(t("dropzone.signInAlert"));
        return;
      }

      const fileArray = Array.from(files);
      const pdfFiles = fileArray.filter(
        (file) =>
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf"),
      );
      if (pdfFiles.length === 0) {
        alert(t("dropzone.pdfOnly"));
        return;
      }
      setIsUploading(true);
      try {
        const newUploadedFiles: string[] = [];

        for (const file of pdfFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const result = await uploadPDF(formData);
          if (!result.success) {
            throw new Error(result.error);
          }
          newUploadedFiles.push(file.name);
        }
        setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

        setTimeout(() => {
          setUploadedFiles([]);
        }, 5000);
        router.push("/receipts");
      } catch (error) {
        console.error("Uploaded failed: ", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        alert(t("dropzone.uploadFailed", { message }));
      } finally {
        setIsUploading(false);
      }
    },
    [router, t, user],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      if (!user) {
        alert(t("dropzone.signInAlert"));
        return;
      }
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload, t, user],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleUpload(e.target.files);
      }
    },
    [handleUpload],
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isUserSignedIn = !!user;
  const canUpload = isUserSignedIn && isFeatureEnabled;

  return (
    <DndContext sensors={sensors}>
      <div className="mx-auto w-full max-w-md">
        <div
          onDragOver={canUpload ? handleDragOver : undefined}
          onDragLeave={canUpload ? handleDragLeave : undefined}
          onDrop={canUpload ? handleDrop : (e) => e.preventDefault()}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } ${!canUpload ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="mb-2 h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
              <p>{t("dropzone.uploading")}</p>
            </div>
          ) : !isUserSignedIn ? (
            <>
              <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {t("dropzone.signInToUpload")}
              </p>
            </>
          ) : (
            <>
              <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {t("dropzone.dragDrop")}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf,.pdf"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              <Button
                className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isFeatureEnabled}
                onClick={triggerFileInput}
              >
                {isFeatureEnabled
                  ? t("dropzone.selectFiles")
                  : t("dropzone.upgradeToUpload")}
              </Button>
            </>
          )}
        </div>

        <div className="mt-4">
          {featureUsageExceeded && (
            <div className="flex items-center rounded-md border border-red-200 bg-red-50 p-3 text-red-600">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>
                {t("dropzone.limitExceeded", {
                  count: featureAllocation ?? 0,
                })}
              </span>
            </div>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium">{t("dropzone.uploadedFilesTitle")}</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {uploadedFiles.map((fileName, i) => (
                <li key={`${fileName}-${i}`} className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  {fileName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DndContext>
  );
}
export default PDFDropzone;