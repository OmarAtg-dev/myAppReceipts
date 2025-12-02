"use client";
import {
    SchematicEmbed as SchematicEmbedComponent,
    EmbedProvider,
} from "@schematichq/schematic-components";

const schematicPublishableKey = process.env.NEXT_PUBLIC_SCHEMATIC_KEY;

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
            <SchematicEmbedComponent accessToken={accessToken} id={componentId} />
        </EmbedProvider>
    );
}

export default SchematicEmbed;