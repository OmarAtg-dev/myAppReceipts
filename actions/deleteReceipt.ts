"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

type DeleteReceiptResult = {
    success: boolean;
    error?: string;
};

export async function deleteReceipt(receiptId: Id<"receipts"> | string): Promise<DeleteReceiptResult> {
    const { userId, getToken } = await auth();
    if (!userId) {
        return { success: false, error: "Not authenticated" };
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
        return { success: false, error: "Missing Convex configuration" };
    }

    try {
        const token = await getToken({ template: "convex" });
        if (!token) {
            return {
                success: false,
                error: "Unable to authenticate request. Please try signing in again.",
            };
        }

        const client = new ConvexHttpClient(convexUrl);
        client.setAuth(token);
        await client.mutation(api.receipts.deleteReceipt, {
            id: receiptId as Id<"receipts">,
        });
        return { success: true };
    } catch (error) {
        console.error("Server action deleteReceipt error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}