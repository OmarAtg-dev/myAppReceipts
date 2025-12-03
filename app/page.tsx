"use client";

import PDFDropzone from "@/components/PDFDropzone";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart,
  Check,
  Search,
  Shield,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const featureCards = [
  {
    icon: Upload,
    accentClass: "bg-blue-100 dark:bg-blue-900",
    iconClass: "text-blue-600 dark:text-blue-400",
    titleKey: "features.easyUploads.title",
    descriptionKey: "features.easyUploads.description",
  },
  {
    icon: Search,
    accentClass: "bg-green-100 dark:bg-green-900",
    iconClass: "text-green-600 dark:text-green-400",
    titleKey: "features.aiAnalysis.title",
    descriptionKey: "features.aiAnalysis.description",
  },
  {
    icon: BarChart,
    accentClass: "bg-purple-100 dark:bg-purple-900",
    iconClass: "text-purple-600 dark:text-purple-400",
    titleKey: "features.expenseInsights.title",
    descriptionKey: "features.expenseInsights.description",
  },
] as const;

const pricingPlans = [
  {
    tier: "free",
    highlight: false,
    titleKey: "pricing.free.title",
    descriptionKey: "pricing.free.description",
    priceKey: "pricing.free.price",
    ctaKey: "pricing.free.cta",
    bulletKeys: [
      "pricing.free.b1",
      "pricing.free.b2",
      "pricing.free.b3",
    ] as const,
    buttonVariant: "outline" as const,
  },
  {
    tier: "starter",
    highlight: false,
    titleKey: "pricing.starter.title",
    descriptionKey: "pricing.starter.description",
    priceKey: "pricing.starter.price",
    ctaKey: "pricing.starter.cta",
    bulletKeys: [
      "pricing.starter.b1",
      "pricing.starter.b2",
      "pricing.starter.b3",
      "pricing.starter.b4",
    ] as const,
    buttonVariant: "outline" as const,
  },
  {
    tier: "pro",
    highlight: true,
    titleKey: "pricing.pro.title",
    descriptionKey: "pricing.pro.description",
    priceKey: "pricing.pro.price",
    ctaKey: "pricing.pro.cta",
    bulletKeys: [
      "pricing.pro.b1",
      "pricing.pro.b2",
      "pricing.pro.b3",
      "pricing.pro.b4",
    ] as const,
    buttonVariant: "default" as const,
  },
] as const;

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-gradient-to-b from-blue-50 to-gray-100 py-20 dark:from-gray-900 dark:to-gray-800 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                {t("hero.title")}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-300 md:text-lg">
                {t("hero.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/receipts">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  {t("hero.ctaPrimary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline">{t("hero.ctaSecondary")}</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center px-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
            <div className="relative p-6 md:p-8">
              <PDFDropzone />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                {t("features.title")}
              </h2>
              <p className="max-w-2xl text-gray-500 dark:text-gray-400 md:text-xl">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.titleKey}
                    className="flex flex-col items-center space-y-2 rounded-lg border border-gray-200 p-6 text-center dark:border-gray-800"
                  >
                    <div className={`rounded-full p-3 ${feature.accentClass}`}>
                      <Icon className={`h-6 w-6 ${feature.iconClass}`} />
                    </div>
                    <h3 className="text-xl font-bold">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {t(feature.descriptionKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 dark:bg-gray-900 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                {t("pricing.title")}
              </h2>
              <p className="max-w-2xl text-gray-500 dark:text-gray-400 md:text-xl">
                {t("pricing.subtitle")}
              </p>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.tier}
                className={`relative flex flex-col rounded-lg border p-6 shadow-sm ${
                  plan.highlight
                    ? "border-blue-200 bg-blue-50 dark:border-blue-900/20 dark:bg-blue-950"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
                    {t("pricing.pro.ribbon")}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{t(plan.titleKey)}</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t(plan.descriptionKey)}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-4xl font-bold">{t(plan.priceKey)}</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("pricing.perMonth")}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-2">
                  {plan.bulletKeys.map((bullet) => (
                    <li key={bullet} className="flex items-center text-left">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      <span>{t(bullet)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Link href="/manage-plan">
                    <Button className="w-full" variant={plan.buttonVariant}>
                      {t(plan.ctaKey)}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 md:text-xl">
              {t("cta.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold">{t("app.name")}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("footer.tagline")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}