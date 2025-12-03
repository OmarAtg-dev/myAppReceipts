"use client";

import { LanguageCode, supportedLanguages } from "@/lib/i18n/translations";
import { useLanguage } from "./LanguageProvider";

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as LanguageCode;
    setLanguage(next);
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="language-select"
        className="text-sm font-medium text-gray-600 sr-only"
      >
        {t("header.language")}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleChange}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        aria-label={t("header.language")}
      >
        {supportedLanguages.map((option) => (
          <option key={option.code} value={option.code}>
            {option.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSwitcher;
