"use client";
import { uploadReceipt } from "@/actions/uploadReceipt";
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

const ACCEPTED_FILE_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
]);

const ACCEPTED_EXTENSIONS = [".pdf", ".jpeg", ".jpg", ".png"];

const ACCEPT_ATTRIBUTE =
    "application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg";

function isSupportedFile(file: File) {
    const fileName = file.name?.toLowerCase() ?? "";
    return (
        ACCEPTED_FILE_TYPES.has(file.type) ||
        ACCEPTED_EXTENSIONS.some((ext) => fileName.endsWith(ext))
    );
}

function ReceiptDropzone() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { user } = useUser();
    const {
        value: isFeatureEnabled,
        featureUsageExceeded,
        featureAllocation,
    } = useSchematicEntitlement("scans");

    const sensors = useSensors(useSensor(PointerSensor));

    const handleUpload = useCallback(
        async (files: FileList | File[]) => {
            if (!user) {
                alert("Please sign in to upload files");
                return;
            }

            const fileArray = Array.from(files);
            const receiptFiles = fileArray.filter(isSupportedFile);

            if (receiptFiles.length === 0) {
                alert("Please drop only PDF, JPG, or PNG receipt files.");
                return;
            }

            if (receiptFiles.length !== fileArray.length) {
                alert("Unsupported files were skipped. Only PDF, JPG, or PNG files are processed.");
            }

            setIsUploading(true);
            try {
                const newUploadedFiles: string[] = [];

                for (const file of receiptFiles) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const result = await uploadReceipt(formData);
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
                console.error("Upload failed: ", error);
                alert(
                    `Upload failed: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
            } finally {
                setIsUploading(false);
            }
        },
        [user, router],
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
                alert("Please sign in to upload files");
                return;
            }
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUpload(e.dataTransfer.files);
            }
        },
        [user, handleUpload],
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
    const triggerCameraCapture = useCallback(() => {
        cameraInputRef.current?.click();
    }, []);

    const isUserSignedIn = !!user;
    const canUpload = isUserSignedIn && isFeatureEnabled;

    return (
        <DndContext sensors={sensors}>
            <div className="w-full max-w-md mx-auto ">
                <div
                    onDragOver={canUpload ? handleDragOver : undefined}
                    onDragLeave={canUpload ? handleDragLeave : undefined}
                    onDrop={canUpload ? handleDrop : (e) => e.preventDefault()}
                    className={`border - 2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    } ${!canUpload ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                            <p>Uploading...</p>
                        </div>
                    ) : !isUserSignedIn ? (
                        <>
                            <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                                Please sign in to upload files
                            </p>
                        </>
                    ) : (
                        <>
                            <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                                Drag and drop receipt PDFs or images (JPG, PNG), or click to select
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept={ACCEPT_ATTRIBUTE}
                                multiple
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                            <input
                                type="file"
                                ref={cameraInputRef}
                                accept="image/*"
                                capture="environment"
                                multiple
                                onChange={handleFileInputChange}
                                className="hidden"
                            />

                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                                <Button
                                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!isFeatureEnabled}
                                    onClick={triggerFileInput}
                                >
                                    {isFeatureEnabled ? "Select files" : "Upgrade to upload"}
                                </Button>
                                <Button
                                    type="button"
                                    className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!isFeatureEnabled}
                                    onClick={triggerCameraCapture}
                                >
                                    {isFeatureEnabled ? "Take Photo" : "Upgrade to upload"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4">
                    {featureUsageExceeded && (
                        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounde-md text-red-600">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>
                                You have exceeded your limit of {featureAllocation} scans.
                                Please upgrade to continue.
                            </span>
                        </div>
                    )}
                </div>

                {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-medium">Uploaded files: </h3>
                        <ul className="mt-2 text-sm text-gray-600 sapace-y-1">
                            {uploadedFiles.map((fileName, i) => (
                                <li key={i} className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
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
export default ReceiptDropzone;