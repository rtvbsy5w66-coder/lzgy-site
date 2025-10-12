"use client";

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Users, X, Crown } from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import { useSession } from "next-auth/react";
import Image from "next/image";

// export const metadata: Metadata = {
//   title: "Események | Lovas Zoltán György",
//   description: "Vegyen részt eseményeinken, találkozzunk személyesen!",
// };

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  imageUrl?: string;
  maxAttendees?: number;
  registrations?: Array<{ id: string }>;
  userRegistration?: { id: string; status: string } | null;
}

interface RegistrationModal {
  isOpen: boolean;
  eventId: string | null;
  eventTitle: string;
}

interface RegistrationForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  
  // Use theme colors from context
  const themeColors = useThemeColors('EVENTS');
  const isDarkMode = themeColors.mode === 'dark';
  
  const [modal, setModal] = useState<RegistrationModal>({
    isOpen: false,
    eventId: null,
    eventTitle: ""
  });
  
  const [form, setForm] = useState<RegistrationForm>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // AUTO-FILL: Modal megnyitásakor automatikus kitöltés
  useEffect(() => {
    if (modal.isOpen && session?.user) {
      setForm(prevForm => ({
        ...prevForm,
        name: session.user.name || prevForm.name,
        email: session.user.email || prevForm.email,
        phone: (session.user as any).phoneNumber || prevForm.phone,
      }));
    }
  }, [modal.isOpen, session]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events?upcoming=true");
        const eventsData = await response.json();
        
        // Handle API response structure
        if (eventsData.data && Array.isArray(eventsData.data)) {
          setEvents(eventsData.data);
        } else if (Array.isArray(eventsData)) {
          setEvents(eventsData);
        } else {
          console.error("Invalid events data structure:", eventsData);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error loading events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]); // Re-load when session changes

  const openRegistrationModal = (eventId: string, eventTitle: string) => {
    setModal({ isOpen: true, eventId, eventTitle });
    setForm({ name: "", email: "", phone: "", message: "" });
    setSubmitMessage(null);
  };

  const closeRegistrationModal = () => {
    setModal({ isOpen: false, eventId: null, eventTitle: "" });
    setForm({ name: "", email: "", phone: "", message: "" });
    setSubmitMessage(null);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.eventId) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch(`/api/events/${modal.eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({ type: 'success', text: data.message });
        
        // Update event registration status locally
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === modal.eventId 
              ? { ...event, userRegistration: { id: data.registrationId || 'temp', status: 'CONFIRMED' } }
              : event
          )
        );
        
        setTimeout(() => {
          closeRegistrationModal();
        }, 2000);
      } else {
        setSubmitMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Hiba történt a jelentkezés során. Kérjük, próbálja újra.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="animate-spin rounded-full h-32 w-32 border-b-2 transition-colors duration-300"
          style={{ borderColor: themeColors.gradientFrom }}
        ></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -mx-4 -mt-24 md:-mt-28">
      {/* Hero Section - Theme Integrated */}
      <div 
        className="relative pt-24 md:pt-28 transition-colors duration-300"
        style={{
          background: themeColors.gradient
        }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 transition-colors duration-300"
              style={{ color: themeColors.accent }}
            >
              Események
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto transition-colors duration-300"
              style={{ color: `${themeColors.accent}dd` }}
            >
              Találkozzunk személyesen! Vegyen részt eseményeinken és építsük együtt a jövőt.
            </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300"
                style={{ background: themeColors.gradient }}
              >
                <Calendar 
                  className="h-10 w-10 transition-colors duration-300" 
                  style={{ color: themeColors.accent }}
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Hamarosan érkeznek új események
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Jelenleg nincsenek meghirdetett események, de kövessen minket a legfrissebb hírekért!
              </p>
            </div>
          ) : (
            <div className="grid gap-8">
              {events.map((event: Event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
                  style={{
                    '--hover-shadow': `0 25px 50px -12px ${themeColors.gradientFrom}25`
                  } as any}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 25px 50px -12px ${themeColors.gradientFrom}25`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* Event Image */}
                  {event.imageUrl && (
                    <div className="relative w-full h-64 overflow-hidden rounded-t-2xl">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  <div className="p-6 md:p-8">
                    {/* Header with title and status badge */}
                    <div className="flex flex-wrap items-start gap-3 mb-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex-1 min-w-[200px]">
                        {event.title}
                      </h2>
                      <span
                        className="px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 whitespace-nowrap"
                        style={{
                          backgroundColor: event.status === "UPCOMING"
                            ? `${themeColors.gradientFrom}20`
                            : `${themeColors.gradientTo}20`,
                          color: event.status === "UPCOMING"
                            ? themeColors.gradientFrom
                            : themeColors.gradientTo,
                          border: `1px solid ${event.status === "UPCOMING" ? themeColors.gradientFrom : themeColors.gradientTo}40`
                        }}
                      >
                        {event.status === "UPCOMING" ? "Közelgő" : "Folyamatban"}
                      </span>
                    </div>

                    {/* Event Details - moved before description */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                          style={{ backgroundColor: `${themeColors.gradientFrom}15` }}
                        >
                          <Calendar
                            className="h-6 w-6 transition-colors duration-300"
                            style={{ color: themeColors.gradientFrom }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Időpont
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white text-base mb-0.5">
                            {new Date(event.startDate).toLocaleDateString("hu-HU", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(event.startDate).toLocaleTimeString("hu-HU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                          style={{ backgroundColor: `${themeColors.gradientTo}15` }}
                        >
                          <MapPin
                            className="h-6 w-6 transition-colors duration-300"
                            style={{ color: themeColors.gradientTo }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Helyszín
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white text-base break-words">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div
                          className="text-gray-700 dark:text-gray-300 text-base leading-relaxed prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: event.description }}
                        />
                      </div>
                      
                      {/* Registration Button */}
                      {(event.status === "UPCOMING" || event.status === "ONGOING") && (
                        <div className="lg:w-48 lg:flex-shrink-0 lg:mt-0 mt-4">
                          {event.userRegistration && event.userRegistration.status === 'CONFIRMED' ? (
                            // Already registered
                            <div className="w-full px-6 py-3.5 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-700">
                              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Jelentkezve
                            </div>
                          ) : event.userRegistration && event.userRegistration.status === 'CANCELLED' ? (
                            // Previously cancelled, can re-register
                            <button
                              onClick={() => openRegistrationModal(event.id, event.title)}
                              className="w-full px-6 py-3.5 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-2 border-yellow-300 dark:border-yellow-700 hover:border-yellow-400"
                            >
                              <Users className="h-5 w-5 flex-shrink-0" />
                              Újra jelentkezés
                            </button>
                          ) : (
                            // Not registered yet
                            <button
                              onClick={() => openRegistrationModal(event.id, event.title)}
                              className="w-full px-6 py-3.5 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                              style={{
                                background: themeColors.gradient,
                                color: themeColors.accent,
                                boxShadow: `0 4px 12px ${themeColors.gradientFrom}25`
                              }}
                            >
                              <Users className="h-5 w-5 flex-shrink-0" />
                              Jelentkezés
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jelentkezési Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Esemény jelentkezés
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {modal.eventTitle}
                </p>
              </div>
              <button
                onClick={closeRegistrationModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full hover:scale-110 active:scale-95"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Premium User Status */}
            {session?.user && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div>
                    <h4 className="text-yellow-200 font-semibold">Prémium Felhasználó</h4>
                    <p className="text-yellow-300/80 text-sm">
                      Adatai automatikusan kitöltve - {session.user.name || session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitRegistration} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Teljes név *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
                  placeholder="Írja be a teljes nevét"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email cím *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
                  placeholder="pelda@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Telefonszám
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
                  placeholder="+36 30 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Üzenet (opcionális)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
                  rows={4}
                  placeholder="Egyéb kérdések vagy megjegyzések..."
                />
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-xl border ${
                  submitMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {submitMessage.type === 'success' ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="font-medium">{submitMessage.text}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeRegistrationModal}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium hover:scale-105 active:scale-95"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 hover:scale-105"
                  style={{
                    background: themeColors.gradient,
                    color: themeColors.accent,
                    boxShadow: `0 8px 16px ${themeColors.gradientFrom}20`
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div 
                        className="animate-spin rounded-full h-4 w-4 border-b-2"
                        style={{ borderColor: themeColors.accent }}
                      ></div>
                      Küldés...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      Jelentkezés
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
