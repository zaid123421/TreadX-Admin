import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enLayout from "./locales/en/layout.json";
import enRoutes from "./locales/en/routes.json";
import enDashboard from "./locales/en/dashboard.json";
import enAuth from "./locales/en/auth.json";
import arCommon from "./locales/ar/common.json";
import arLayout from "./locales/ar/layout.json";
import arRoutes from "./locales/ar/routes.json";
import arDashboard from "./locales/ar/dashboard.json";
import arAuth from "./locales/ar/auth.json";
import enLeads from "./locales/en/leads.json";
import arLeads from "./locales/ar/leads.json";

const resources = {
  en: {
    common: enCommon,
    layout: enLayout,
    routes: enRoutes,
    dashboard: enDashboard,
    auth: enAuth,
    leads: enLeads,
  },
  ar: {
    common: arCommon,
    layout: arLayout,
    routes: arRoutes,
    dashboard: arDashboard,
    auth: arAuth,
    leads: arLeads,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("treadx_locale") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  ns: ["common", "layout", "routes", "dashboard", "auth", "leads"],
  defaultNS: "common",
});

export default i18n;
