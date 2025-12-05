'use server'
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convexClient";
import { currentUser } from "@clerk/nextjs/server";
import { getFileDownloadUrl } from "./getFileDownloadUrl";
import { inngest } from "@/inngest/client";
import Events from "@/inngest/constants";

/**
 *  Server action to upload a PDF file to Convex storage
 */


export async function uploadPDF(formData: FormData) {
    const user = await currentUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };

    }
    const convex = getConvexClient();
    try {
        //Get the file from the form data
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        //Validate file type
        if (
            !file.type.includes("pdf") &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            return { success: false, error: "Only PDF files are allowed" };
        }
        //Get upload URL from Convex
        const uploadUrl = await convex.mutation(api.receipts.generateUploadURL, {});

        //Convert file to arrayBuffer for  fetch API
        const arrayBuffer = await file.arrayBuffer();
        //Upload the file to convex storage
        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Content-Type": file.type,
            },
            body: new Uint8Array(arrayBuffer),
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
        }
        //Get storage ID from the response 
        const { storageId } = await uploadResponse.json();
        //Add a receipt to the database 
        const receiptId = await convex.mutation(api.receipts.storeReceipt, {
            userId: user.id,
            fileId: storageId,
            fileName: file.name,
            size: file.size,
            mimeType: file.type,

        });

        //Generate the file URL 
        const fileUrl = await getFileDownloadUrl(storageId);

        //TODO : trigger inngest agent flow...  this is the start  (input)
        console.log(' fileUrl.downloadUrl >> '+ fileUrl.downloadUrl, ' ..... ' , receiptId)
        await inngest.send({
            name: Events.PROCESS_RECEIPT_FILE_AND_SAVE_TO_DATABASE,
            data: {
                url: fileUrl.downloadUrl,
                receiptId,
            },
        });

        return {
            success: true,
            data: {
                receiptId,
                fileName: file.name
            }
        }
    } catch (error) {
        console.error("Server action upload error : ", error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "An inknown error occured",

        };
    }
}
