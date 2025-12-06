import { getFileDownloadUrl } from "@/actions/getFileDownloadUrl";
import type { Id } from "@/convex/_generated/dataModel";

export type LogoBinary = {
    base64: string;
    extension: "png" | "jpeg";
};

export type WorkbookLogoAssets = {
    left: LogoBinary;
    right: LogoBinary;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const detectExtension = (contentType?: string | null): "png" | "jpeg" => {
    if (!contentType) return "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
        return "jpeg";
    }
    return "png";
};

type LogoDescriptor = {
    storageId: Id<"_storage">;
    mimeType?: string | null;
};

const downloadLogo = async ({ storageId, mimeType }: LogoDescriptor): Promise<LogoBinary> => {
    const result = await getFileDownloadUrl(storageId);
    if (!result.success || !result.downloadUrl) {
        throw new Error("Unable to load logo.");
    }
    const response = await fetch(result.downloadUrl);
    if (!response.ok) {
        throw new Error("Unable to download logo image.");
    }
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? mimeType ?? undefined;
    return {
        base64: arrayBufferToBase64(buffer),
        extension: detectExtension(contentType),
    };
};

export const fetchWorkbookLogos = async (args: {
    company: LogoDescriptor;
    client: LogoDescriptor;
}): Promise<WorkbookLogoAssets> => {
    const [left, right] = await Promise.all([downloadLogo(args.company), downloadLogo(args.client)]);
    return { left, right };
};
