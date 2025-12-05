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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [capturedPhotos, setCapturedPhotos] = useState<Array<{ blob: Blob; url: string }>>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();
    const { user } = useUser();
    const {
        value: isFeatureEnabled,
        featureUsageExceeded,
        featureAllocation,
    } = useSchematicEntitlement("scans");

    const sensors = useSensors(useSensor(PointerSensor));
    const isUserSignedIn = !!user;
    const canUpload = isUserSignedIn && isFeatureEnabled;
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

    const stopCameraStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const clearCapturedPhotos = useCallback(() => {
        setCapturedPhotos((prev) => {
            prev.forEach((photo) => URL.revokeObjectURL(photo.url));
            return [];
        });
    }, []);

    useEffect(() => {
        return () => {
            clearCapturedPhotos();
            stopCameraStream();
        };
    }, [clearCapturedPhotos, stopCameraStream]);

    const openCamera = useCallback(async () => {
        if (!canUpload) {
            if (!isUserSignedIn) {
                alert("Please sign in to take photos");
            }
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError("Camera capture is not supported on this device.");
            return;
        }
        try {
            setCameraError(null);
            clearCapturedPhotos();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
            });
            streamRef.current = stream;
            setIsCameraOpen(true);
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => {});
                }
            });
        } catch (error) {
            console.error("Unable to access camera", error);
            setCameraError("Unable to access the camera. Please check permissions and try again.");
        }
    }, [canUpload, clearCapturedPhotos, isUserSignedIn]);

    const handleCameraClose = useCallback(() => {
        clearCapturedPhotos();
        stopCameraStream();
        setIsCameraOpen(false);
    }, [clearCapturedPhotos, stopCameraStream]);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        if (!video) {
            setCameraError("Camera feed is not ready yet.");
            return;
        }
        const canvas = document.createElement("canvas");
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
            setCameraError("Unable to capture photo. Please try again.");
            return;
        }
        context.drawImage(video, 0, 0, width, height);
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setCameraError("Failed to capture photo. Please try again.");
                    return;
                }
                const url = URL.createObjectURL(blob);
                setCapturedPhotos((prev) => [...prev, { blob, url }]);
            },
            "image/jpeg",
            0.95,
        );
    }, []);

    const removeCapturedPhoto = useCallback((url: string) => {
        setCapturedPhotos((prev) => {
            const next = prev.filter((photo) => {
                const shouldKeep = photo.url !== url;
                if (!shouldKeep) {
                    URL.revokeObjectURL(photo.url);
                }
                return shouldKeep;
            });
            return next;
        });
    }, []);

    const confirmCameraUpload = useCallback(async () => {
        if (capturedPhotos.length === 0) {
            setCameraError("Capture at least one photo before uploading.");
            return;
        }
        const timestamp = Date.now();
        const files = capturedPhotos.map((photo, index) => {
            const fileName = `receipt-photo-${timestamp}-${index + 1}.jpg`;
            return new File([photo.blob], fileName, { type: photo.blob.type || "image/jpeg" });
        });
        try {
            await handleUpload(files);
            handleCameraClose();
        } catch (error) {
            console.error("Failed to upload captured photos", error);
            setCameraError("Unable to upload the captured photos. Please try again.");
        }
    }, [capturedPhotos, handleCameraClose, handleUpload]);

    return (
        <>
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
                                    onClick={openCamera}
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
            {isCameraOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-lg space-y-4 rounded-lg bg-white p-4 shadow-2xl">
                        <div className="relative overflow-hidden rounded-lg bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-80 w-full object-cover"
                            />
                        </div>
                        {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}
                        <div className="flex flex-wrap gap-2">
                            {capturedPhotos.length === 0 && (
                                <p className="text-sm text-gray-500">No photos captured yet.</p>
                            )}
                            {capturedPhotos.map((photo, index) => (
                                <div
                                    key={photo.url}
                                    className="relative h-20 w-20 overflow-hidden rounded border border-gray-200"
                                >
                                     <Image
                                        src={photo.url}
                                        alt={`Captured receipt ${index + 1}`}
                                        className="h-full w-full object-cover"
                                        width={80}
                                        height={80}
                                        unoptimized
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCapturedPhoto(photo.url)}
                                        className="absolute right-1 top-1 rounded-full bg-black/60 px-1 text-xs text-white"
                                        aria-label="Remove photo"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <Button
                                type="button"
                                className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
                                onClick={capturePhoto}
                            >
                                Capture Photo
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={capturedPhotos.length === 0}
                                onClick={confirmCameraUpload}
                            >
                                {capturedPhotos.length > 0
                                    ? `Upload ${capturedPhotos.length} Photo${capturedPhotos.length > 1 ? "s" : ""}`
                                    : "Upload"}
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                                onClick={handleCameraClose}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default ReceiptDropzone;