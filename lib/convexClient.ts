import { ConvexHttpClient } from "convex/browser";

let cachedClient: ConvexHttpClient | null = null;

const resolveConvexUrl = (): string | undefined =>
    process.env.NEXT_PUBLIC_CONVEX_URL ??
    process.env.CONVEX_URL ??
    process.env.CONVEX_DEPLOYMENT;

const buildMissingEnvClient = (): ConvexHttpClient => {
    const errorMessage =
        "Convex URL is not configured. Set NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL / CONVEX_DEPLOYMENT) in your environment.";

    const throwMissingEnv = () => {
        throw new Error(errorMessage);
    };

    return {
        mutation: throwMissingEnv,
        query: throwMissingEnv,
        action: throwMissingEnv,
        workflow: throwMissingEnv,
    } as unknown as ConvexHttpClient;
};

export function getConvexClient(): ConvexHttpClient {
    if (cachedClient) {
        return cachedClient;
    }
    const apiUrl = resolveConvexUrl();
    cachedClient = apiUrl ? new ConvexHttpClient(apiUrl) : buildMissingEnvClient();
    return cachedClient;
}

export default getConvexClient;