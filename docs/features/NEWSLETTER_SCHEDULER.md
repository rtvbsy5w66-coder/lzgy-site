# Newsletter Scheduler Dokumentáció

## Áttekintés

Az automatikus newsletter rendszer lehetővé teszi időzített és ismétlődő hírlevelek küldését. A rendszer campaign-eket hoz létre, amelyek a megadott időpontban automatikusan elküldésre kerülnek.

## Főbb Funkciók

### ✅ Időzített Küldés
- Megadható pontos dátum és időpont
- A kampány SCHEDULED státuszba kerül
- A scheduler automatikusan elküldi a megadott időben

### ✅ Ismétlődő Kampányok
- Heti, havi vagy negyedéves ismétlés
- Automatikus új kampány generálás
- Következő küldési dátum kalkulálása

### ✅ A/B Tesztelés
- Két tárgy verzió tesztelése
- Százalékos felosztás
- Automatikus eredmény tracking

### ✅ Visszaszámláló Timer
- Valós idejű countdown az admin felületen
- Automatikus frissítés 30 másodpercenként
- Státusz követés (Ütemezve, Küldés alatt, Elküldve, Sikertelen)

## Admin Felület

### Scheduled Campaigns Widget
Az admin newsletter oldalon (`/admin/newsletter`) található egy új widget:

- **📊 Kampány áttekintés**: Összes scheduled és sent kampány
- **⏱️ Countdown timer**: Hátralévő idő megjelenítése
- **🔄 Ismétlődés jelzés**: Recurring kampányok megkülönböztetése
- **▶️ Manual trigger**: "Scheduler Futtatása" gomb azonnali futtatáshoz

### Kampány Létrehozás
1. Menj az `/admin/newsletter/compose` oldalra
2. Válaszd a "Ütemezett küldés" vagy "Ismétlődő küldés" opciót
3. Állítsd be a dátumot és időt
4. Válaszd ki a címzetteket
5. Opcionálisan konfiguráld az A/B tesztet

## Automatikus Futtatás

### Script Használata
```bash
# Manuális futtatás
npm run newsletter:schedule

# Vagy közvetlenül
node scripts/schedule-newsletters.js
```

### Cron Job Beállítása
Az automatikus futtatáshoz állíts be egy cron job-ot:

```bash
# Crontab szerkesztése
crontab -e

# 4-óránként futtatás (0, 6, 12, 18 órakor)
0 0,6,12,18 * * * cd /path/to/project && npm run newsletter:schedule

# Vagy 5 percenként (fejlesztéshez)
*/5 * * * * cd /path/to/project && npm run newsletter:schedule
```

### Environment Változók
```bash
NEXTAUTH_URL="https://yourdomain.com"
SCHEDULER_API_KEY="your-secret-scheduler-key"
```

## API Endpoints

### Scheduler Trigger
```http
POST /api/admin/newsletter/scheduler
Content-Type: application/json

{
  "authorization": "your-scheduler-api-key"
}
```

### Kampányok Lekérdezése
```http
GET /api/admin/newsletter/campaigns
Authorization: Admin session required
```

## Működési Logika

### 1. Kampány Állapotok
- **DRAFT**: Szerkesztés alatt
- **SCHEDULED**: Ütemezve, várakozik a küldésre
- **SENDING**: Küldés folyamatban
- **SENT**: Sikeresen elküldve
- **FAILED**: Küldési hiba

### 2. Scheduler Folyamat
1. Megkeresi az összes SCHEDULED kampányt ahol `scheduledAt <= now`
2. Frissíti a státuszt SENDING-re
3. Elküldi az emaileket batch-ekben (10-es csoportokban)
4. Analytics tracking minden egyes emailhez
5. Frissíti a státuszt SENT-re és rögzíti a `sentAt` időpontot
6. Ismétlődő kampányok esetén új kampányt hoz létre

### 3. Email Küldés
- **Resend API** használata
- **Template változók**: `{NAME}`, `{DATE}`, `{MONTH}`, `{YEAR}`
- **Leiratkozás link** minden emailben
- **Batch processing** túlterhelés elkerülésére
- **1 másodperc delay** batch-ek között

## Fejlesztői Jegyzetek

### Adatbázis Modellek
- `NewsletterCampaign`: Fő kampány adatok
- `NewsletterAnalytics`: Email tracking
- `Contact`: Feliratkozók (newsletter: true)
- `NewsletterSubscription`: Dedikált subscription tábla

### Biztonsági Szempontok
- Scheduler API kulcs validálás
- Admin auth minden management endpoint-nál
- SQL injection védelem Prisma által
- Rate limiting a batch küldésnél

## Troubleshooting

### Gyakori Problémák

1. **Kampány nem küldődik el**
   - Ellenőrizd a `scheduledAt` dátumot
   - Futtatd manuálisan: `npm run newsletter:schedule`
   - Nézd meg a logs-okat

2. **Nincs címzett**
   - Ellenőrizd hogy vannak feliratkozók (`newsletter: true`)
   - SELECTED típusnál a `selectedIds` kell hogy valid legyen

3. **Email küldési hiba**
   - Ellenőrizd a `RESEND_API_KEY` környezeti változót
   - Nézd meg a Resend dashboard-ot

### Debug Logok
A scheduler script részletes logokat ír:
```bash
[2025-09-28T13:15:06.966Z] Newsletter scheduler indítása...
[2025-09-28T13:15:07.896Z] ✅ Scheduler sikeresen lefutott:
[2025-09-28T13:15:07.896Z]    - Feldolgozott kampányok: 2
[2025-09-28T13:15:07.896Z]    - Elküldött emailek: 156
```

## Következő Fejlesztések

- [ ] Email delivery status tracking
- [ ] Click tracking
- [ ] Open rate statistics  
- [ ] Campaign performance analytics
- [ ] Template performance comparison
- [ ] Advanced A/B testing results