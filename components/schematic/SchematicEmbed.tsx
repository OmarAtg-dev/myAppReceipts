"use client";
import { useEffect } from "react";
import {
    EmbedProvider,
    SchematicEmbed as SchematicEmbedComponent,
    useEmbed,
} from "@schematichq/schematic-components";

const schematicPublishableKey = process.env.NEXT_PUBLIC_SCHEMATIC_KEY;

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

        const shouldSynthesizeSubscription =
            !data.subscription && fallbackPlan && fallbackPrice && !fallbackPlan.isFree;

        if (shouldSynthesizeSubscription) {
            console.warn(
                "Schematic hydrate response missing subscription; creating fallback so the unsubscribe button stays visible.",
            );

            updates.subscription = {
                cancelAt: null,
                cancelAtPeriodEnd: false,
                currency: fallbackPrice.currency ?? "usd",
                customerExternalId:
                    data.company?.keys?.[0]?.value ??
                    data.company?.id ??
                    "synthetic-company",
                discounts: [],
                interval: fallbackPrice.interval ?? "month",
                products: [],
                status: "active",
                subscriptionExternalId:
                    data.company?.plan?.billingProductExternalId ??
                    `synthetic-${fallbackPlan.id}`,
                totalPrice: fallbackPrice.price ?? 0,
                trialEnd: null,
            };
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