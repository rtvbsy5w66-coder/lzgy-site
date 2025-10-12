"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  imageUrl?: string;
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("EventsSection: Fetching events from /api/events");
        const response = await fetch("/api/events");
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const apiResponse = await response.json();
        console.log("EventsSection: Received API response:", apiResponse);
        
        // Extract data from new API format
        const data = apiResponse.success ? apiResponse.data : apiResponse;
        
        // FILTERING and SORTING
        const filteredEvents = data
          .filter((event: Event) => 
            ["UPCOMING", "ONGOING"].includes(event.status)
          )
          .sort((a: Event, b: Event) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
          .slice(0, 3); // Max 3 events on homepage

        setEvents(filteredEvents);
      } catch (error) {
        console.error("EventsSection: Error fetching events:", error);
        setError("Hiba az események betöltése közben");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Közelgő Események
          </h2>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Közelgő Események
          </h2>
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Közelgő Események
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Jelenleg nincsenek közelgő események.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        event.status === "UPCOMING"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {event.status === "UPCOMING" ? "Közelgő" : "Folyamatban"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                        <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>
                        {new Date(event.startDate).toLocaleDateString("hu-HU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 mr-3">
                        <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/esemenyek"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/20 transform hover:translate-y-[-2px] transition-all duration-300"
              >
                Minden Esemény
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventsSection;