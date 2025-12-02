import RouteRefresh from "@/components/RouteRefresh";
import SchematicComponent from "@/components/schematic/SchematicComponent";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
function ManagePlan() {
    return (
        <div className="container xl:max-w-5xl mx-auto p-4 md:p-0">
            <RouteRefresh />
            <h1 className="text-2xl md:text-3xl font-bold mb-4 mt-8">
                Manage your plan
            </h1>
            <p className="text-gray-600 mb-8">
                Manage your subscription and billing details here.
            </p>

            <SchematicComponent
                componentId={process.env.NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID}
            />
        </div>
    );
}
export default ManagePlan;