"use client"
import { SchematicEmbed as SchematicEmbedComponent, EmbedProvider } from "@schematichq/schematic-components";

function SchematicEmbed({
    accessToken,
    componentId,
}:{
    accessToken: string;
    componentId: string;
}) {

    console.log("Component ID is", componentId);
    console.log("Access Token is", accessToken);
    return (
        <EmbedProvider>
            <SchematicEmbedComponent accessToken={accessToken} id={componentId} />
        </EmbedProvider>
    )
}
export default SchematicEmbed;