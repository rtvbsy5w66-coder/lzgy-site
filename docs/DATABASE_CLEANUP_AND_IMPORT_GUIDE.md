# 🗄️ Adatbázis Tisztítás és Új Adatok Feltöltése - Részletes Útmutató

**Verzió:** 1.0
**Dátum:** 2025-10-22
**Státusz:** Production Ready

---

## 📋 Tartalomjegyzék

1. [Áttekintés](#áttekintés)
2. [Adatbázis Modellek](#adatbázis-modellek)
3. [Tisztítási Stratégia](#tisztítási-stratégia)
4. [Adatformátumok és Sablonok](#adatformátumok-és-sablonok)
5. [Import Scriptek](#import-scriptek)
6. [Lépésről Lépésre Útmutató](#lépésről-lépésre-útmutató)
7. [Biztonság és Mentés](#biztonság-és-mentés)

---

## 🎯 Áttekintés

### Cél
A teszt adatbázis teljes megtisztítása és éles, production-ready adatok feltöltése.

### Érintett Táblák (50 modell)

#### 🔴 **Kritikus - Éles Adatok Szükségesek**
- `Post` - Blogbejegyzések, hírek
- `NewsCategory` - Hírkategóriák
- `Event` - Események
- `Quiz` - Kvízek
- `Poll` - Szavazások
- `Petition` - Petíciók
- `Partner` - Partnerek
- `Theme` - Téma színek
- `SiteSetting` - Oldal beállítások

#### 🟡 **Közepes - Opcionális**
- `Issue` - Bejelentések (lehet üres)
- `Report` - Riportok (lehet üres)
- `Contact` - Kapcsolatok (üres legyen)

#### 🟢 **Alacsony - User Generated**
- `NewsletterSubscription` - Feliratkozások (üres)
- `Signature` - Aláírások (üres)
- `QuizResult` - Kvíz eredmények (üres)
- `PollVote` - Szavazatok (üres)

#### ⚪ **Rendszer - Megtartandó**
- `User` - Adminisztrátorok
- `Admin` - Admin hozzáférések
- `Account`, `Session` - Auth adatok

---

## 🗑️ Tisztítási Stratégia

### 1. **Teljes Törlés (Recommended)**

```bash
# PostgreSQL teljes reset
npm run db:reset
```

Ez törli az ÖSSZES adatot és újra futtatja a migration-öket.

### 2. **Szelektív Törlés**

```sql
-- User-generated content törlése
DELETE FROM "Signature";
DELETE FROM "QuizResult";
DELETE FROM "QuizAnswer";
DELETE FROM "PollVote";
DELETE FROM "EventRegistration";
DELETE FROM "NewsletterSubscription";
DELETE FROM "IssueNotification";
DELETE FROM "ReportHistory";
DELETE FROM "ReportAttachment";
DELETE FROM "Report";
DELETE FROM "Issue";
DELETE FROM "Contact";

-- Content törlése (de structure marad)
DELETE FROM "Post";
DELETE FROM "Quiz";
DELETE FROM "QuizQuestion";
DELETE FROM "QuizOption";
DELETE FROM "Poll";
DELETE FROM "PollOption";
DELETE FROM "PollResult";
DELETE FROM "Petition";
DELETE FROM "Event";
DELETE FROM "Partner";
DELETE FROM "Slide";

-- Kampányok törlése
DELETE FROM "NewsletterCampaign";
DELETE FROM "CampaignSequence";
DELETE FROM "SequenceEmail";
DELETE FROM "SequenceExecution";
DELETE FROM "SequenceLog";

-- Admin és User MEGTARTÁSA (csak ha szükséges)
-- DELETE FROM "User" WHERE role != 'ADMIN';
-- DELETE FROM "Admin";
```

### 3. **Admin User Megtartása**

```sql
-- Csak az admin user-ek maradnak
DELETE FROM "User" WHERE role != 'ADMIN' AND email NOT IN (
  'admin@lovaszoltan.hu',
  'lovas.zoltan@mindenkimagyarorszaga.hu'
);
```

---

## 📄 Adatformátumok és Sablonok

### 1. **Hírek / Blogbejegyzések** (`Post`)

**Formátum:** JSON
**Fájl:** `data/posts.json`

```json
{
  "posts": [
    {
      "title": "Új közlekedési pályázat indult",
      "slug": "uj-kozlekedesi-palyazat-indult",
      "content": "<p>Részletes tartalom HTML formátumban...</p>",
      "excerpt": "Rövid összefoglaló a bejegyzésről",
      "status": "PUBLISHED",
      "category": "Közlekedés",
      "imageUrl": "/uploads/posts/traffic-project.jpg",
      "publishedAt": "2025-10-22T10:00:00Z"
    }
  ]
}
```

**Mezők:**
- `title` (kötelező) - Cím, max 255 karakter
- `slug` (kötelező, egyedi) - URL-barát név
- `content` (kötelező) - HTML tartalom
- `excerpt` (opcionális) - Rövid összefoglaló
- `status` - `DRAFT` | `PUBLISHED` | `ARCHIVED`
- `category` (opcionális) - Kategória név
- `imageUrl` (opcionális) - Kép URL
- `publishedAt` (opcionális) - Publikálás dátuma

---

### 2. **Hírkategóriák** (`NewsCategory`)

**Formátum:** JSON
**Fájl:** `data/news-categories.json`

```json
{
  "categories": [
    {
      "name": "Közlekedés",
      "description": "Közlekedési hírek és projektek",
      "color": "#3b82f6",
      "isActive": true,
      "sortOrder": 1
    },
    {
      "name": "Oktatás",
      "description": "Oktatással kapcsolatos hírek",
      "color": "#10b981",
      "isActive": true,
      "sortOrder": 2
    }
  ]
}
```

---

### 3. **Kvízek** (`Quiz`)

**Formátum:** JSON
**Fájl:** `data/quizzes/[quiz-name].json`

```json
{
  "title": "Közlekedési ismeretek teszt",
  "description": "Teszteld a közlekedési ismereteidet!",
  "category": "Közlekedés",
  "difficulty": "MEDIUM",
  "timeLimit": 10,
  "maxAttempts": 3,
  "isPublic": true,
  "showResults": true,
  "status": "PUBLISHED",
  "questions": [
    {
      "question": "Mi a maximális sebesség belterületen?",
      "questionType": "MULTIPLE_CHOICE",
      "explanation": "A KRESZ szerint belterületen 50 km/h a megengedett maximális sebesség.",
      "points": 1,
      "required": true,
      "sortOrder": 0,
      "options": [
        {
          "optionText": "40 km/h",
          "isCorrect": false,
          "sortOrder": 0
        },
        {
          "optionText": "50 km/h",
          "isCorrect": true,
          "sortOrder": 1
        },
        {
          "optionText": "60 km/h",
          "isCorrect": false,
          "sortOrder": 2
        }
      ]
    }
  ]
}
```

**Question Types:**
- `MULTIPLE_CHOICE` - Feleletválasztós
- `TRUE_FALSE` - Igaz/Hamis
- `TEXT_INPUT` - Szöveges válasz
- `MULTIPLE_SELECT` - Többszörös választás

---

### 4. **Szavazások** (`Poll`)

**Formátum:** JSON
**Fájl:** `data/polls.json`

```json
{
  "polls": [
    {
      "title": "Melyik közlekedési projektet támogatnád?",
      "description": "Szavazz a legfontosabb közlekedési fejlesztésre!",
      "status": "ACTIVE",
      "participationType": "ANONYMOUS",
      "category": "Közlekedés",
      "startDate": "2025-10-22T00:00:00Z",
      "endDate": "2025-11-22T23:59:59Z",
      "isPublic": true,
      "allowAnonymous": true,
      "showResults": "AFTER_VOTING",
      "showLiveCount": true,
      "options": [
        {
          "text": "Kerékpárút bővítés",
          "description": "Új kerékpárutak építése a városban",
          "sortOrder": 0
        },
        {
          "text": "Tömegközlekedés fejlesztés",
          "description": "Buszok és villamosok modernizálása",
          "sortOrder": 1
        }
      ]
    }
  ]
}
```

---

### 5. **Események** (`Event`)

**Formátum:** JSON
**Fájl:** `data/events.json`

```json
{
  "events": [
    {
      "title": "Közösségi Takarítás",
      "description": "Takarítsuk ki közösen a Dunakorzót!",
      "location": "Dunakorzó, Budapest",
      "startDate": "2025-11-10T10:00:00Z",
      "endDate": "2025-11-10T14:00:00Z",
      "status": "UPCOMING",
      "maxAttendees": 50,
      "imageUrl": "/uploads/events/cleanup.jpg"
    }
  ]
}
```

**Status értékek:**
- `UPCOMING` - Közelgő
- `ONGOING` - Folyamatban
- `COMPLETED` - Befejezett
- `CANCELLED` - Törölt

---

### 6. **Petíciók** (`Petition`)

**Formátum:** JSON
**Fájl:** `data/petitions.json`

```json
{
  "petitions": [
    {
      "title": "Több zöldterület a városban",
      "description": "Követeljük több park és zöldterület létrehozását!",
      "content": "<p>Részletes indoklás...</p>",
      "status": "ACTIVE",
      "categoryId": "[petition-category-id]",
      "targetSignatures": 10000,
      "startDate": "2025-10-22T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z",
      "isPublic": true
    }
  ]
}
```

---

### 7. **Partnerek** (`Partner`)

**Formátum:** JSON
**Fájl:** `data/partners.json`

```json
{
  "partners": [
    {
      "name": "Greenpeace Magyarország",
      "description": "Környezetvédelmi szervezet",
      "logoUrl": "/uploads/partners/greenpeace-logo.png",
      "websiteUrl": "https://www.greenpeace.org/hungary/",
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

---

### 8. **Oldal Beállítások** (`SiteSetting`)

**Formátum:** JSON
**Fájl:** `data/site-settings.json`

```json
{
  "settings": [
    {
      "key": "site_name",
      "value": "Lovas Zoltán Hivatalos Oldala",
      "type": "string"
    },
    {
      "key": "site_description",
      "value": "Politikai programok és részvétel",
      "type": "string"
    },
    {
      "key": "contact_email",
      "value": "info@lovaszoltan.hu",
      "type": "string"
    },
    {
      "key": "maintenance_mode",
      "value": "false",
      "type": "boolean"
    }
  ]
}
```

---

## 🔧 Import Scriptek

### 1. **Általános Import Script**

**Fájl:** `scripts/import-production-data.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting production data import...\n');

  // 1. Import News Categories
  console.log('📁 Importing news categories...');
  const categories = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/news-categories.json'), 'utf-8')
  );
  for (const cat of categories.categories) {
    await prisma.newsCategory.create({ data: cat });
  }
  console.log('✅ News categories imported\n');

  // 2. Import Posts
  console.log('📰 Importing posts...');
  const posts = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/posts.json'), 'utf-8')
  );
  for (const post of posts.posts) {
    await prisma.post.create({ data: post });
  }
  console.log('✅ Posts imported\n');

  // 3. Import Events
  console.log('📅 Importing events...');
  const events = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/events.json'), 'utf-8')
  );
  for (const event of events.events) {
    await prisma.event.create({ data: event });
  }
  console.log('✅ Events imported\n');

  // 4. Import Quizzes
  console.log('❓ Importing quizzes...');
  const quizFiles = fs.readdirSync(path.join(__dirname, '../data/quizzes'));
  for (const file of quizFiles.filter(f => f.endsWith('.json'))) {
    const quiz = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/quizzes', file), 'utf-8')
    );
    await prisma.quiz.create({
      data: {
        ...quiz,
        questions: {
          create: quiz.questions.map((q: any, idx: number) => ({
            ...q,
            sortOrder: idx,
            options: {
              create: q.options
            }
          }))
        }
      }
    });
  }
  console.log('✅ Quizzes imported\n');

  // 5. Import Polls
  console.log('🗳️  Importing polls...');
  const polls = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/polls.json'), 'utf-8')
  );
  for (const poll of polls.polls) {
    await prisma.poll.create({
      data: {
        ...poll,
        options: {
          create: poll.options
        }
      }
    });
  }
  console.log('✅ Polls imported\n');

  // 6. Import Partners
  console.log('🤝 Importing partners...');
  const partners = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/partners.json'), 'utf-8')
  );
  for (const partner of partners.partners) {
    await prisma.partner.create({ data: partner });
  }
  console.log('✅ Partners imported\n');

  console.log('🎉 Production data import completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 📝 Lépésről Lépésre Útmutató

### Előkészületek

```bash
# 1. Készíts biztonsági mentést!
npm run db:backup

# 2. Ellenőrizd a .env fájlt
cat .env.local | grep DATABASE_URL
```

### Tisztítás és Import

```bash
# OPCIÓ A: Teljes reset (Ajánlott)
npm run db:reset
npm run db:push
npm run db:seed:production

# OPCIÓ B: Szelektív törlés
npm run db:clean:content
npm run db:seed:production

# OPCIÓ C: Manuális
psql $DATABASE_URL < scripts/cleanup.sql
npm run db:seed:production
```

### Ellenőrzés

```bash
# 1. Ellenőrizd az adatokat
npm run db:studio

# 2. Teszteld az API-kat
npm run test:api

# 3. Ellenőrizd a frontend-et
npm run dev
```

---

## 🔐 Biztonság és Mentés

### Mentés Készítése

```bash
# PostgreSQL dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Vagy Prisma segítségével
npx prisma db pull
```

### Visszaállítás

```bash
# PostgreSQL restore
psql $DATABASE_URL < backup_20251022_100000.sql
```

### Admin User Védelem

```sql
-- SOHA NE TÖRÖLD az admin user-eket!
SELECT * FROM "User" WHERE role = 'ADMIN';
SELECT * FROM "Admin";

-- Ha mégis törölted, futtasd újra:
npm run seed:admin
```

---

## 📊 Adatvalidáció

### Ellenőrző Lista

- [ ] Minden kötelező mező ki van töltve
- [ ] Slug mezők egyediek
- [ ] Email címek validak
- [ ] Dátumok helyes formátumban (ISO 8601)
- [ ] Status értékek a valid enum-ok közül vannak
- [ ] Foreign key-k létező rekordokra mutatnak
- [ ] Képek URL-jei elérhetők
- [ ] HTML tartalom biztonságos

---

## 🆘 Hibaelhárítás

### Gyakori Hibák

**1. Foreign key violation**
```
Probléma: Nem létező kategóriára hivatkozol
Megoldás: Először importáld a kategóriákat
```

**2. Unique constraint violation**
```
Probléma: Duplikált slug vagy email
Megoldás: Ellenőrizd a uniqueness-t az adatokban
```

**3. Date parsing error**
```
Probléma: Rossz dátum formátum
Megoldás: Használj ISO 8601 formátumot: "2025-10-22T10:00:00Z"
```

---

## 📞 Kapcsolat

Ha kérdésed van, vedd fel a kapcsolatot:
- **Email:** admin@lovaszoltan.hu
- **GitHub:** [Issues](https://github.com/...)

---

**Utolsó frissítés:** 2025-10-22
**Verzió:** 1.0
