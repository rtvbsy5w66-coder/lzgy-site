"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Globe,
  Mail,
  Share2,
  Search,
  ToggleLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Palette,
  Lock,
} from "lucide-react";

interface ThemeData {
  id: string;
  name: string;
  description: string | null;
  fromColor: string;
  toColor: string;
  textColor: string;
  type: string;
  isActive: boolean;
}

interface SettingsData {
  general: {
    site_name: string;
    site_description: string;
    site_tagline: string;
    contact_email: string;
    contact_phone: string;
    office_address: string;
  };
  email: {
    smtp_host: string;
    smtp_port: string;
    smtp_user: string;
    smtp_from_name: string;
    smtp_from_email: string;
    admin_notification_email: string;
  };
  social: {
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
    linkedin_url: string;
    youtube_url: string;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    google_analytics_id: string;
    google_site_verification: string;
  };
  features: {
    enable_petitions: boolean;
    enable_polls: boolean;
    enable_events: boolean;
    enable_blog: boolean;
    enable_newsletter: boolean;
    enable_comments: boolean;
    enable_user_registration: boolean;
  };
}

interface CategoryColor {
  id: string;
  name: string;
  color: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

type SettingsCategory = keyof SettingsData | "themes" | "categories" | "password";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [categories, setCategories] = useState<CategoryColor[]>([]);
  const [activeTab, setActiveTab] = useState<SettingsCategory>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchSettings();
      fetchThemes();
      fetchCategories();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setMessage({
        type: "error",
        text: "Hiba történt a beállítások betöltésekor",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const response = await fetch("/api/themes");
      const data = await response.json();
      setThemes(data);
    } catch (error) {
      console.error("Failed to fetch themes:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category-colors");
      const data = await response.json();

      // Ensure data is an array before setting
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error("API returned non-array data:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Beállítások sikeresen mentve!",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({
        type: "error",
        text: "Hiba történt a mentés során",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (
    category: SettingsCategory,
    key: string,
    value: any
  ) => {
    if (!settings || category === "themes" || category === "categories") return;
    setSettings({
      ...settings,
      [category]: {
        ...(settings[category as keyof SettingsData] as any),
        [key]: value,
      },
    });
  };

  const saveThemes = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Find the active GLOBAL theme
      const activeGlobalTheme = themes.find(t => t.type === "GLOBAL" && t.isActive);

      if (!activeGlobalTheme) {
        throw new Error("No active global theme selected");
      }

      // Activate the selected theme via API
      const response = await fetch("/api/themes/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: activeGlobalTheme.id,
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate theme");
      }

      setMessage({
        type: "success",
        text: `${activeGlobalTheme.name} téma sikeresen aktiválva!`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save themes:", error);
      setMessage({
        type: "error",
        text: "Hiba történt a téma aktiválása során",
      });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN" || !settings) {
    return null;
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Az új jelszavak nem egyeznek!",
      });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "A jelszónak legalább 8 karakter hosszúnak kell lennie!",
      });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Jelszó sikeresen megváltoztatva!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Hiba történt a jelszó megváltoztatása során",
        });
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      setMessage({
        type: "error",
        text: "Hiba történt a jelszó megváltoztatása során",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { id: "general", label: "Általános", icon: Globe },
    { id: "password", label: "Jelszó", icon: Lock },
    { id: "themes", label: "Témák & Színek", icon: Palette },
    { id: "categories", label: "Kategória Színek", icon: Palette },
    { id: "email", label: "Email", icon: Mail },
    { id: "social", label: "Közösségi média", icon: Share2 },
    { id: "seo", label: "SEO", icon: Search },
    { id: "features", label: "Funkciók", icon: ToggleLeft },
  ] as const;

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Beállítások</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Oldal beállítások és konfiguráció
            </p>
          </div>
          {activeTab !== "password" && activeTab !== "themes" && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? "Mentés..." : "Mentés"}
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Password Settings */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Jelszó megváltoztatása
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Változtasd meg az admin jelszavad. A jelszónak legalább 8 karakter hosszúnak kell lennie.
                </p>

                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jelenlegi jelszó
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                      placeholder="Jelenlegi jelszó"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Új jelszó
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                      placeholder="Új jelszó (min. 8 karakter)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Új jelszó megerősítése
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                      placeholder="Új jelszó megerősítése"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Lock className="w-5 h-5" />
                    {changingPassword ? "Jelszó módosítása..." : "Jelszó módosítása"}
                  </button>
                </div>
              </div>
            )}

            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Általános beállítások
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Oldal neve
                  </label>
                  <input
                    type="text"
                    value={settings.general.site_name}
                    onChange={(e) =>
                      updateSetting("general", "site_name", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Oldal leírás
                  </label>
                  <textarea
                    value={settings.general.site_description}
                    onChange={(e) =>
                      updateSetting("general", "site_description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Szlogen
                  </label>
                  <input
                    type="text"
                    value={settings.general.site_tagline}
                    onChange={(e) =>
                      updateSetting("general", "site_tagline", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kapcsolat email
                    </label>
                    <input
                      type="email"
                      value={settings.general.contact_email}
                      onChange={(e) =>
                        updateSetting("general", "contact_email", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefonszám
                    </label>
                    <input
                      type="tel"
                      value={settings.general.contact_phone}
                      onChange={(e) =>
                        updateSetting("general", "contact_phone", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Iroda cím
                  </label>
                  <input
                    type="text"
                    value={settings.general.office_address}
                    onChange={(e) =>
                      updateSetting("general", "office_address", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Themes Settings */}
            {activeTab === "themes" && (
              <div className="space-y-8">
                {/* GLOBAL Themes - Szezonális témaválasztó */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Szezonális oldaltéma
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Válassz egy szezonális témát az oldal színvilágának megváltoztatásához. Ez az egész oldal alap színsémáját befolyásolja.
                      </p>
                    </div>
                    <button
                      onClick={saveThemes}
                      disabled={saving}
                      className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? "Mentés..." : "Téma Mentése"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {themes
                      .filter(theme => theme.type === "GLOBAL")
                      .map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setThemes(prev =>
                              prev.map(t => ({
                                ...t,
                                isActive: t.type === "GLOBAL" ? t.id === theme.id : t.isActive,
                              }))
                            );
                          }}
                          className={`relative p-6 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-lg ${
                            theme.isActive
                              ? "border-indigo-600 dark:border-indigo-400 ring-4 ring-indigo-200 dark:ring-indigo-900/30 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800"
                              : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-gray-800"
                          }`}
                        >
                          {theme.isActive && (
                            <div className="absolute top-4 right-4">
                              <CheckCircle className="w-7 h-7 text-indigo-600 fill-indigo-100" />
                            </div>
                          )}

                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className="w-20 h-20 rounded-xl shadow-lg flex-shrink-0 border-2 border-white"
                              style={{
                                background: `linear-gradient(135deg, ${theme.fromColor} 0%, ${theme.toColor} 100%)`,
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{theme.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{theme.description}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md font-mono font-semibold text-gray-900 dark:text-gray-100">
                              {theme.fromColor}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">→</span>
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md font-mono font-semibold text-gray-900 dark:text-gray-100">
                              {theme.toColor}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-300 dark:border-gray-700 my-8"></div>

                {/* FIX Themes - Kategória színek (READ-ONLY) */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Kategória színek
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ezek a színek a különböző tartalomtípusok (hírek, események, program) jelölésére szolgálnak.
                    <strong className="text-red-600 dark:text-red-400"> Nem módosíthatók</strong>, mert fontos szerepük van a navigációban és kategorizálásban.
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    {themes
                      .filter(theme => ["NEWS", "EVENTS", "PROGRAM"].includes(theme.type))
                      .map(theme => (
                        <div
                          key={theme.id}
                          className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-12 h-12 rounded-lg shadow-sm flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${theme.fromColor} 0%, ${theme.toColor} 100%)`,
                              }}
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{theme.name}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {theme.type === "NEWS" && "Hírek kategória"}
                                {theme.type === "EVENTS" && "Események kategória"}
                                {theme.type === "PROGRAM" && "Program kategória"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Kezdő szín:</span>
                              <span className="font-mono text-gray-900 dark:text-gray-100">{theme.fromColor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Végső szín:</span>
                              <span className="font-mono text-gray-900 dark:text-gray-100">{theme.toColor}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {themes.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nincsenek elérhető témák.</p>
                    <p className="text-sm mt-2">Futtasd a seed scriptet a témák létrehozásához.</p>
                  </div>
                )}
              </div>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Email beállítások
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_host}
                      onChange={(e) =>
                        updateSetting("email", "smtp_host", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_port}
                      onChange={(e) =>
                        updateSetting("email", "smtp_port", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SMTP User (email cím)
                  </label>
                  <input
                    type="email"
                    value={settings.email.smtp_user}
                    onChange={(e) =>
                      updateSetting("email", "smtp_user", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Küldő neve
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_from_name}
                      onChange={(e) =>
                        updateSetting("email", "smtp_from_name", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Küldő email
                    </label>
                    <input
                      type="email"
                      value={settings.email.smtp_from_email}
                      onChange={(e) =>
                        updateSetting("email", "smtp_from_email", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin értesítési email
                  </label>
                  <input
                    type="email"
                    value={settings.email.admin_notification_email}
                    onChange={(e) =>
                      updateSetting(
                        "email",
                        "admin_notification_email",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Erre az email címre érkeznek az admin értesítések
                  </p>
                </div>
              </div>
            )}

            {/* Social Media Settings */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Közösségi média linkek
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.facebook_url}
                    onChange={(e) =>
                      updateSetting("social", "facebook_url", e.target.value)
                    }
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter/X URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.twitter_url}
                    onChange={(e) =>
                      updateSetting("social", "twitter_url", e.target.value)
                    }
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.instagram_url}
                    onChange={(e) =>
                      updateSetting("social", "instagram_url", e.target.value)
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.linkedin_url}
                    onChange={(e) =>
                      updateSetting("social", "linkedin_url", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.youtube_url}
                    onChange={(e) =>
                      updateSetting("social", "youtube_url", e.target.value)
                    }
                    placeholder="https://youtube.com/@..."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Category Colors Settings */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Program Kategória Színek
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Állítsd be az egyes programkategóriák színeit. Ezek a színek jelennek meg a programpont kártyákon.
                </p>

                <div className="space-y-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={category.color}
                          onChange={async (e) => {
                            const newColor = e.target.value;
                            try {
                              const response = await fetch(`/api/category-colors/${category.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ color: newColor }),
                              });
                              if (response.ok) {
                                setCategories(categories.map(c =>
                                  c.id === category.id ? { ...c, color: newColor } : c
                                ));
                                setMessage({
                                  type: "success",
                                  text: `${category.name} szín frissítve!`,
                                });
                                setTimeout(() => setMessage(null), 2000);
                              }
                            } catch (error) {
                              console.error("Failed to update color:", error);
                            }
                          }}
                          className="h-12 w-16 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                        />
                        <div
                          className="px-4 py-2 rounded-lg font-mono text-sm"
                          style={{ backgroundColor: category.color, color: '#fff' }}
                        >
                          {category.color}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Settings */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  SEO beállítások
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta title
                  </label>
                  <input
                    type="text"
                    value={settings.seo.meta_title}
                    onChange={(e) =>
                      updateSetting("seo", "meta_title", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta description
                  </label>
                  <textarea
                    value={settings.seo.meta_description}
                    onChange={(e) =>
                      updateSetting("seo", "meta_description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta keywords (vesszővel elválasztva)
                  </label>
                  <input
                    type="text"
                    value={settings.seo.meta_keywords}
                    onChange={(e) =>
                      updateSetting("seo", "meta_keywords", e.target.value)
                    }
                    placeholder="kulcsszó1, kulcsszó2, kulcsszó3"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.seo.google_analytics_id}
                    onChange={(e) =>
                      updateSetting("seo", "google_analytics_id", e.target.value)
                    }
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google Site Verification
                  </label>
                  <input
                    type="text"
                    value={settings.seo.google_site_verification}
                    onChange={(e) =>
                      updateSetting(
                        "seo",
                        "google_site_verification",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Features Settings */}
            {activeTab === "features" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Funkciók be/kikapcsolása
                </h2>

                <div className="space-y-4">
                  {Object.entries(settings.features).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {key === "enable_petitions" && "Petíciók"}
                        {key === "enable_polls" && "Szavazások"}
                        {key === "enable_events" && "Események"}
                        {key === "enable_blog" && "Blog/Hírek"}
                        {key === "enable_newsletter" && "Hírlevél"}
                        {key === "enable_comments" && "Hozzászólások"}
                        {key === "enable_user_registration" &&
                          "Felhasználói regisztráció"}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          updateSetting("features", key, e.target.checked)
                        }
                        className="w-5 h-5 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
