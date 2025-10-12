"use client";

import React, { useEffect, useState } from "react";
import HeroSlider from "@/components/slider/HeroSlider";
import HirekSzekcio from "@/components/HirekSzekcio";
import PartnersSection from "@/components/layout/PartnersSection";
import { Slide } from "@prisma/client";
import { CalendarDays, MapPin, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useThemeColors } from "@/context/ThemeContext";

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

interface ClientPageProps {
  slides: Slide[];
}

export default function ClientPage({ slides }: ClientPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  
  // Use global theme colors
  const themeColors = useThemeColors();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // console.log("ClientPage: Fetching events from /api/events");
        const response = await fetch("/api/events");
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        // console.log("ClientPage: Received events data:", data);
        
        // Handle API response structure
        const eventsArray = data.data ? data.data : (Array.isArray(data) ? data : []);
        
        // Filter and sort events
        const filteredEvents = eventsArray
          .filter((event: Event) => 
            ["UPCOMING", "ONGOING"].includes(event.status)
          )
          .sort((a: Event, b: Event) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
          .slice(0, 3); // Max 3 events on homepage

        // console.log("ClientPage: Filtered events:", filteredEvents);
        setEvents(filteredEvents);
      } catch (error) {
        console.error("ClientPage: Error fetching events:", error);
        setEventsError("Hiba az események betöltése közben");
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div 
      className="min-h-screen transition-colors duration-300" 
      style={{ backgroundColor: themeColors.bg, color: themeColors.text }}
    >
      {/* 1. Slider (marad változtatás nélkül) */}
      <HeroSlider slides={slides} />

      {/* 2. 6 kártya (responsive grid: 1 oszlop mobilon, 2 oszlop tableten, 3 oszlop desktopон) */}
      <div
        className="w-full max-w-full mx-0 px-4 py-16 transition-all duration-300"
        style={{
          background: `linear-gradient(to bottom, ${themeColors.bg} 0%, ${themeColors.cardBg} 50%, ${themeColors.bg} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Programom",
              description: "Ismerje meg részletes politikai programomat és terveimet az ország fejlesztésére.",
              href: "/program",
              buttonText: "Részletek",
              gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)"
            },
            {
              title: "Események", 
              description: "Csatlakozzon hozzánk a következő rendezvényeken és mondja el véleményét személyesen.",
              href: "/esemenyek",
              buttonText: "Események",
              gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)"
            },
            {
              title: "Kapcsolat",
              description: "Vegye fel velem a kapcsolatot kérdéseivel, javaslataival. Minden vélemény számít!",
              href: "/kapcsolat", 
              buttonText: "Kapcsolat",
              gradient: "linear-gradient(135deg, #6366f1, #4338ca)"
            },
            {
              title: "Kvízek",
              description: "Tesztelje tudását és ismerje meg álláspontomat fontos kérdésekben interaktív kvízeken keresztül.",
              href: "/kviz",
              buttonText: "Kvízek",
              gradient: "linear-gradient(135deg, #22c55e, #16a34a)"
            },
            {
              title: "Petíciók",
              description: "Támogassa közös ügyeinket! Írja alá petícióinkat és vegye ki részét a változásból.",
              href: "/peticiok",
              buttonText: "Petíciók", 
              gradient: "linear-gradient(135deg, #ef4444, #dc2626)"
            },
            {
              title: "Szavazások",
              description: "Mondja el véleményét fontos társadalmi kérdésekben. Az Ön szava számít a döntéshozatalban!",
              href: "/szavazasok",
              buttonText: "Szavazások",
              gradient: "linear-gradient(135deg, #f97316, #ea580c)"
            }
          ].map((card, index) => (
            <Link
              href={card.href}
              key={index}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[0]}15 0%, ${card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[1]}25 100%)`,
                borderTopColor: card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[0],
                boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px ${card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[0]}20`
              }}
            >
              {/* Header Section with Icon */}
              <div 
                className="relative h-40 flex items-center justify-center"
                style={{
                  background: card.gradient,
                }}
              >
                {/* Decorative Pattern */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, ${card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[0]} 2px, transparent 2px), 
                                     radial-gradient(circle at 75% 75%, ${card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[0]} 1px, transparent 1px)`,
                    backgroundSize: '30px 30px, 20px 20px'
                  }}
                />
                
                {/* Title Icon */}
                <div className="relative z-10 text-center">
                  <div 
                    className="w-16 h-16 rounded-full mb-3 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                  >
                    {card.title.charAt(0)}
                  </div>
                  <h2 
                    className="text-lg font-bold text-white"
                  >
                    {card.title}
                  </h2>
                </div>
                
                {/* Subtle overlay for depth */}
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{
                    background: `linear-gradient(45deg, transparent 30%, ${card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[0]} 50%, transparent 70%)`
                  }}
                />
              </div>
              
              {/* Content Section */}
              <div className="p-6">
                <p 
                  className="text-sm leading-relaxed opacity-85 mb-4 line-clamp-3"
                  style={{ color: themeColors.text }}
                >
                  {card.description}
                </p>
                
                {/* Read More Indicator */}
                <div className="mt-4 pt-3 border-t border-opacity-20" style={{ borderColor: card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[0] }}>
                  <div 
                    className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform"
                    style={{ color: card.gradient.match(/#[a-fA-F0-9]{6}/g)?.[0] }}
                  >
                    <span>{card.buttonText}</span>
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </div>

      {/* 3. Legfrissebb Hírek */}
      <div className="w-full max-w-full mx-0 mt-12">
        <HirekSzekcio />
      </div>

      {/* 4. Partnereink - teljes szélességben */}
      <div className="w-full max-w-full mx-0 mt-12">
        <PartnersSection />
      </div>

      {/* 5. Közelgő Események */}
      <div className="w-full max-w-full mx-0 mt-12">
        <div 
          className="py-16 transition-colors duration-300"
          style={{ 
            background: `linear-gradient(to bottom, ${themeColors.cardBg}, ${themeColors.bg})` 
          }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <h2
              className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent"
              style={{
                backgroundImage: themeColors.gradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}
            >
              Közelgő Események
            </h2>

          {eventsLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : eventsError ? (
            <div className="text-center text-red-600">{eventsError}</div>
          ) : events.length === 0 ? (
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
                    className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                    style={{
                      backgroundColor: themeColors.cardBg,
                      color: themeColors.text,
                      borderColor: themeColors.border
                    }}
                  >
                    {/* Event Image */}
                    {event.imageUrl ? (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={event.imageUrl}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Status Badge Overlay */}
                        <div className="absolute top-3 right-3">
                          <span
                            className="px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm"
                            style={{
                              backgroundColor: event.status === "UPCOMING" ? `${themeColors.gradientFrom}dd` : `${themeColors.gradientTo}dd`,
                              color: themeColors.accent,
                              border: `1px solid ${themeColors.accent}40`
                            }}
                          >
                            {event.status === "UPCOMING" ? "Közelgő" : "Folyamatban"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Gradient Background for Image-less Cards */
                      <div
                        className="relative h-48 overflow-hidden flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.gradientFrom}30 0%, ${themeColors.gradientTo}30 100%)`,
                        }}
                      >
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span
                            className="px-3 py-1 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: event.status === "UPCOMING" ? `${themeColors.gradientFrom}20` : `${themeColors.gradientTo}20`,
                              color: event.status === "UPCOMING" ? themeColors.gradientFrom : themeColors.gradientTo,
                              border: `1px solid ${event.status === "UPCOMING" ? themeColors.gradientFrom : themeColors.gradientTo}40`
                            }}
                          >
                            {event.status === "UPCOMING" ? "Közelgő" : "Folyamatban"}
                          </span>
                        </div>

                        {/* Decorative Icon */}
                        <CalendarDays
                          className="w-20 h-20 opacity-20"
                          style={{ color: themeColors.gradientFrom }}
                        />
                      </div>
                    )}

                    <div className="p-6">
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
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/esemenyek"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full hover:shadow-lg transform hover:translate-y-[-2px] transition-all duration-300 hover:scale-105"
                  style={{
                    background: themeColors.gradient,
                    color: themeColors.accent
                  }}
                >
                  Minden Esemény
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
