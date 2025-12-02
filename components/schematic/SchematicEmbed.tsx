"use client";
import { useEffect } from "react";
import {
    EmbedProvider,
    SchematicEmbed as SchematicEmbedComponent,
    useEmbed,
} from "@schematichq/schematic-components";

const schematicPublishableKey = process.env.NEXT_PUBLIC_SCHEMATIC_KEY;

function coerceDate(value?: number | string | Date | null) {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        return value;
    }
    const numericValue =
        typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
    if (!Number.isNaN(numericValue)) {
        return new Date(numericValue);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeSubscription(
    source: any,
    fallbackPrice?: { currency?: string; interval?: string; price?: number },
) {
    if (!source) {
        return undefined;
    }

    return {
        cancelAt: coerceDate(source.cancelAt),
        cancelAtPeriodEnd: Boolean(source.cancelAtPeriodEnd),
        currency: source.currency ?? fallbackPrice?.currency ?? "usd",
        customerExternalId: source.customerExternalId ?? "unknown-company",
        discounts: source.discounts ?? [],
        interval: source.interval ?? fallbackPrice?.interval ?? "month",
        latestInvoice: source.latestInvoice,
        paymentMethod: source.paymentMethod,
        products: source.products ?? [],
        status: source.status ?? "active",
        subscriptionExternalId:
            source.subscriptionExternalId ?? source.id ?? `synthetic-${fallbackPrice?.interval ?? "plan"}`,
        totalPrice:
            typeof source.totalPrice === "number" ? source.totalPrice : fallbackPrice?.price ?? 0,
        trialEnd: coerceDate(source.trialEnd),
    };
}

function EnsurePlanControls() {
    const { data, setData } = useEmbed();

    useEffect(() => {
        if (!data) {
            return;
        }

        let shouldUpdate = false;
        const updates: Record<string, unknown> = {};

        if (data.capabilities?.checkout === false) {
            console.warn(
                "Schematic capabilities reported checkout=disabled; overriding to keep plan actions visible.",
            );
            updates.capabilities = {
                ...data.capabilities,
                checkout: true,
            };
            shouldUpdate = true;
        }

        const fallbackPlan =
            data.activePlans?.find((plan) => plan.current) ?? data.activePlans?.[0];
        const fallbackPrice =
            fallbackPlan?.monthlyPrice ??
            fallbackPlan?.yearlyPrice ??
            fallbackPlan?.oneTimePrice;

        const derivedCompanySubscription =
            normalizeSubscription(
                data.company?.billingSubscription ?? data.company?.billingSubscriptions?.[0],
                fallbackPrice,
            ) ?? undefined;

        const shouldSynthesizeSubscription =
            !data.subscription &&
            !derivedCompanySubscription &&
            fallbackPlan &&
            fallbackPrice &&
            !fallbackPlan.isFree;

        if (!data.subscription && derivedCompanySubscription) {
            updates.subscription = derivedCompanySubscription;
            shouldUpdate = true;
        } else if (!data.subscription && shouldSynthesizeSubscription) {
            console.warn(
                "Schematic hydrate response missing subscription; creating fallback so the unsubscribe button stays visible.",
            );
            updates.subscription = normalizeSubscription(
                {
                    cancelAt: null,
                    cancelAtPeriodEnd: false,
                    currency: fallbackPrice?.currency,
                    customerExternalId:
                        data.company?.keys?.[0]?.value ?? data.company?.id ?? "synthetic-company",
                    discounts: [],
                    interval: fallbackPrice?.interval,
                    products: fallbackPlan ? [{ name: fallbackPlan.name }] : [],
                    status: "active",
                    subscriptionExternalId:
                        data.company?.plan?.billingProductExternalId ?? `synthetic-${fallbackPlan?.id}`,
                    totalPrice: fallbackPrice?.price,
                    trialEnd: null,
                },
                fallbackPrice,
            );
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            setData({
                ...(data as any),
                ...updates,
            });
        }
    }, [data, setData]);

    return null;
}

function SchematicEmbed({
    accessToken,
    componentId,
}: {
    accessToken: string;
    componentId: string;
}) {
    if (!schematicPublishableKey) {
        console.error("Missing NEXT_PUBLIC_SCHEMATIC_KEY for Schematic embed");
        return null;
    }

    return (
        <EmbedProvider apiKey={schematicPublishableKey}>
            <EnsurePlanControls />
            <SchematicEmbedComponent accessToken={accessToken} id={componentId} />
        </EmbedProvider>
    );
}

export default SchematicEmbed;