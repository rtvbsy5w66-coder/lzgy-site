"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Calendar, Users, X } from "lucide-react";

interface Registration {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  _count?: {
    registrations: number;
  };
}

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      // API returns array directly or wrapped in data object
      setEvents(Array.isArray(data) ? data : (data.data || data.events || []));
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRegistrations = async (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrations(true);
    setLoadingRegistrations(true);

    try {
      const response = await fetch(`/api/events/${event.id}/registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt az eseményt?")) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Hiba történt a törlés során");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Események</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Kampány események szervezése és kezelése</p>
          </div>
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Új esemény
          </Link>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Még nincsenek események</p>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              <Plus className="w-5 h-5" />
              Első esemény létrehozása
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Esemény
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dátum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Helyszín
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Állapot
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Résztvevők
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(event.startDate).toLocaleDateString("hu-HU")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {event.location || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.status === "UPCOMING"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            : event.status === "ONGOING"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : event.status === "COMPLETED"
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {event.status === "UPCOMING"
                          ? "Közelgő"
                          : event.status === "ONGOING"
                          ? "Folyamatban"
                          : event.status === "COMPLETED"
                          ? "Befejezett"
                          : "Törölve"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewRegistrations(event)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium"
                        title="Résztvevők megtekintése"
                      >
                        <Users className="w-4 h-4" />
                        <span>{event._count?.registrations || 0}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          title="Szerkesztés"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Törlés"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Registrations Modal */}
        {showRegistrations && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Résztvevők listája
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedEvent.title}</p>
                </div>
                <button
                  onClick={() => setShowRegistrations(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                {loadingRegistrations ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Még nincs jelentkező erre az eseményre</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <div
                        key={registration.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                {registration.name}
                              </h4>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  registration.status === "CONFIRMED"
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                    : registration.status === "CANCELLED"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                }`}
                              >
                                {registration.status === "CONFIRMED"
                                  ? "Megerősített"
                                  : registration.status === "CANCELLED"
                                  ? "Lemondva"
                                  : "Függőben"}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Email:</span>
                                <a href={`mailto:${registration.email}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                                  {registration.email}
                                </a>
                              </p>
                              {registration.phone && (
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">Telefon:</span>
                                  <a href={`tel:${registration.phone}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                                    {registration.phone}
                                  </a>
                                </p>
                              )}
                              {registration.message && (
                                <p className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <span className="font-medium">Üzenet:</span>
                                  <span className="block mt-1 text-gray-700 dark:text-gray-300">{registration.message}</span>
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Jelentkezés: {new Date(registration.createdAt).toLocaleString("hu-HU")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Összesen: <span className="font-semibold">{registrations.length}</span> jelentkező
                </p>
                <button
                  onClick={() => setShowRegistrations(false)}
                  className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
