"use client";

import React from "react";
import { Loader2, Crown } from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import { useSession } from "next-auth/react";

function AlertMessage({
  type,
  children,
}: {
  type: "success" | "error";
  children: React.ReactNode;
}) {
  const bgColor =
    type === "success"
      ? "bg-green-500/10 border-green-500/50"
      : "bg-red-500/10 border-red-500/50";
  const textColor = type === "success" ? "text-green-200" : "text-red-200";

  return (
    <div className={`p-4 rounded-lg border ${bgColor} ${textColor} mb-6`}>
      {children}
    </div>
  );
}

export default function ContactForm() {
  const themeColors = useThemeColors();
  const isDarkMode = themeColors.mode === 'dark';
  const { data: session } = useSession();
  
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    district: "",
    preferredContact: "email",
    newsletter: false,
  });

  // AUTO-FILL: Automatikus kitöltés bejelentkezés után
  React.useEffect(() => {
    if (session?.user) {
      setFormData(prevData => ({
        ...prevData,
        name: session.user.name || prevData.name,
        email: session.user.email || prevData.email,
        phone: (session.user as any).phoneNumber || prevData.phone,
      }));
    }
  }, [session]);

  const [status, setStatus] = React.useState({
    submitting: false,
    submitted: false,
    error: null as string | null,
  });

  // Frontend validáció - BIZTONSÁGI JAVÍTÁS
  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim() || formData.name.length < 2) {
      errors.push("Név megadása kötelező (min. 2 karakter)");
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Érvényes email cím megadása kötelező");
    }
    
    if (!formData.subject.trim() || formData.subject.length < 3) {
      errors.push("Tárgy megadása kötelező (min. 3 karakter)");
    }
    
    if (!formData.message.trim() || formData.message.length < 10) {
      errors.push("Üzenet megadása kötelező (min. 10 karakter)");
    }
    
    // KRITIKUS: Telefonszám validáció - NEMZETKÖZI TÁMOGATÁS
    const validatePhoneNumber = (phone: string): boolean => {
      const phoneRegexes = [
        // Nemzetközi formátum: +[országkód][szám]
        /^\+[1-9]\d{1,14}$/,
        // Európai formátumok szóközökkel/kötőjelekkel
        /^\+[1-9]\d{1,3}[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/,
        // Magyar formátumok
        /^(\+36|06)[\s\-]?[1-9]\d[\s\-]?\d{3}[\s\-]?\d{3,4}$/,
        // Zárójelekkel (pl: +36 (30) 123 4567)
        /^\+[1-9]\d{1,3}[\s\-]?\([1-9]\d*\)[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{0,4}$/,
        // Amerikai formátum
        /^\+1[\s\-]?\([2-9]\d{2}\)[\s\-]?\d{3}[\s\-]?\d{4}$/,
        // Általános nemzetközi (ITU-T E.164)
        /^\+[1-9]\d{4,14}$/
      ];
      
      const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
      
      if (phone.trim().startsWith('+')) {
        return phoneRegexes.some(regex => regex.test(phone.trim()));
      }
      
      return /^06[1-9]\d{8}$/.test(cleanPhone) || /^[1-9]\d{8}$/.test(cleanPhone);
    };

    if (formData.preferredContact === "phone") {
      if (!formData.phone.trim()) {
        errors.push("Telefonos kapcsolatartás esetén telefonszám megadása kötelező");
      } else if (!validatePhoneNumber(formData.phone)) {
        errors.push("Érvénytelen telefonszám formátum. Nemzetközi: +[országkód] [szám] (pl: +36 30 123 4567, +1 555 123 4567)");
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validáció
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setStatus({ 
        submitting: false, 
        submitted: false, 
        error: validationErrors.join("\n") 
      });
      return;
    }
    
    setStatus({ submitting: true, submitted: false, error: null });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.errors?.join(", ") || "Hiba történt a küldés során"
        );
      }

      setStatus({ submitting: false, submitted: true, error: null });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        district: "",
        preferredContact: "email",
        newsletter: false,
      });
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: false,
        error:
          error instanceof Error ? error.message : "Ismeretlen hiba történt",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        {/* Premium User Status */}
        {session?.user && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-yellow-400" />
              <div>
                <h3 className="text-yellow-200 font-semibold">Prémium Felhasználó</h3>
                <p className="text-yellow-300/80 text-sm">
                  Adatai automatikusan kitöltve - {session.user.name || session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {status.submitted && (
          <AlertMessage type="success">
            Köszönjük megkeresését! Hamarosan felveszem Önnel a kapcsolatot.
          </AlertMessage>
        )}

        {status.error && (
          <AlertMessage type="error">{status.error}</AlertMessage>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Név*</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:border-transparent text-white transition-colors duration-300"
                style={{
                  '--focus-ring-color': themeColors.gradientFrom
                } as any}
                onFocus={(e) => {
                  e.target.style.borderColor = themeColors.gradientFrom;
                  e.target.style.boxShadow = `0 0 0 3px ${themeColors.gradientFrom}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Email cím*
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:border-transparent text-white transition-colors duration-300"
                style={{
                  '--focus-ring-color': themeColors.gradientFrom
                } as any}
                onFocus={(e) => {
                  e.target.style.borderColor = themeColors.gradientFrom;
                  e.target.style.boxShadow = `0 0 0 3px ${themeColors.gradientFrom}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Telefonszám
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:border-transparent text-white transition-colors duration-300"
                style={{
                  '--focus-ring-color': themeColors.gradientFrom
                } as any}
                onFocus={(e) => {
                  e.target.style.borderColor = themeColors.gradientFrom;
                  e.target.style.boxShadow = `0 0 0 3px ${themeColors.gradientFrom}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Kerület
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:border-transparent text-white transition-colors duration-300"
                style={{
                  '--focus-ring-color': themeColors.gradientFrom
                } as any}
                onFocus={(e) => {
                  e.target.style.borderColor = themeColors.gradientFrom;
                  e.target.style.boxShadow = `0 0 0 3px ${themeColors.gradientFrom}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Tárgy*</label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#8DEBD1] focus:border-transparent text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Üzenet*</label>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#8DEBD1] focus:border-transparent text-white"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-200">
                Preferált kapcsolattartás:
              </label>
              <select
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleChange}
                className="px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:border-transparent text-white transition-colors duration-300"
                style={{
                  '--focus-ring-color': themeColors.gradientFrom
                } as any}
                onFocus={(e) => {
                  e.target.style.borderColor = themeColors.gradientFrom;
                  e.target.style.boxShadow = `0 0 0 3px ${themeColors.gradientFrom}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              >
                <option value="email">Email</option>
                <option value="phone">Telefon</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="rounded bg-white/10 border-gray-600 focus:ring-2 transition-colors duration-300"
                style={{
                  accentColor: themeColors.gradientFrom,
                  '--focus-ring-color': themeColors.gradientFrom
                } as any}
              />
              <label className="text-sm text-gray-200">
                Szeretnék feliratkozni a hírlevélre
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={status.submitting}
            className="w-full px-6 py-3 font-medium rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center hover:scale-105"
            style={{
              background: themeColors.gradient,
              color: isDarkMode ? themeColors.text : '#111111',
              boxShadow: `0 8px 16px ${themeColors.gradientFrom}30`
            }}
          >
            {status.submitting ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Küldés...
              </>
            ) : (
              "Üzenet küldése"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
