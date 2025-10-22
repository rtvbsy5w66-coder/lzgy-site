# 🎯 Kétlépcsős Interakciós Modell - Tervezési Dokumentum

## 📋 Áttekintés
A javasolt funkció lehetővé teszi a felhasználók számára, hogy választhassanak az anonim és regisztrált részvétel között szavazások és petíciók esetén.

## 🔄 Interakciós Folyamat

### 1. Első lépés: Részvételi mód kiválasztása
```
┌─────────────────────────────────────────┐
│          RÉSZVÉTELI MÓD VÁLASZTÁS        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │   ANONIM        │ │   REGISZTRÁLT   │ │
│  │   SZAVAZÁS      │ │   RÉSZVÉTEL     │ │
│  │                 │ │                 │ │
│  │ • Gyors         │ │ • Hiteles       │ │
│  │ • Privát        │ │ • Követhető     │ │
│  │ • Egyszerű      │ │ • Kapcsolat     │ │
│  └─────────────────┘ └─────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Második lépés: Anonim vagy Regisztrált űrlap

#### Anonim mód:
- Minimális adatgyűjtés
- Session-alapú követés
- IP-cím és böngésző info (elemzéshez)
- Azonnali eredmény

#### Regisztrált mód:
- Teljes adatgyűjtés
- Email megerősítés
- Hírlevel feliratkozás lehetőség
- Hosszú távú kapcsolattartás

## 🎨 UI/UX Tervezés

### Választási képernyő komponensei:

1. **Fejléc**: "Hogyan szeretne részt venni?"
2. **Két kártya**:
   - Anonim részvétel
   - Regisztrált részvétel
3. **Információs blokk**: Adatvédelem és hasznosság
4. **Folytatás gomb**: Kiválasztott módhoz

### Anonim űrlap:
- Csak a szavazási/petíció tartalom
- Opcionális demográfiai adatok (nem kötelező)
- "Gyors részvétel" üzenet

### Regisztrált űrlap:
- Jelenlegi teljes űrlap
- Plusz opciók: hírlevel, értesítések
- Email megerősítés folyamat

## 🔐 Adatvédelmi Megfontolások

### Anonim mód:
- Minimális adattárolás (session ID, timestamp)
- IP-cím hash-elése
- Automatikus törlés 30 nap után
- GDPR-kompatibilis

### Regisztrált mód:
- Explicit beleegyezés minden adattípushoz
- Részletes adatvédelmi tájékoztató
- Adattörlési jog gyakorlása
- Cookie banner és beállítások

## 📊 Analitikai Követés

### Metrikák:
- Anonim vs regisztrált részvételi arány
- Konverziós ráta (anonim → regisztrált)
- Hosszú távú engagement (regisztrált felhasználók)
- Befejezési arány űrlaponként

### Adatvédelmi szempontok:
- Anonimizált statisztikák
- Aggregált adatok
- Egyéni azonosítók nélkül

## 🚀 Implementációs Lépések

1. **Adatbázis séma frissítése**
2. **UI komponensek fejlesztése**
3. **API végpontok módosítása**
4. **Adatvédelmi logika implementálása**
5. **Analitikai rendszer beállítása**
6. **Tesztelés és validálás**

## ✅ Sikerességi Kritériumok

- Növekedő részvételi arány (+20%)
- Magasabb befejezési ráta (+15%)
- Pozitív felhasználói visszajelzések
- GDPR megfelelőség fenntartása
- Stabil rendszer teljesítmény