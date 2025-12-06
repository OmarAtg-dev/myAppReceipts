"use client";

import { Button } from "@/components/ui/button";
import { RIVE_OPTIONS, type RiveOption } from "@/lib/excelExport";
import { X } from "lucide-react";
import { useMemo } from "react";

type ExcelExportModalProps = {
    open: boolean;
    section: string;
    rive: RiveOption;
    isSubmitting?: boolean;
    onSectionChange: (value: string) => void;
    onRiveChange: (value: RiveOption) => void;
    onCancel: () => void;
    onConfirm: () => void;
};

export function ExcelExportModal({
    open,
    section,
    rive,
    isSubmitting = false,
    onSectionChange,
    onRiveChange,
    onCancel,
    onConfirm,
}: ExcelExportModalProps) {
    const isConfirmDisabled = useMemo(() => {
        return isSubmitting || section.trim().length === 0;
    }, [isSubmitting, section]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-emerald-600">
                            Export Excel
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900">Official template details</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <p className="text-sm text-gray-600">
                        Provide the Section and Rive exactly as you want them to appear in the Excel export. Both
                        fields are required to match the ministry layout shown in the reference sheet.
                    </p>

                    <label className="block text-sm font-medium text-gray-800">
                        Section<span className="text-red-500">*</span>
                        <input
                            type="text"
                            value={section}
                            onChange={(event) => onSectionChange(event.target.value)}
                            placeholder="e.g. PI51-P224"
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            required
                        />
                    </label>

                    <label className="block text-sm font-medium text-gray-800">
                        Rive<span className="text-red-500">*</span>
                        <select
                            value={rive}
                            onChange={(event) => onRiveChange(event.target.value as RiveOption)}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                            {RIVE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm} disabled={isConfirmDisabled}>
                        {isSubmitting ? "Generating…" : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
