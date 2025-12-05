import { SchematicClient } from "@schematichq/schematic-typescript-node";

type SchematicClientLike = Pick<SchematicClient, "track">;

let cachedClient: SchematicClientLike | null = null;

export function getSchematicClient(): SchematicClientLike {
    if (cachedClient) {
        return cachedClient;
    }
    const apiKey = process.env.SCHEMATIC_API_KEY;
    if (!apiKey) {
        cachedClient = {
            track: async () => {
                if (process.env.NODE_ENV !== "production") {
                    console.warn(
                        "SCHEMATIC_API_KEY is not set. Skipping schematic tracking call.",
                    );
                }
            },
        };
        return cachedClient;
    }
    cachedClient = new SchematicClient({
        apiKey,
        cacheProviders: {
            flagChecks: [],
        },
    });
    return cachedClient;
}

export default getSchematicClient;