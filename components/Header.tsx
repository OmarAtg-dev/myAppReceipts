'use client';

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "./ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

function Header() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const { t } = useLanguage();

  return (
    <div
      className={`p-4 flex flex-wrap gap-4 justify-between items-center ${
        isHomepage ? "bg-blue-50" : "bg-white border-b border-blue-50"
      }`}
    >
      <Link href="/" className="flex items-center">
        <Shield className="w-6 h-6 text-blue-600 mr-2" />
        <h1 className="text-xl font-semibold">{t("app.name")}</h1>
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <LanguageSwitcher />
        <SignedIn>
          <div className="flex items-center gap-3">
            <Link href="/receipts">
              <Button variant="outline">{t("header.myReceipts")}</Button>
            </Link>
            <Link href="/manage-plan">
              <Button>{t("header.managePlan")}</Button>
            </Link>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>{t("header.login")}</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

export default Header;