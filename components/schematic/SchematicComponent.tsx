// this is a server Component that fetches the access token which is secure 
// then rendering out a client component  'SchematicEmbed' , passing throught the access token and the componentId props ,
// then we render out the client component 
import { getTemporaryAccessToken } from "@/actions/getTemporaryAccessToken";
import SchematicEmbed from "./SchematicEmbed";
import { unstable_noStore as noStore } from "next/cache";

async function SchematicComponent({ componentId }: { componentId?: string }) {
    noStore(); // ensure we always fetch a fresh embed token
    if (!componentId) {
        return (
            <p className="rounded-md border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
                Missing Schematic component id. Add NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID to your env config.
            </p>
        );
    }
    const accessToken = await getTemporaryAccessToken();
    if (!accessToken) {
        return (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                We could not generate an access token. Make sure you are signed in and try again.
            </p>
        );
    }
    return (
        <SchematicEmbed
            key={accessToken}
            accessToken={accessToken}
            componentId={componentId}
        />
    );
}

export default SchematicComponent;