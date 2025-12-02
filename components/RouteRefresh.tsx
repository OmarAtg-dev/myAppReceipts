"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Forces a router refresh once per mount so dynamic routes with tokens
 * are always re-fetched instead of reusing cached payloads.
 */
export default function RouteRefresh() {
    const router = useRouter();
    const hasRefreshedRef = useRef(false);

    useEffect(() => {
        if (hasRefreshedRef.current) {
            return;
        }
        hasRefreshedRef.current = true;
        const frame = requestAnimationFrame(() => {
            router.refresh();
        });
        return () => cancelAnimationFrame(frame);
    }, [router]);

    return null;
}
