import { ConvexHttpClient } from "convex/browser";

let cachedClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
    if (cachedClient) {
        return cachedClient;
    }
    const apiUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!apiUrl) {
        throw new Error(
            "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your environment to enable Convex mutations.",
        );
    }
    cachedClient = new ConvexHttpClient(apiUrl);
    return cachedClient;
}

export default getConvexClient;