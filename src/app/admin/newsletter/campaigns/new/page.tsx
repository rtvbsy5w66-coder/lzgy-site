"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Clock,
  Users,
  Eye,
  Loader2,
  Calendar,
  Repeat,
  TestTube,
} from "lucide-react";

export default function NewCampaignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [preview, setPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    sendType: "immediate", // immediate, scheduled, recurring
    scheduledAt: "",
    recipientType: "all", // all, selected, test, category
    selectedIds: [] as string[],
    testEmail: "",
    selectedCategory: "", // SZAKPOLITIKA, V_KERULET, POLITIKAI_EDUGAMIFIKACIO, EU
    isRecurring: false,
    recurringType: "weekly", // weekly, monthly, quarterly
    recurringDay: 1,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchSubscribers();
    }
  }, [status, session]);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/subscribers");
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.data.filter((s: any) => s.isActive));
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.content) {
      alert("Kérlek töltsd ki a kötelező mezőket!");
      return;
    }

    if (formData.recipientType === "test" && !formData.testEmail) {
      alert("Teszt email küldéséhez add meg a teszt címet!");
      return;
    }

    if (formData.recipientType === "category" && !formData.selectedCategory) {
      alert("Válassz kategóriát!");
      return;
    }

    if (formData.recipientType === "selected" && formData.selectedIds.length === 0) {
      alert("Válassz ki legalább egy feliratkozót!");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        formData.sendType === "immediate" || formData.recipientType === "test"
          ? "/api/admin/newsletter/send"
          : "/api/admin/newsletter/campaigns";

      const payload =
        formData.sendType === "immediate" || formData.recipientType === "test"
          ? {
              subject: formData.subject,
              content: formData.content,
              recipients: formData.recipientType,
              selectedIds: formData.selectedIds,
              testEmail: formData.testEmail,
              selectedCategory: formData.selectedCategory,
            }
          : {
              ...formData,
              isRecurring: formData.sendType === "recurring",
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        alert(
          formData.sendType === "immediate"
            ? `✅ Email sikeresen elküldve ${data.sentCount} címzettnek!`
            : formData.sendType === "scheduled"
            ? `✅ Kampány ütemezve: ${new Date(formData.scheduledAt).toLocaleString("hu-HU")}`
            : `✅ Ismétlődő kampány beállítva!`
        );
        router.push("/admin/newsletter/campaigns");
      } else {
        alert(`❌ Hiba: ${data.error || "Ismeretlen hiba"}`);
      }
    } catch (error) {
      console.error("Campaign creation error:", error);
      alert("❌ Hiba történt a kampány létrehozása során");
    } finally {
      setLoading(false);
    }
  };

  const insertTemplate = (template: string) => {
    const templates = {
      greeting: `<h2>Kedves Feliratkozó!</h2><p>Örömmel értesítelek...</p>`,
      event: `<h2>Közelgő Esemény</h2><p><strong>Dátum:</strong> 2024. október 25.</p><p><strong>Helyszín:</strong> Budapest V. kerület</p><p>Várunk szeretettel!</p>`,
      news: `<h2>Friss Hírek</h2><ul><li>Első hír...</li><li>Második hír...</li><li>Harmadik hír...</li></ul>`,
    };
    setFormData({
      ...formData,
      content: formData.content + templates[template as keyof typeof templates],
    });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/newsletter/campaigns"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a kampányokhoz
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Új Kampány Létrehozása
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Alapinformációk
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kampány Neve (belső használatra)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="pl. Októberi hírlevél"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Tárgy *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Email tárgy..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Email Tartalom *
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => insertTemplate("greeting")}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  + Üdvözlet
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate("event")}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  + Esemény
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate("news")}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  + Hírek
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  {preview ? "Szerkesztés" : "Előnézet"}
                </button>
              </div>
            </div>

            {!preview ? (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
                placeholder="<h2>Üdvözlöm!</h2><p>Email tartalma HTML formátumban...</p>"
                required
              />
            ) : (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 min-h-[300px]">
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              HTML formátumban add meg a tartalmat. Használhatsz címsorokat (&lt;h2&gt;), bekezdéseket (&lt;p&gt;), listákat (&lt;ul&gt;, &lt;li&gt;) stb.
            </p>
          </div>

          {/* Send Type */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Küldési Beállítások
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Mikor küldjük ki?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="sendType"
                      value="immediate"
                      checked={formData.sendType === "immediate"}
                      onChange={(e) =>
                        setFormData({ ...formData, sendType: e.target.value })
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Azonnal
                      </div>
                      <div className="text-xs text-gray-500">Most küldi ki</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="sendType"
                      value="scheduled"
                      checked={formData.sendType === "scheduled"}
                      onChange={(e) =>
                        setFormData({ ...formData, sendType: e.target.value })
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Ütemezett
                      </div>
                      <div className="text-xs text-gray-500">Későbbi időpontra</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="sendType"
                      value="recurring"
                      checked={formData.sendType === "recurring"}
                      onChange={(e) =>
                        setFormData({ ...formData, sendType: e.target.value })
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Repeat className="w-4 h-4" />
                        Ismétlődő
                      </div>
                      <div className="text-xs text-gray-500">Rendszeres küldés</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.sendType === "scheduled" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Ütemezett időpont
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
              )}

              {formData.sendType === "recurring" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ismétlődés gyakorisága
                  </label>
                  <select
                    value={formData.recurringType}
                    onChange={(e) =>
                      setFormData({ ...formData, recurringType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="weekly">Hetente</option>
                    <option value="monthly">Havonta</option>
                    <option value="quarterly">Negyedévente</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Címzettek
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="recipientType"
                    value="all"
                    checked={formData.recipientType === "all"}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientType: e.target.value })
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Összes feliratkozó</div>
                    <div className="text-xs text-gray-500">{subscribers.length} fő</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="recipientType"
                    value="category"
                    checked={formData.recipientType === "category"}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientType: e.target.value })
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Kategória szerint</div>
                    <div className="text-xs text-gray-500">Szűrt lista</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="recipientType"
                    value="test"
                    checked={formData.recipientType === "test"}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientType: e.target.value })
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <TestTube className="w-4 h-4" />
                      Teszt
                    </div>
                    <div className="text-xs text-gray-500">Próbaküldés</div>
                  </div>
                </label>
              </div>

              {formData.recipientType === "category" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Válassz Kategóriát
                  </label>
                  <select
                    value={formData.selectedCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, selectedCategory: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    required
                  >
                    <option value="">-- Válassz kategóriát --</option>
                    <option value="SZAKPOLITIKA">Szakpolitika</option>
                    <option value="V_KERULET">V. Kerület</option>
                    <option value="POLITIKAI_EDUGAMIFIKACIO">Politikai Edugamifikáció</option>
                    <option value="EU">Európai Unió</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Csak azoknak küldjük, akik feliratkoztak erre a kategóriára.
                  </p>
                </div>
              )}

              {formData.recipientType === "test" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teszt Email Cím
                  </label>
                  <input
                    type="email"
                    value={formData.testEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, testEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="teszt@email.com"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Feldolgozás...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {formData.sendType === "immediate"
                    ? "Küldés Most"
                    : formData.sendType === "scheduled"
                    ? "Ütemezés"
                    : "Ismétlődő Beállítása"}
                </>
              )}
            </button>
            <Link
              href="/admin/newsletter/campaigns"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Mégse
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
