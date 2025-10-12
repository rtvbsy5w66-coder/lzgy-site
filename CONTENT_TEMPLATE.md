# Tartalom Feltöltési Sablon

Ez a dokumentum tartalmazza az összes szükséges adatot, amit meg kell adnod a különböző típusú tartalmak létrehozásához.

---

## 📰 HÍREK (Posts)

```json
{
  "title": "A hír címe",
  "slug": "a-hir-cime-url-barat-formaban",
  "content": "A hír teljes HTML tartalma (formázott szöveg)",
  "excerpt": "Rövid kivonat a hírről (1-2 mondat)",
  "category": "Politika | Gazdaság | Társadalom | Kultúra | Korrupció | Sorozatok",
  "imageUrl": "A kép URL-je vagy elérési útja",
  "publishedAt": "2025-01-15T10:00:00Z",
  "featured": true/false,
  "status": "PUBLISHED"
}
```

**Példa:**
```json
{
  "title": "Új gazdasági reformcsomag bejelentése",
  "slug": "uj-gazdasagi-reformcsomag-bejelentese",
  "content": "<p>A kormány ma bejelentette az új gazdasági reformcsomagot...</p>",
  "excerpt": "Átfogó gazdasági változások várhatók a következő hónapokban.",
  "category": "Gazdaság",
  "imageUrl": "/uploads/gazdasag-reform.jpg",
  "publishedAt": "2025-01-15T10:00:00Z",
  "featured": true,
  "status": "PUBLISHED"
}
```

---

## 📅 ESEMÉNYEK (Events)

```json
{
  "title": "Az esemény neve",
  "description": "Részletes HTML leírás az eseményről",
  "location": "Helyszín (város, utca, épület)",
  "startDate": "2025-02-01T18:00:00Z",
  "endDate": "2025-02-01T21:00:00Z",
  "imageUrl": "A kép URL-je vagy elérési útja",
  "maxAttendees": 100,
  "requiresApproval": true/false,
  "status": "UPCOMING"
}
```

**Példa:**
```json
{
  "title": "Közösségi Fórum - Városfejlesztés",
  "description": "<p>Városlakók találkozója a jövő fejlesztési terveiről...</p>",
  "location": "Budapest, Kulturális Központ, Nagyterem",
  "startDate": "2025-02-01T18:00:00Z",
  "endDate": "2025-02-01T21:00:00Z",
  "imageUrl": "/uploads/varosfejlesztes-forum.jpg",
  "maxAttendees": 150,
  "requiresApproval": false,
  "status": "UPCOMING"
}
```

---

## 📊 KVÍZEK (Quizzes)

### Kvíz alapadatok:
```json
{
  "title": "A kvíz címe",
  "description": "Rövid leírás a kvízről",
  "category": "Politika | Történelem | Gazdaság | Jog | Általános",
  "difficulty": "EASY | MEDIUM | HARD | EXPERT",
  "timeLimit": 15,
  "maxAttempts": 3,
  "isPublic": true,
  "showResults": true,
  "status": "PUBLISHED",
  "questions": [...]
}
```

### Kérdések formátuma:
```json
{
  "question": "A kérdés szövege?",
  "type": "SINGLE_CHOICE | MULTIPLE_CHOICE | TRUE_FALSE",
  "points": 10,
  "order": 1,
  "options": [
    {
      "text": "Válaszlehetőség 1",
      "isCorrect": false,
      "order": 1
    },
    {
      "text": "Válaszlehetőség 2",
      "isCorrect": true,
      "order": 2
    }
  ]
}
```

**Teljes példa:**
```json
{
  "title": "Magyar Alkotmány Teszt",
  "description": "Tesztelje tudását a magyar alkotmányról",
  "category": "Jog",
  "difficulty": "MEDIUM",
  "timeLimit": 20,
  "maxAttempts": 2,
  "isPublic": true,
  "showResults": true,
  "status": "PUBLISHED",
  "questions": [
    {
      "question": "Mikor lépett hatályba Magyarország Alaptörvénye?",
      "type": "SINGLE_CHOICE",
      "points": 10,
      "order": 1,
      "options": [
        {"text": "2010. január 1.", "isCorrect": false, "order": 1},
        {"text": "2011. január 1.", "isCorrect": false, "order": 2},
        {"text": "2012. január 1.", "isCorrect": true, "order": 3},
        {"text": "2013. január 1.", "isCorrect": false, "order": 4}
      ]
    },
    {
      "question": "Az Alaptörvény hány fejezetből áll?",
      "type": "SINGLE_CHOICE",
      "points": 10,
      "order": 2,
      "options": [
        {"text": "8", "isCorrect": false, "order": 1},
        {"text": "10", "isCorrect": false, "order": 2},
        {"text": "12", "isCorrect": true, "order": 3},
        {"text": "14", "isCorrect": false, "order": 4}
      ]
    }
  ]
}
```

---

## ✍️ PETÍCIÓK (Petitions)

```json
{
  "title": "A petíció címe",
  "description": "Részletes HTML leírás a petícióról és céljáról",
  "targetSignatures": 5000,
  "category": "Környezetvédelem | Oktatás | Egészségügy | Közlekedés | Egyéb",
  "imageUrl": "A kép URL-je vagy elérési útja",
  "endDate": "2025-06-30T23:59:59Z",
  "status": "ACTIVE"
}
```

**Példa:**
```json
{
  "title": "Több zöldterület a belvárosban",
  "description": "<p>Több park és fasor létrehozását követeljük...</p>",
  "targetSignatures": 10000,
  "category": "Környezetvédelem",
  "imageUrl": "/uploads/zoldterulet-petition.jpg",
  "endDate": "2025-06-30T23:59:59Z",
  "status": "ACTIVE"
}
```

---

## 🗳️ SZAVAZÁSOK (Polls)

```json
{
  "title": "A szavazás címe",
  "description": "Rövid leírás a szavazásról",
  "category": "Helyi | Országos | Szakmai | Véleménykutatás",
  "endDate": "2025-03-31T23:59:59Z",
  "isAnonymous": true/false,
  "allowMultipleVotes": false,
  "status": "ACTIVE",
  "options": [
    {
      "text": "Első lehetőség",
      "order": 1
    },
    {
      "text": "Második lehetőség",
      "order": 2
    }
  ]
}
```

**Példa:**
```json
{
  "title": "Melyik projekt legyen prioritás 2025-ben?",
  "description": "Szavazzon a következő év legfontosabb fejlesztéséről",
  "category": "Helyi",
  "endDate": "2025-03-31T23:59:59Z",
  "isAnonymous": true,
  "allowMultipleVotes": false,
  "status": "ACTIVE",
  "options": [
    {"text": "Új kerékpárút építése", "order": 1},
    {"text": "Óvoda felújítása", "order": 2},
    {"text": "Park megújítása", "order": 3},
    {"text": "Közvilágítás korszerűsítése", "order": 4}
  ]
}
```

---

## 📋 PROGRAM PONTOK (Program Points)

```json
{
  "title": "A program pont címe",
  "description": "Részletes HTML leírás",
  "category": "Gazdaság | Oktatás | Egészségügy | Környezetvédelem | Biztonság | Kultúra",
  "customColor": "#3b82f6",
  "order": 1,
  "isActive": true
}
```

**Példa:**
```json
{
  "title": "Megújuló energia fejlesztése",
  "description": "<p>Napelempark létesítése a városban...</p>",
  "category": "Környezetvédelem",
  "customColor": "#22c55e",
  "order": 1,
  "isActive": true
}
```

---

## 🎨 KATEGÓRIA SZÍNEK (Category Colors)

```json
{
  "category": "Politika | Gazdaság | Társadalom | Kultúra | Korrupció | Sorozatok",
  "color": "#hex-színkód",
  "description": "Rövid leírás a kategóriáról"
}
```

**Példa:**
```json
{
  "category": "Politika",
  "color": "#3b82f6",
  "description": "Politikai hírek és elemzések"
}
```

---

## 📝 HASZNÁLATI ÚTMUTATÓ

### Dátumformátum:
- Használj ISO 8601 formátumot: `YYYY-MM-DDTHH:mm:ssZ`
- Példa: `2025-01-15T10:00:00Z`

### HTML tartalom:
- Használhatsz alapvető HTML tageket: `<p>`, `<h2>`, `<h3>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<li>`, `<a>`
- Példa: `<p>Ez egy <strong>fontos</strong> bekezdés.</p>`

### Képek:
- Add meg a kép URL-jét vagy helyi elérési útját
- Ajánlott méret: minimum 1200x630px hírekhez, 1920x1080px eseményekhez

### Státuszok:
- **DRAFT** - Piszkozat, nem publikus
- **PUBLISHED** - Publikált, mindenki látja
- **ARCHIVED** - Archivált, csak admin látja

### Nehézségi szintek (Kvízek):
- **EASY** - Könnyű (⭐)
- **MEDIUM** - Közepes (⭐⭐)
- **HARD** - Nehéz (⭐⭐⭐)
- **EXPERT** - Haladó (⭐⭐⭐⭐)

---

## 🚀 HOGYAN KÜLDD EL?

Készíts egy JSON vagy Markdown fájlt a fenti sablonok alapján, és töltsd fel ide:

**Fájlnév:** `production-content.json` vagy `production-content.md`

**Struktúra:**
```json
{
  "posts": [...],
  "events": [...],
  "quizzes": [...],
  "petitions": [...],
  "polls": [...],
  "programPoints": [...],
  "categoryColors": [...]
}
```

Vagy küldd el szakaszosan, típusonként külön fájlokban.
