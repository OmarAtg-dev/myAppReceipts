"use client";
import { useEffect, useMemo } from "react";
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

declare global {
    interface Window {
        __schematicInvoicePatched?: boolean;
    }
}

function EnsurePlanControls() {
    const { data, setData } = useEmbed();

    const fallbackPlan = useMemo(() => {
        return data?.activePlans?.find((plan) => plan.current) ?? data?.activePlans?.[0];
    }, [data?.activePlans]);

    const fallbackPrice = useMemo(() => {
        if (!fallbackPlan) {
            return undefined;
        }
        return (
            fallbackPlan.monthlyPrice ??
            fallbackPlan.yearlyPrice ??
            fallbackPlan.oneTimePrice ??
            undefined
        );
    }, [fallbackPlan]);

    const derivedCompanySubscription = useMemo(
        () =>
            normalizeSubscription(
                data?.company?.billingSubscription ?? data?.company?.billingSubscriptions?.[0],
                fallbackPrice,
            ),
        [
            data?.company?.billingSubscription,
            data?.company?.billingSubscriptions,
            fallbackPrice,
        ],
    );

    const syntheticCompanyId =
        data?.company?.keys?.[0]?.value ?? data?.company?.id ?? "synthetic-company";

    const fallbackInvoice = useMemo(() => {
        if (!fallbackPrice?.price) {
            return null;
        }
        const now = new Date();
        const dueDate = new Date(now.getTime());
        dueDate.setDate(dueDate.getDate() + 30);
        return {
            amountDue: fallbackPrice.price,
            amountPaid: 0,
            amountRemaining: fallbackPrice.price,
            collectionMethod: "charge_automatically",
            companyId: syntheticCompanyId,
            createdAt: now.toISOString(),
            currency: fallbackPrice.currency ?? "usd",
            customerExternalId: syntheticCompanyId,
            dueDate: dueDate.toISOString(),
            environmentId: "synthetic",
            id: `synthetic-invoice-${now.getTime()}`,
            number: `INV-${now.getTime()}`,
            status: "draft",
            subtotal: fallbackPrice.price,
            total: fallbackPrice.price,
            periodStart: now.toISOString(),
            periodEnd: dueDate.toISOString(),
            lines: [],
        };
    }, [fallbackPrice?.price, fallbackPrice?.currency, syntheticCompanyId]);

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

        const hasPaidPlan = fallbackPlan && fallbackPrice && !fallbackPlan.isFree;
        const shouldSynthesizeSubscription =
            !data.subscription && !derivedCompanySubscription && hasPaidPlan;

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
    }, [data, setData, fallbackPlan, fallbackPrice, derivedCompanySubscription]);

    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !data?.component?.id ||
            !fallbackInvoice ||
            window.__schematicInvoicePatched
        ) {
            return;
        }

        const originalFetch = window.fetch.bind(window);
        const componentId = data.component.id;
        const fallbackPayload = JSON.stringify({ data: fallbackInvoice });

        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            const resolvedUrl =
                typeof input === "string"
                    ? input
                    : input instanceof Request
                    ? input.url
                    : input instanceof URL
                    ? input.toString()
                    : "";

            const targetPath = `/components/${componentId}/hydrate/upcoming-invoice`;

            if (resolvedUrl.includes(targetPath)) {
                try {
                    const response = await originalFetch(input, init);
                    if (response.status !== 404) {
                        return response;
                    }
                    console.warn(
                        "Schematic upcoming invoice endpoint returned 404; providing fallback invoice.",
                    );
                } catch (error) {
                    console.warn(
                        "Schematic upcoming invoice endpoint failed; providing fallback invoice.",
                        error,
                    );
                }

                return new Response(fallbackPayload, {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            return originalFetch(input, init);
        };

        window.__schematicInvoicePatched = true;

        return () => {
            window.fetch = originalFetch;
            delete window.__schematicInvoicePatched;
        };
    }, [data?.component?.id, fallbackInvoice]);

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