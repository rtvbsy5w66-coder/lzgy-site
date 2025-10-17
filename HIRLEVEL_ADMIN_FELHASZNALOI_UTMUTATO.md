# Hírlevél Admin Felület - Felhasználói Útmutató

## Tartalomjegyzék
1. [Áttekintés](#áttekintés)
2. [Hozzáférés](#hozzáférés)
3. [Főoldal Dashboard](#főoldal-dashboard)
4. [Feliratkozók Kezelése](#feliratkozók-kezelése)
5. [Kampányok Kezelése](#kampányok-kezelése)
6. [Új Kampány Létrehozása](#új-kampány-létrehozása)
7. [Statisztikák](#statisztikák)
8. [Tippek és Legjobb Gyakorlatok](#tippek-és-legjobb-gyakorlatok)

---

## Áttekintés

A hírlevél admin felület egy komplett megoldás a hírlevél kampányok kezelésére, amely lehetővé teszi:
- 📧 Gyors hírlevél küldést
- 👥 Feliratkozók kezelését és szűrését
- 📊 Kampányok létrehozását, ütemezését és nyomon követését
- 📈 Teljesítmény statisztikák megtekintését
- 📥 CSV export funkcionalitást

## Hozzáférés

### Bejelentkezés
1. Navigálj a `http://localhost:3000/admin/login` címre
2. Jelentkezz be admin fiókkal (ADMIN szerepkörrel rendelkező felhasználó)
3. A sikeres bejelentkezés után elérhető lesz a hírlevél menü

### Navigáció
- **Fő Dashboard**: `/admin/dashboard` → kattints a "Hírlevél" kártyára
- **Közvetlen link**: `/admin/newsletter`

---

## Főoldal Dashboard

**Elérés**: `/admin/newsletter`

### Funkciók

#### 1. Gyors Küldés
- **Gyors Hírlevél Küldése** gomb → form megjelenítése
- **Mezők**:
  - **Tárgy**: Az email tárgysora
  - **Tartalom**: HTML vagy egyszerű szöveg
  - **Teszt Email**: Opcionális, először ide küldi ki tesztelésre
- **Küldés**:
  - Ha van teszt email → csak oda küldi
  - Ha nincs teszt email → minden aktív feliratkozónak

#### 2. Statisztikák (4 fő mutató)
- **Összes Feliratkozó**: Teljes feliratkozói szám
- **Aktív Feliratkozók**: Jelenleg aktív feliratkozók
- **Elküldött Kampányok**: Sikeresen kiküldött kampányok száma
- **Átlag Megnyitás**: Kampányok átlagos megnyitási aránya

#### 3. Legutóbbi Kampányok
- Az utolsó 5 kampány listája
- **Információk**: Név, státusz, címzettek száma, küldési idő
- **Műveletek**:
  - Megtekintés (szem ikon)
  - Törlés (kuka ikon)

#### 4. Gyors Linkek
- **Új Kampány**: Kampány létrehozó oldal
- **Feliratkozók**: Összes feliratkozó listája
- **Összes Kampány**: Teljes kampány lista szűrőkkel
- **Statisztikák**: Részletes analytics dashboard

---

## Feliratkozók Kezelése

**Elérés**: `/admin/newsletter/subscribers`

### Funkciók

#### 1. Szűrők
**Keresés**
- Email vagy név alapján szűrés
- Valós idejű keresés (minden billentyűleütésnél frissül)

**Státusz szűrő**
- Összes
- Aktív
- Inaktív

**Kategória szűrő**
- Összes kategória
- Kategóriák listája (pl. ÁLTALÁNOS, ESEMÉNYEK, HÍREK)

#### 2. Feliratkozók Táblázat
**Oszlopok**:
- **Feliratkozó**: Név, email, kerület
- **Kategóriák**: Érdeklődési területek (badge-ek)
- **Feliratkozás**: Dátum naptár ikonnal
- **Forrás**: Honnan származik (contact_form, newsletter_form, stb.)
- **Státusz**: Aktív (zöld pipa) / Inaktív (piros X)
- **Műveletek**: Aktiválás/Letiltás gomb

#### 3. CSV Export
- **Gomb**: Zöld "CSV Exportálás" gomb
- **Tartalom**: Email, Név, Kerület, Telefon, Feliratkozás dátuma, Aktív státusz, Kategóriák
- **Fájlnév**: `feliratkozok_YYYY-MM-DD.csv`
- **Szűrés**: Csak a jelenleg szűrt feliratkozók kerülnek exportálásra

#### 4. Státusz Módosítás
- **Kattintás**: "Letiltás" vagy "Aktiválás" gombra
- **Hatás**:
  - Letiltás → Feliratkozó nem kap több emailt
  - Aktiválás → Feliratkozó ismét kap emaileket
- **Adatbázis**: Frissíti az `isActive` mezőt

---

## Kampányok Kezelése

**Elérés**: `/admin/newsletter/campaigns`

### Funkciók

#### 1. Státusz Szűrők
6 gyors szűrő gomb:
- **Összes**: Minden kampány
- **Elküldve**: Sikeresen elküldött kampányok
- **Ütemezett**: Jövőbeli küldésre ütemezett
- **Küldés alatt**: Jelenleg küldés folyamatban
- **Vázlat**: Még nem küldött draft kampányok
- **Sikertelen**: Hibával leállt kampányok

#### 2. Kampány Kártyák
Minden kampány külön kártyában jelenik meg:

**Fej rész**:
- **Név/Tárgy**: Kampány címe
- **Státusz Badge**: Színkódolt badge (pl. zöld = elküldve)
- **Ismétlődő Badge**: Ha recurring kampány (heti/havi)

**Információk**:
- **Tárgy**: Az email tárgysora
- **Ütemezve**: Dátum és idő (ha scheduled)
- **Elküldve**: Mikor lett kiküldve (ha sent)
- **Címzettek**: Hány főnek lett kiküldve
- **Létrehozva**: Kampány létrehozási dátuma
- **Következő**: Következő küldési időpont (recurring esetén)

**Műveletek**:
- **Megtekintés** (szem ikon): Kampány részletes nézete
- **Törlés** (kuka ikon): Kampány törlése (megerősítés kéréssel)

#### 3. Új Kampány Gomb
- Jobb felső sarokban zöld "Új Kampány" gomb
- Navigál a `/admin/newsletter/campaigns/new` oldalra

---

## Új Kampány Létrehozása

**Elérés**: `/admin/newsletter/campaigns/new`

### Lépések

#### 1. Alapadatok
**Kampány Neve**
- Belső azonosító (nem látják a címzettek)
- Példa: "2024 Októberi Hírlevél"

**Email Tárgy**
- Az email tárgysora (ezt látják a címzettek)
- Példa: "Legfrissebb hírek októberről"

#### 2. Küldési Típus
3 opció választható:

**Azonnali Küldés**
- Azonnal kiküldi mentés után
- Nincs további beállítás

**Ütemezett Küldés**
- **Dátum választó** jelenik meg
- Válassz dátumot és időt
- Pontosan akkor küldi ki a rendszer

**Ismétlődő Küldés**
- **Gyakoriság választó**:
  - Heti
  - Kétheti
  - Havi
- **Első küldés dátuma**: Mikor kezdődjön
- Automatikusan újraküldi a megadott gyakorisággal

#### 3. Címzettek
2 opció:

**Minden aktív feliratkozó**
- Minden `isActive = true` feliratkozó
- Mindkét tábla: `Contact` és `NewsletterSubscription`

**Teszt küldés**
- **Teszt Email** mező jelenik meg
- Csak a megadott email címre megy
- Tesztelésre ideális

#### 4. Email Tartalom

**HTML Szerkesztő**
- Nagy szövegmező HTML tartalom írásához
- Támogatja a HTML tageket

**Sablon Gombok**
3 előre elkészített sablon:
- **Üdvözlés Sablon**: Általános üdvözlő szöveg
- **Esemény Sablon**: Esemény meghirdetés struktúra
- **Hír Sablon**: Hírek felsorolása

**Sablon használat**:
1. Kattints a sablon gombra
2. A sablon HTML kódja beillesztésre kerül
3. Szerkeszd a tartalmat saját igény szerint

**Előnézet**
- Kék "Előnézet Megjelenítése" gomb
- Megjeleníti a HTML renderelt formáját
- Zárd be a "Bezárás" gombbal

#### 5. Létrehozás
- Zöld "Kampány Létrehozása" gomb
- **Validáció**: Ellenőrzi, hogy minden kötelező mező ki van-e töltve
- **Sikeres mentés**: Visszairányít a kampányok listájához
- **Hiba esetén**: Hibaüzenet jelenik meg

---

## Kampány Részletes Nézet

**Elérés**: `/admin/newsletter/campaigns/[id]`

### Szekciók

#### 1. Kampány Információk
- **Státusz**: Színkódolt badge
- **Létrehozva**: Dátum és létrehozó felhasználó
- **Ütemezve / Elküldve**: Időpont(ok)
- **Címzettek Típusa**: All / Test
- **Ismétlődő**: Ha recurring, gyakoriság és következő küldés

#### 2. Email Tartalom
- **Tárgy**: Az email tárgysora
- **Tartalom**: Teljes HTML tartalom renderelt formában
- Így látják a címzettek

#### 3. Teljesítmény Metrikák
(Ha már elküldésre került)

**Kártyák**:
- **Megnyitási Arány**: Hány % nyitotta meg
  - Zöld: >30%
  - Narancs: 20-30%
  - Piros: <20%
- **Kattintási Arány**: Hány % kattintott linkre
  - Zöld: >5%
  - Narancs: 2-5%
  - Piros: <2%
- **Leiratkozások**: Hány fő iratkozott le
- **Elküldött**: Összes kiküldött email

#### 4. Műveletek
- **Vissza gomb**: Vissza a kampányok listájához
- **Törlés gomb**: Kampány törlése (ha szükséges)

---

## Statisztikák

**Elérés**: `/admin/newsletter/stats`

### Dashboard Elemek

#### 1. Fő Statisztika Kártyák (5 db)

**Összes Feliratkozó**
- Teljes feliratkozói szám
- Aktív feliratkozók száma
- Trend: +12% (példa)

**Elküldött Kampányok**
- Sikeresen kiküldött kampányok
- Összes kampány száma
- Trend: +8%

**Összes Email**
- Kiküldött emailek összesen
- Formázott szám (pl. 1,234)
- Trend: +15%

**Átlag Megnyitás**
- Átlagos megnyitási arány %
- Iparági benchmark: ~20-30%
- Trend: +2.3%

**Átlag Kattintás**
- Átlagos kattintási arány %
- Iparági benchmark: ~2-5%
- Trend: +1.8%

#### 2. Teljesítmény Áttekintés

**Legutóbbi Aktivitás**
- Legutóbbi kampányok teljesítménye
- **Dátum szerint csoportosítva**
- **Mutatók**:
  - Elküldött emailek száma
  - Megnyitási arány %
  - Kattintási arány %

**Üres állapot**
- Ha még nincs adat: "Még nincsenek statisztikák"
- Grafikonos placeholder

#### 3. Insight Kártyák

**Megnyitási Arány Kártya**
- Nagy szám a központban
- **Értékelés**:
  - \>30%: "Kiváló eredmény! 📈"
  - 20-30%: "Jó eredmény, de lehet javítani 👍"
  - <20%: "Próbálj jobb tárgysorokat használni 💡"

**Kattintási Arány Kártya**
- Nagy szám a központban
- **Értékelés**:
  - \>5%: "Nagyszerű engagement! 🎉"
  - 2-5%: "Átlagos eredmény 📊"
  - <2%: "Adj hozzá több call-to-action gombot! 🔘"

#### 4. Tippek Szekció
6 fontos tipp a jobb eredményekhez:
1. Személyre szabott tárgysorok
2. Rövid, lényegre törő tartalom
3. Egyértelmű CTA gombok
4. Mobile-friendly design
5. Optimális küldési időpont (kedd-csütörtök, 10:00-14:00)
6. A/B tesztelés

---

## Tippek és Legjobb Gyakorlatok

### Kampány Tervezés

#### 1. Tárgysor Optimalizálás
✅ **JÓ példák**:
- "Kedves János! 3 új esemény vár rád"
- "Októberi hírlevelünk: 5 fontos frissítés"
- "Új lehetőség: Ingyenes konzultáció"

❌ **ROSSZ példák**:
- "Newsletter #47" (unalmas, generikus)
- "KLIKKELJ IDE MOST!!!" (spam-szerű)
- Túl hosszú tárgysorok (>60 karakter)

#### 2. Email Tartalom
**Struktúra**:
1. **Fejléc**: Üdvözlés, személyre szabás
2. **Fő tartalom**: 2-3 fő üzenet
3. **Call-to-Action**: Egyértelmű gombok
4. **Lábléc**: Kapcsolat, leiratkozás

**Design**:
- Maximum 600px szélesség
- Reszponzív layout
- Képek ALT szöveggel
- Kontrasztos színek

#### 3. Küldési Idő
**Legjobb időpontok**:
- **Hétfő**: KERÜLENDŐ (sok email érkezik)
- **Kedd-Csütörtök**: ✅ LEGJOBB
- **Péntek délután**: Kevesebb megnyitás
- **Hétvége**: Csak ha célzott

**Időpont**:
- **10:00-11:00**: Reggeli munka kezdés
- **13:00-14:00**: Ebédszünet
- **19:00-20:00**: Esti pihenés

#### 4. Tesztelés
**Teszt Checklist**:
- [ ] Teszt email küldése
- [ ] Desktop megjelenés ellenőrzése
- [ ] Mobil megjelenés ellenőrzése
- [ ] Linkek működése
- [ ] Képek betöltődése
- [ ] Leiratkozás link működik

#### 5. Gyakoriság
**Ajánlott**:
- **Általános hírlevél**: Havi 1-2x
- **Esemény értesítők**: Szükség szerint
- **Fontos hírek**: Ad-hoc

❌ **KERÜLENDŐ**:
- Napi küldés (túl gyakori)
- Hónapok szünet (feledésbe merül)

### Feliratkozók Kezelése

#### 1. Adatbázis Higiénia
- **Rendszeres tisztítás**: Töröld az inaktív emaileket (6 hónap inaktivitás után)
- **Bounce kezelés**: Távolítsd el a visszapattanó címeket
- **Duplikátumok**: Ellenőrizd az azonos email címeket

#### 2. Kategorizálás
- **Érdeklődési területek**: Segít célzott kampányokban
- **Szegmentálás**: Különböző üzeneteket különböző csoportoknak
- **Preferenciák**: Hagyj lehetőséget a feliratkozóknak beállítani

#### 3. GDPR Megfelelés
- ✅ **Explicit beleegyezés**: Csak akkor küldj, ha feliratkoztak
- ✅ **Leiratkozás lehetősége**: Minden emailben legyen link
- ✅ **Adatkezelési tájékoztató**: Legyen elérhető
- ✅ **Adattörlési kérelem**: Gyorsan válaszolj

### Teljesítmény Javítás

#### 1. A/B Tesztelés
**Mit tesztelj**:
- Különböző tárgysorok (2 verzió)
- CTA gomb színe/szövege
- Email hossz (rövid vs. részletes)
- Küldési időpont

**Hogyan**:
1. Válassz 10% feliratkozót
2. Küldd ki mindkét verziót (5-5%)
3. Várd meg az eredményt (2-4 óra)
4. A jobb verzió megy a maradék 90%-nak

#### 2. Analytics Követés
**Fontos metrikák**:
- **Open Rate**: 20-30% jó
- **Click Rate**: 2-5% jó
- **Unsubscribe Rate**: <0.5% jó
- **Bounce Rate**: <2% jó

**Javítási lépések alacsony Open Rate esetén**:
1. Jobb tárgysorok
2. Küldési idő optimalizálása
3. From név személyre szabása

**Javítási lépések alacsony Click Rate esetén**:
1. Több CTA gomb
2. Relevánsabb tartalom
3. Vizuális elemek hozzáadása

#### 3. Re-engagement Kampányok
**Inaktív feliratkozóknak**:
- "Hiányzol!" kampány
- Exkluzív ajánlat
- Preferencia frissítés lehetősége
- Utolsó esély: Leiratkozás vagy maradás

---

## Gyakori Hibák és Megoldások

### Hiba 1: "Nincs feliratkozó"
**Ok**: Még nem iratkoztak fel senki
**Megoldás**:
- Teszteléshez adj hozzá teszt feliratkozókat
- Népszerűsítsd a hírlevél feliratkozást a főoldalon

### Hiba 2: "Email nem megy ki"
**Ok**: Konfigurációs hiba (Resend API / SMTP)
**Megoldás**:
- Ellenőrizd a `.env` fájlt
- Nézd meg a szerverlogokat
- Próbálj teszt emailt küldeni

### Hiba 3: "Megnyitási arány 0%"
**Ok**: Tracking nem működik vagy túl friss kampány
**Megoldás**:
- Várj 24 órát az adatok gyűjtésére
- Ellenőrizd a tracking pixel beállításokat

### Hiba 4: "Túl sok leiratkozás"
**Ok**: Rossz célzás vagy túl gyakori küldés
**Megoldás**:
- Csökkentsd a küldési gyakoriságot
- Szegmentáld a célközönséget
- Javítsd a tartalom minőségét

---

## API Végpontok (fejlesztőknek)

A frontend a következő backend API-kat használja:

### Kampányok
- `GET /api/admin/newsletter/campaigns` - Lista
- `POST /api/admin/newsletter/campaigns` - Létrehozás
- `GET /api/admin/newsletter/campaigns/[id]` - Részletek
- `DELETE /api/admin/newsletter/campaigns/[id]` - Törlés

### Feliratkozók
- `GET /api/admin/newsletter/subscribers` - Lista
- `PATCH /api/admin/newsletter/subscribers/[id]` - Státusz módosítás
- `DELETE /api/admin/newsletter/subscribers/[id]` - Törlés (inaktívvá teszi)

### Küldés
- `POST /api/admin/newsletter/send` - Azonnali küldés

### Statisztikák
- `GET /api/admin/newsletter/stats` - Aggregált statisztikák

---

## Támogatás

Ha bármilyen kérdésed van vagy hibát találsz, keresd fel:
- **Fejlesztői dokumentáció**: `HIRLEVEL_RENDSZER_ELEMZES.md`
- **GitHub Issues**: Jelentsd be a hibákat
- **Email**: plscallmegiorgio@gmail.com

---

**Verzió**: 1.0
**Utolsó frissítés**: 2024. október 17.
**Szerző**: Claude AI asszisztens
