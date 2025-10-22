# 📁 Production Data Directory

Ez a könyvtár tartalmazza az éles környezetbe feltöltendő adatokat.

## 📝 Használat

1. **Másolj át példa fájlokat:**
   ```bash
   cp posts.json.example posts.json
   cp events.json.example events.json
   cp polls.json.example polls.json
   cp partners.json.example partners.json
   cp quizzes/kozlekedesi-ismeretek.json.example quizzes/kozlekedesi-ismeretek.json
   ```

2. **Szerkeszd a fájlokat:**
   - Töltsd ki a tényleges éles adatokkal
   - Ellenőrizd a formátumot
   - Teszteld a JSON validitását

3. **Importáld az adatokat:**
   ```bash
   npx tsx scripts/import-production-data.ts
   ```

## 📂 Fájl Struktúra

```
data/
├── README.md
├── news-categories.json       ✅ Kész (használható)
├── posts.json.example         📝 Sablon (másold át)
├── events.json.example        📝 Sablon
├── polls.json.example         📝 Sablon
├── partners.json.example      📝 Sablon
├── petitions.json.example     📝 Sablon (opcionális)
└── quizzes/
    └── *.json.example         📝 Sablonok
```

## ⚠️ Fontos

- Az `.example` végű fájlok csak sablonok
- Készítsd el a végleges fájlokat `.example` nélkül
- Az import script a `.example` nélküli fájlokat keresi
- A `news-categories.json` használatra kész

## 🔍 Validáció

Ellenőrizd a fájlokat import előtt:
```bash
# JSON syntax check
cat posts.json | jq . > /dev/null && echo "✅ Valid JSON"

# Import teszt (dry-run)
npx tsx scripts/import-production-data.ts --dry-run
```

## 📊 Statisztikák

Import után ellenőrizd:
```bash
npx prisma studio
```
