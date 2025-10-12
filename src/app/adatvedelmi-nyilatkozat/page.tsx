"use client";

import { useThemeColors } from "@/context/ThemeContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdatvedelmiNyilatkozatPage() {
  const colors = useThemeColors();

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Vissza a főoldalra
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border" style={{ borderColor: colors.border }}>
          <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text }}>
            Adatvédelmi Nyilatkozat
          </h1>

          <div className="prose max-w-none" style={{ color: colors.text }}>
            <h2 className="text-xl font-semibold mb-4">1. Bevezetés</h2>
            <p className="mb-6">
              A Lovas Zoltán politikai oldala elkötelezett az Ön személyes adatainak védelme mellett. 
              Ez az adatvédelmi nyilatkozat leírja, hogyan gyűjtjük, használjuk és védelmezzük az Ön személyes adatait.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Gyűjtött adatok</h2>
            <p className="mb-4">A következő személyes adatokat gyűjthetjük:</p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>Név és elérhetőségi adatok (email cím)</li>
              <li>Hírlevél feliratkozási preferenciák</li>
              <li>Eseményekre való regisztrációs adatok</li>
              <li>Petíció aláírások és kapcsolódó adatok</li>
              <li>Kvízek és szavazások eredményei</li>
              <li>Weboldal használati adatok</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">3. Adatok felhasználása</h2>
            <p className="mb-4">Az Ön adatait a következő célokra használjuk:</p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>Hírlevél küldése a kiválasztott kategóriákban</li>
              <li>Eseményekkel kapcsolatos tájékoztatás</li>
              <li>Petíciók és szavazások kezelése</li>
              <li>Kapcsolatfelvétel és ügyfélszolgálat</li>
              <li>Jogi kötelezettségek teljesítése</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">4. GDPR jogok</h2>
            <p className="mb-4">Az GDPR alapján Önnek joga van:</p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li><strong>Hozzáférés:</strong> Információ kérése az Önről tárolt adatokról</li>
              <li><strong>Helyesbítés:</strong> Pontatlan adatok javíttatása</li>
              <li><strong>Törlés:</strong> Adatok törlésének kérése</li>
              <li><strong>Korlátozás:</strong> Adatkezelés korlátozásának kérése</li>
              <li><strong>Hordozhatóság:</strong> Adatok átvitelének kérése</li>
              <li><strong>Tiltakozás:</strong> Adatkezelés elleni tiltakozás</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">5. Hírlevél leiratkozás</h2>
            <p className="mb-6">
              Bármikor leiratkozhat hírlevelünkről a levelekben található leiratkozási link használatával, 
              vagy kategóriánként is módosíthatja feliratkozásait a profil oldalon.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Adatbiztonság</h2>
            <p className="mb-6">
              Megfelelő technikai és szervezési intézkedéseket alkalmazunk az Ön adatainak védelme érdekében. 
              Az adatok továbbítása titkosított kapcsolaton keresztül történik.
            </p>

            <h2 className="text-xl font-semibold mb-4">7. Sütik (Cookies)</h2>
            <p className="mb-6">
              Weboldalunk sütiket használ a felhasználói élmény javítása és a weboldal működésének biztosítása érdekében. 
              A sütik használatát bármikor letilthatja böngészőjében.
            </p>

            <h2 className="text-xl font-semibold mb-4">8. Kapcsolat</h2>
            <p className="mb-4">
              Ha kérdése van adatvédelmi gyakorlatunkkal kapcsolatban, vagy szeretné gyakorolni jogait, 
              kérjük, lépjen kapcsolatba velünk:
            </p>
            <p className="mb-6">
              <strong>Email:</strong> lovas.zoltan@mindenkimagyarorszaga.hu
            </p>

            <h2 className="text-xl font-semibold mb-4">9. Módosítások</h2>
            <p className="mb-6">
              Fenntartjuk a jogot, hogy ezt az adatvédelmi nyilatkozatot időről időre frissítsük. 
              A változásokról a weboldalon keresztül értesítjük Önt.
            </p>

            <p className="text-sm text-gray-600 mt-8">
              Utolsó frissítés: 2025. szeptember 28.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/kapcsolat"
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ background: colors.gradient }}
            >
              Kapcsolatfelvétel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}