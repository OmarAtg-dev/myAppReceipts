import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const logoSideValidator = v.union(v.literal("company"), v.literal("client"));

type LogoSide = "company" | "client";

const requireUser = async (ctx: Parameters<typeof query>[0]["context"]) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Not authenticated");
    }
    return identity.subject;
};

const getBrandingRecord = async (ctx: Parameters<typeof query>[0]["context"], userId: string) => {
    return await ctx.db
        .query("brandingAssets")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
};

export const getBrandingAssets = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        return await getBrandingRecord(ctx, identity.subject);
    },
});

export const generateLogoUploadURL = mutation({
    args: {},
    handler: async (ctx) => {
        await requireUser(ctx);
        return await ctx.storage.generateUploadUrl();
    },
});

export const storeLogo = mutation({
    args: {
        storageId: v.id("_storage"),
        fileName: v.string(),
        mimeType: v.string(),
        side: logoSideValidator,
    },
    handler: async (ctx, args) => {
        const userId = await requireUser(ctx);
        const existing = await getBrandingRecord(ctx, userId);

        if (existing) {
            if (args.side === "company" && existing.companyLogoStorageId) {
                await ctx.storage.delete(existing.companyLogoStorageId);
            }
            if (args.side === "client" && existing.clientLogoStorageId) {
                await ctx.storage.delete(existing.clientLogoStorageId);
            }
            await ctx.db.patch(existing._id, {
                updatedAt: Date.now(),
                companyLogoStorageId: args.side === "company" ? args.storageId : existing.companyLogoStorageId,
                companyLogoName: args.side === "company" ? args.fileName : existing.companyLogoName,
                companyLogoType: args.side === "company" ? args.mimeType : existing.companyLogoType,
                clientLogoStorageId: args.side === "client" ? args.storageId : existing.clientLogoStorageId,
                clientLogoName: args.side === "client" ? args.fileName : existing.clientLogoName,
                clientLogoType: args.side === "client" ? args.mimeType : existing.clientLogoType,
            });
            return existing._id;
        }

        return await ctx.db.insert("brandingAssets", {
            userId,
            updatedAt: Date.now(),
            companyLogoStorageId: args.side === "company" ? args.storageId : undefined,
            companyLogoName: args.side === "company" ? args.fileName : undefined,
            companyLogoType: args.side === "company" ? args.mimeType : undefined,
            clientLogoStorageId: args.side === "client" ? args.storageId : undefined,
            clientLogoName: args.side === "client" ? args.fileName : undefined,
            clientLogoType: args.side === "client" ? args.mimeType : undefined,
        });
    },
});

export const deleteLogo = mutation({
    args: {
        side: logoSideValidator,
    },
    handler: async (ctx, args) => {
        const userId = await requireUser(ctx);
        const existing = await getBrandingRecord(ctx, userId);
        if (!existing) {
            return;
        }

        if (args.side === "company" && existing.companyLogoStorageId) {
            await ctx.storage.delete(existing.companyLogoStorageId);
        }
        if (args.side === "client" && existing.clientLogoStorageId) {
            await ctx.storage.delete(existing.clientLogoStorageId);
        }

        await ctx.db.patch(existing._id, {
            updatedAt: Date.now(),
            companyLogoStorageId: args.side === "company" ? undefined : existing.companyLogoStorageId,
            companyLogoName: args.side === "company" ? undefined : existing.companyLogoName,
            companyLogoType: args.side === "company" ? undefined : existing.companyLogoType,
            clientLogoStorageId: args.side === "client" ? undefined : existing.clientLogoStorageId,
            clientLogoName: args.side === "client" ? undefined : existing.clientLogoName,
            clientLogoType: args.side === "client" ? undefined : existing.clientLogoType,
        });
    },
});
