"use client";

import SchematicComponent from "@/components/schematic/SchematicComponent";
import { useLanguage } from "@/components/LanguageProvider";

function ManagePlan() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-0">
      <h1 className="my-8 text-2xl font-bold">
        {t("managePlan.title")}
      </h1>
      <p className="mb-8 text-gray-600">{t("managePlan.subtitle")}</p>

      <SchematicComponent
        componentId={process.env.NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID}
      />
    </div>
  );
}
export default ManagePlan;