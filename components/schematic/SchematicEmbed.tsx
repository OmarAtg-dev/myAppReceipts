"use client";
import { useEffect } from "react";
import {
    EmbedProvider,
    SchematicEmbed as SchematicEmbedComponent,
    useEmbed,
} from "@schematichq/schematic-components";

const schematicPublishableKey = process.env.NEXT_PUBLIC_SCHEMATIC_KEY;

function EnsureCheckoutCapability() {
    const { data, setData } = useEmbed();

    useEffect(() => {
        if (data && data.capabilities?.checkout === false) {
            console.warn(
                "Schematic capabilities reported checkout=disabled; overriding to keep plan actions visible.",
            );
            setData({
                ...data,
                capabilities: {
                    ...data.capabilities,
                    checkout: true,
                },
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
            <EnsureCheckoutCapability />
            <SchematicEmbedComponent accessToken={accessToken} id={componentId} />
        </EmbedProvider>
    );
}

export default SchematicEmbed;