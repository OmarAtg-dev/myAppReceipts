"use client";

import { deleteBrandingLogo, uploadBrandingLogo } from "@/actions/manageBrandingLogos";
import type { Doc } from "@/convex/_generated/dataModel";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";

type BrandingDoc = Doc<"brandingAssets"> | null;
type LogoSide = "company" | "client";

type LogoManagerModalProps = {
    open: boolean;
    mode: "enforce" | "manage";
    logos: BrandingDoc;
    onClose: () => void;
    onContinue?: () => void;
};

const SIDE_COPY: Record<
    LogoSide,
    {
        title: string;
        description: string;
        field: "companyLogoStorageId" | "clientLogoStorageId";
        nameField: "companyLogoName" | "clientLogoName";
    }
> = {
    company: {
        title: "Company logo (left)",
        description: "Used for your business badge on the left side.",
        field: "companyLogoStorageId",
        nameField: "companyLogoName",
    },
    client: {
        title: "Client logo (right)",
        description: "Used for the ministry/client badge on the right side.",
        field: "clientLogoStorageId",
        nameField: "clientLogoName",
    },
};

export function LogoManagerModal({ open, mode, logos, onClose, onContinue }: LogoManagerModalProps) {
    const [error, setError] = useState<string | null>(null);
    const [uploadingSide, setUploadingSide] = useState<LogoSide | null>(null);
    const [deletingSide, setDeletingSide] = useState<LogoSide | null>(null);
    const fileInputs: Record<LogoSide, React.RefObject<HTMLInputElement>> = {
        company: useRef<HTMLInputElement>(null),
        client: useRef<HTMLInputElement>(null),
    };

    const isCompanyMissing = !logos?.companyLogoStorageId;
    const isClientMissing = !logos?.clientLogoStorageId;
    const logosReady = Boolean(logos?.companyLogoStorageId && logos?.clientLogoStorageId);
    const isBusy = Boolean(uploadingSide) || Boolean(deletingSide);

    const heading = mode === "enforce" ? "Upload required logos" : "Manage stored logos";
    const description =
        mode === "enforce"
            ? "We need both the company logo (left) and the client logo (right) before generating the Excel file."
            : "Replace or delete your stored logos. These appear on every exported Excel file.";

    const statusLabel = useCallback(
        (side: LogoSide) => {
            const storageField = SIDE_COPY[side].field;
            const nameField = SIDE_COPY[side].nameField;
            if (!logos?.[storageField]) {
                return "No logo uploaded yet";
            }
            return logos[nameField] ?? "Logo ready";
        },
        [logos],
    );

    const handleUpload = useCallback(
        async (side: LogoSide, file: File | null) => {
            if (!file) return;
            setError(null);
            setUploadingSide(side);
            const formData = new FormData();
            formData.append("side", side);
            formData.append("file", file);
            const result = await uploadBrandingLogo(formData);
            if (!result.success) {
                setError(result.error ?? "Unable to upload logo. Please try again.");
            }
            setUploadingSide(null);
        },
        [],
    );

    const handleDelete = useCallback(async (side: LogoSide) => {
        setError(null);
        setDeletingSide(side);
        const result = await deleteBrandingLogo(side);
        if (!result.success) {
            setError(result.error ?? "Unable to delete logo. Please try again.");
        }
        setDeletingSide(null);
    }, []);

    const triggerFilePicker = useCallback((side: LogoSide) => {
        fileInputs[side].current?.click();
    }, fileInputs);

    const missingSides = useMemo(() => {
        const missing: string[] = [];
        if (isCompanyMissing) missing.push("Company logo");
        if (isClientMissing) missing.push("Client logo");
        return missing;
    }, [isCompanyMissing, isClientMissing]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-3xl rounded-lg bg-white shadow-2xl">
                <div className="border-b px-6 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Logo requirements</p>
                    <h2 className="text-xl font-semibold text-slate-900">{heading}</h2>
                    <p className="mt-1 text-sm text-slate-600">{description}</p>
                </div>

                <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
                    {(["company", "client"] as LogoSide[]).map((side) => {
                        const copy = SIDE_COPY[side];
                        const missing = side === "company" ? isCompanyMissing : isClientMissing;
                        return (
                            <div
                                key={side}
                                className={`rounded-lg border p-4 ${missing ? "border-amber-400 bg-amber-50" : "border-slate-200"}`}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{copy.title}</p>
                                        <p className="text-xs text-slate-500">{copy.description}</p>
                                    </div>
                                    {logos?.[copy.field] && (
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                            Ready
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-slate-600">
                                    {statusLabel(side)}
                                    {missing && <span className="ml-2 font-medium text-amber-700">(required)</span>}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => triggerFilePicker(side)}
                                        disabled={isBusy}
                                    >
                                        {uploadingSide === side ? "Uploading…" : logos?.[copy.field] ? "Replace" : "Upload"}
                                    </Button>
                                    <input
                                        ref={fileInputs[side]}
                                        type="file"
                                        className="hidden"
                                        accept="image/png,image/jpeg"
                                        onChange={(event) => handleUpload(side, event.target.files?.[0] ?? null)}
                                    />
                                    {logos?.[copy.field] && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(side)}
                                            disabled={isBusy}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            {deletingSide === side ? "Deleting…" : "Delete"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {missingSides.length > 0 && (
                    <div className="px-6 text-sm text-amber-700">
                        Missing: {missingSides.join(" and ")}. Please upload PNG or JPG files under 5 MB.
                    </div>
                )}
                {error && <p className="px-6 pt-2 text-sm text-red-600">{error}</p>}

                <div className="flex flex-col gap-3 border-t px-6 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                    <p>
                        Need to update later? Open this manager from the export dialog or account settings to replace or delete
                        your logos.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isBusy && mode === "enforce"}>
                            {mode === "enforce" && !logosReady ? "Cancel" : "Close"}
                        </Button>
                        {mode === "enforce" ? (
                            <Button type="button" onClick={onContinue} disabled={!logosReady || isBusy}>
                                Continue to export
                            </Button>
                        ) : (
                            <Button type="button" onClick={onClose} disabled={isBusy}>
                                Done
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
