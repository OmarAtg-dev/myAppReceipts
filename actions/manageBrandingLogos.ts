"use server";

import { api } from "@/convex/_generated/api";
import convex from "@/lib/convexClient";
import { currentUser } from "@clerk/nextjs/server";

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg"]);

const resolveLogoContentType = (file: File): string => {
    if (file.type && ACCEPTED_TYPES.has(file.type)) {
        return file.type;
    }
    const lowerName = file.name?.toLowerCase() ?? "";
    if (lowerName.endsWith(".png")) return "image/png";
    if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
    return "application/octet-stream";
};

const isSupportedLogo = (file: File): boolean => {
    if (ACCEPTED_TYPES.has(file.type)) return true;
    const lowerName = file.name?.toLowerCase() ?? "";
    return lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg");
};

type LogoSide = "company" | "client";

export async function uploadBrandingLogo(formData: FormData) {
    const user = await currentUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const sideValue = formData.get("side");
    if (sideValue !== "company" && sideValue !== "client") {
        return { success: false, error: "Invalid logo side" };
    }
    const side = sideValue as LogoSide;

    const file = formData.get("file") as File | null;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    if (!isSupportedLogo(file)) {
        return { success: false, error: "Only PNG or JPG logos are allowed" };
    }

    try {
        const uploadUrl = await convex.mutation(api.branding.generateLogoUploadURL, {});
        const arrayBuffer = await file.arrayBuffer();
        const contentType = resolveLogoContentType(file);
        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
            },
            body: new Uint8Array(arrayBuffer),
        });
        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload logo: ${uploadResponse.statusText}`);
        }
        const { storageId } = await uploadResponse.json();
        await convex.mutation(api.branding.storeLogo, {
            storageId,
            fileName: file.name,
            mimeType: contentType,
            side,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to upload branding logo", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}

export async function deleteBrandingLogo(side: LogoSide) {
    const user = await currentUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }
    try {
        await convex.mutation(api.branding.deleteLogo, { side });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete branding logo", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}
