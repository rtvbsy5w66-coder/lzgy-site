# 🚀 Quick Test Guide

## Gyors Start

### Összes teszt futtatása

```bash
npm run test:all
```

### Specifikus tesztek

```bash
# Backend API tesztek
npm run test:backend

# Admin felület tesztek
npm run test:admin

# Felhasználói felület tesztek
npm run test:frontend
```

---

## 📊 Riportok Megtekintése

A tesztek után a riportokat itt találod:

```bash
./test-reports/
├── backend_report_TIMESTAMP.txt      # Backend API részletes riport
├── admin_report_TIMESTAMP.txt        # Admin felület riport
├── frontend_report_TIMESTAMP.txt     # User felület riport
└── summary_report_TIMESTAMP.txt      # Összefoglaló riport
```

### Legutolsó riport megtekintése

```bash
# Összefoglaló riport
cat test-reports/summary_report_*.txt | tail -1

# Backend riport
cat test-reports/backend_report_*.txt | tail -1
```

---

## ✅ Mit tartalmaznak a riportok?

### 1. **Backend API Riport**
- API végpontok tesztelése
- Autentikáció és authorizáció
- Adatbázis műveletek
- File upload tesztek
- Hibakezelés

### 2. **Admin Riport**
- Admin bejelentkezés
- Dashboard hozzáférés
- Content management (CRUD)
- User management
- Analytics

### 3. **Frontend Riport**
- User bejelentkezés (Google OAuth)
- Navigáció
- Petíció aláírás
- Szavazás
- Kvíz kitöltés
- Kapcsolat form

### 4. **Summary Riport**
- Összes teszt összesítése
- Sikeres/sikertelen tesztek száma
- Deployment ready státusz
- Ajánlások

---

## 🎯 Példa Output

```
═══════════════════════════════════════════════════════════════════════════════
              COMPREHENSIVE TEST EXECUTION SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Project: Political Site
Test Execution Date: 2025-10-02 14:30:15
Environment: Development

───────────────────────────────────────────────────────────────────────────────
                        OVERALL STATUS
───────────────────────────────────────────────────────────────────────────────

Status: ✓ ALL TESTS PASSED

───────────────────────────────────────────────────────────────────────────────
                      TEST SUITE BREAKDOWN
───────────────────────────────────────────────────────────────────────────────

Backend API v5:      ✓ PASSED
Admin Frontend:      ✓ PASSED
User Frontend:       ✓ PASSED

───────────────────────────────────────────────────────────────────────────────
                          RECOMMENDATIONS
───────────────────────────────────────────────────────────────────────────────

✓ All tests passed! System is ready for deployment.
✓ Consider running performance tests before production release.

═══════════════════════════════════════════════════════════════════════════════
```

---

## 🔧 Hibakeresés

### Teszt fail esetén

```bash
# Részletes output
npm run test -- --verbose

# Csak egy teszt file
npm run test __tests__/api/posts.test.ts

# Watch mode (újrafut változáskor)
npm run test:watch
```

### Hiányzó jq package

```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

---

## 📖 Részletes Dokumentáció

Teljes dokumentáció: [TEST_EXECUTION_GUIDE.md](./TEST_EXECUTION_GUIDE.md)

---

**Gyors tipp**: Futass `npm run test:all` commit előtt, hogy biztosan minden működik! 🎉
