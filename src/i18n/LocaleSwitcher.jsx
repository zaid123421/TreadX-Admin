import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { useLocale } from "./useLocale";

export default function LocaleSwitcher({ className }) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation("layout");

  const nextLocale = locale === "en" ? "ar" : "en";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setLocale(nextLocale)}
      title={t("locale.switchLanguage")}
      aria-label={t("locale.switchLanguage")}
    >
      <Languages className="h-5 w-5" />
      <span className="hidden sm:inline">{locale === "en" ? "AR" : "EN"}</span>
    </Button>
  );
}
