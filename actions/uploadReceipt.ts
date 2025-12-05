"use server"
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convexClient";
import { currentUser } from "@clerk/nextjs/server";
import { getFileDownloadUrl } from "./getFileDownloadUrl";
import { inngest } from "@/inngest/client";
import Events from "@/inngest/constants";

const ACCEPTED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
]);

const ACCEPTED_EXTENSIONS = [".pdf", ".jpeg", ".jpg", ".png"];

function isSupportedFile(file: File) {
    const fileName = file.name?.toLowerCase() ?? "";
    const isMimeAllowed = ACCEPTED_MIME_TYPES.has(file.type);
    const hasAllowedExtension = ACCEPTED_EXTENSIONS.some((ext) =>
        fileName.endsWith(ext),
    );
    return isMimeAllowed || hasAllowedExtension;
}

function resolveContentType(file: File) {
    if (file.type) {
        return file.type;
    }

    const lowerName = file.name?.toLowerCase() ?? "";
    if (lowerName.endsWith(".png")) return "image/png";
    if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
        return "image/jpeg";
    }
    if (lowerName.endsWith(".pdf")) return "application/pdf";

    return "application/octet-stream";
}


/**
 *  Server action to upload a receipt file (PDF or image) to Convex storage
 */
export async function uploadReceipt(formData: FormData) {
    const user = await currentUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }
    const convex = getConvexClient();

    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        if (!isSupportedFile(file)) {
            return {
                success: false,
                error: "Only PDF, JPG, or PNG files are allowed",
            };
        }

        const uploadUrl = await convex.mutation(api.receipts.generateUploadURL, {});
        const arrayBuffer = await file.arrayBuffer();

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Content-Type": resolveContentType(file),
            },
            body: new Uint8Array(arrayBuffer),
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
        }

        const { storageId } = await uploadResponse.json();
        const mimeType = resolveContentType(file);
        const receiptId = await convex.mutation(api.receipts.storeReceipt, {
            userId: user.id,
            fileId: storageId,
            fileName: file.name,
            size: file.size,
            mimeType,
        });

        const fileUrl = await getFileDownloadUrl(storageId);

        await inngest.send({
            name: Events.PROCESS_RECEIPT_FILE_AND_SAVE_TO_DATABASE,
            data: {
                url: fileUrl.downloadUrl,
                receiptId,
                mimeType,
            },
        });

        return {
            success: true,
            data: {
                receiptId,
                fileName: file.name,
            },
        };
    } catch (error) {
        console.error("Server action upload error : ", error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "An unknown error occured",
        };
    }
}