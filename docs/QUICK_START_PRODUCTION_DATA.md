# 🚀 Gyors Útmutató - Production Adatok Feltöltése

**Létrehozva:** 2025-10-22
**Célközönség:** Adminisztrátorok, Fejlesztők

---

## ⚡ 3 Perc Alatt

### 1️⃣ Készíts Mentést
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2️⃣ Készítsd Elő az Adatokat
```bash
cd data/
cp posts.json.example posts.json
cp events.json.example events.json
cp polls.json.example polls.json
cp partners.json.example partners.json

# Szerkeszd a fájlokat a saját adataiddal!
nano posts.json
```

### 3️⃣ Futtasd az Importot
```bash
# Teljes reset + import
npm run db:setup

# VAGY csak import (ha nem akarsz törölni)
npm run db:import
```

✅ **Kész!** Az adatok feltöltve.

---

## 📋 Részletes Lépések

### Opció A: Teljes Reset (Ajánlott)

```bash
# 1. Backup
npm run db:backup

# 2. Töröl MINDENT és újra építi az adatbázist
npm run db:reset

# 3. Importálja az éles adatokat
npm run db:import

# Vagy egyben:
npm run db:setup
```

### Opció B: Csak Tartalom Törlés

```bash
# 1. Backup
npm run db:backup

# 2. Törli a content-et, megtartja a user-eket
npm run db:clean

# 3. Importálja az éles adatokat
npm run db:import
```

---

## 📂 Adatfájl Formátumok

### Hírkategóriák (`data/news-categories.json`)
```json
{
  "categories": [
    {
      "name": "Közlekedés",
      "description": "Közlekedési hírek",
      "color": "#3b82f6",
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

### Bejegyzések (`data/posts.json`)
```json
{
  "posts": [
    {
      "title": "Cím",
      "slug": "url-barat-nev",
      "content": "<p>HTML tartalom</p>",
      "status": "PUBLISHED",
      "categoryName": "Közlekedés"
    }
  ]
}
```

### Események (`data/events.json`)
```json
{
  "events": [
    {
      "title": "Esemény neve",
      "description": "Leírás",
      "location": "Helyszín",
      "startDate": "2025-11-10T10:00:00Z",
      "endDate": "2025-11-10T14:00:00Z",
      "status": "UPCOMING"
    }
  ]
}
```

### Kvízek (`data/quizzes/*.json`)
```json
{
  "title": "Kvíz címe",
  "questions": [
    {
      "question": "Kérdés szövege?",
      "questionType": "MULTIPLE_CHOICE",
      "options": [
        { "optionText": "Válasz 1", "isCorrect": true },
        { "optionText": "Válasz 2", "isCorrect": false }
      ]
    }
  ]
}
```

---

## ✅ Ellenőrzés

```bash
# 1. Nyisd meg Prisma Studio-t
npx prisma studio

# 2. Ellenőrizd a rekordokat:
#    - NewsCategory: van-e 5 kategória?
#    - Post: van-e X bejegyzés?
#    - Event: van-e Y esemény?
#    - Quiz: van-e Z kvíz?

# 3. Teszteld a frontend-et
npm run dev
# Látogasd meg: http://localhost:3000
```

---

## 🆘 Hibaelhárítás

### "No such file or directory: data/posts.json"
```bash
# Másold át a példa fájlokat
cd data
cp *.example posts.json
cp *.example events.json
# stb...
```

### "Unique constraint violation"
```bash
# Duplikált slug vagy email
# Ellenőrizd az adatfájlokat, hogy ne legyenek duplikáltak
```

### "Foreign key constraint failed"
```bash
# Rossz importálási sorrend
# Futtasd újra: npm run db:setup
# Ez helyes sorrendben importálja az adatokat
```

---

## 📊 NPM Scriptek

| Script | Mit csinál |
|--------|------------|
| `npm run db:reset` | Törli az egész adatbázist, újra futtatja a migrationt |
| `npm run db:clean` | Csak a content-et törli (SQL script) |
| `npm run db:import` | Importálja a data/ fájlokat |
| `npm run db:setup` | Reset + Import egyben |

---

## 📖 További Információ

Részletes útmutató: [DATABASE_CLEANUP_AND_IMPORT_GUIDE.md](./DATABASE_CLEANUP_AND_IMPORT_GUIDE.md)

---

**Kérdésed van?** Nyiss issue-t vagy írj emailt: admin@lovaszoltan.hu
